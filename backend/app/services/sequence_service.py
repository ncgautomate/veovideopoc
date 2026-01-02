"""
Sequence Service
Orchestrates sequential video generation by managing 4-8 consecutive
8-second segments with frame-to-frame consistency and final stitching
"""

import uuid
import json
import time
import asyncio
from pathlib import Path
from typing import List, Dict, Optional
from app.models import (
    SceneDescription,
    Resolution,
    AspectRatio,
    SegmentStatus,
    SequenceStatusResponse
)
from app.services.video_service import video_service
from app.services.ffmpeg_service import ffmpeg_service


class SequenceService:
    """
    Service to manage composition generation as background tasks
    Handles orchestration of segments (4-8), frame extraction, and stitching
    """

    def __init__(self):
        """Initialize service with compositions storage"""
        self.compositions_path = Path("./compositions")
        self.compositions_path.mkdir(exist_ok=True)

        # In-memory tracking for active compositions
        self.active_compositions: Dict[str, dict] = {}

    async def start_composition(
        self,
        scenes: List[SceneDescription],
        resolution: Resolution,
        aspect_ratio: AspectRatio
    ) -> str:
        """
        Start a new composition generation as a background task

        Args:
            scenes: List of 4-8 scene descriptions
            resolution: Video resolution (720p or 1080p)
            aspect_ratio: Video format (16:9 or 9:16)

        Returns:
            composition_id: Unique identifier for tracking

        """
        # Generate unique composition ID
        composition_id = str(uuid.uuid4())

        # Create composition directory
        comp_dir = self.compositions_path / composition_id
        comp_dir.mkdir(parents=True, exist_ok=True)

        # Initialize composition metadata
        total_segments = len(scenes)
        metadata = {
            "composition_id": composition_id,
            "status": "pending",  # pending → generating → stitching → completed/failed
            "current_segment": 0,
            "total_segments": total_segments,
            "scenes": [scene.dict() for scene in scenes],
            "segments": [
                {
                    "scene_number": i + 1,
                    "status": "pending",
                    "operation_id": None,
                    "video_id": None,
                    "error": None
                }
                for i in range(total_segments)
            ],
            "resolution": resolution.value,
            "aspect_ratio": aspect_ratio.value,
            "final_video_id": None,
            "created_at": time.time(),
            "completed_at": None,
            "error": None
        }

        # Save initial metadata
        self._save_metadata(composition_id, metadata)

        # Store in active compositions
        self.active_compositions[composition_id] = metadata

        # Launch background orchestration task
        asyncio.create_task(self._orchestrate_sequence(composition_id))

        print(f"🎬 Started composition {composition_id}")
        return composition_id

    async def _orchestrate_sequence(self, composition_id: str):
        """
        Background task to orchestrate the full 8-segment generation

        Workflow:
        1. Generate segment 1 (no reference image)
        2. Wait for completion → extract final frame
        3. Generate segment 2 (using segment 1's final frame as reference)
        4. Repeat for segments 3-8
        5. Stitch all segments with crossfades
        6. Mark as completed

        """
        metadata = self.active_compositions.get(composition_id)
        if not metadata:
            print(f"❌ Composition {composition_id} not found in active compositions")
            return

        comp_dir = self.compositions_path / composition_id

        try:
            print(f"\n{'='*60}")
            print(f"🚀 ORCHESTRATING COMPOSITION: {composition_id}")
            print(f"{'='*60}\n")

            metadata["status"] = "generating"
            self._save_metadata(composition_id, metadata)

            previous_frame_path = None
            total_segments = metadata["total_segments"]

            # Generate each segment sequentially
            for idx in range(total_segments):
                scene_number = idx + 1
                scene = metadata["scenes"][idx]

                print(f"\n📹 Generating segment {scene_number}/{total_segments}...")
                print(f"   Prompt: {scene['prompt'][:100]}...")

                metadata["current_segment"] = scene_number
                metadata["segments"][idx]["status"] = "processing"
                self._save_metadata(composition_id, metadata)

                try:
                    # Generate video segment
                    operation_id = await video_service.generate_video(
                        prompt=scene["prompt"],
                        image_path=previous_frame_path,
                        resolution=metadata["resolution"],
                        duration=8,
                        aspect_ratio=metadata["aspect_ratio"]
                    )

                    metadata["segments"][idx]["operation_id"] = operation_id
                    self._save_metadata(composition_id, metadata)

                    # Wait for segment completion (poll video_service)
                    video_id = await self._wait_for_segment_completion(
                        operation_id,
                        max_wait_seconds=600  # 10 minutes max
                    )

                    if video_id:
                        metadata["segments"][idx]["video_id"] = video_id
                        metadata["segments"][idx]["status"] = "completed"
                        print(f"   ✅ Segment {scene_number} completed: {video_id}")

                        # Extract final frame for next segment (except for last segment)
                        if idx < total_segments - 1:
                            print(f"   🖼️  Extracting final frame for next segment...")
                            try:
                                # Get video file path
                                video_path = Path("./videos") / f"{video_id}.mp4"
                                frame_output = comp_dir / f"frame_{scene_number}.jpg"

                                # Extract final frame using FFmpeg
                                previous_frame_path = await ffmpeg_service.extract_final_frame(
                                    video_path=video_path,
                                    output_path=frame_output
                                )

                                print(f"   ✅ Frame extracted: {previous_frame_path.name}")

                            except Exception as frame_error:
                                print(f"   ⚠️  Frame extraction failed: {frame_error}")
                                print(f"   Continuing without reference frame for next segment")
                                previous_frame_path = None

                    else:
                        raise Exception("Video generation returned no video_id")

                except Exception as e:
                    error_msg = str(e)
                    print(f"   ❌ Segment {scene_number} failed: {error_msg}")
                    metadata["segments"][idx]["status"] = "failed"
                    metadata["segments"][idx]["error"] = error_msg

                    # Check if error is retryable (don't retry quota/auth errors)
                    is_retryable = self._is_retryable_error(error_msg)

                    if not is_retryable:
                        print(f"   ⚠️  Error is not retryable. Aborting segment {scene_number}.")
                        raise Exception(error_msg)

                    # Retry logic (up to 3 attempts for retryable errors)
                    retry_count = 0
                    max_retries = 3
                    last_error = error_msg

                    while retry_count < max_retries:
                        retry_count += 1
                        print(f"   🔄 Retrying segment {scene_number} (attempt {retry_count}/{max_retries})...")

                        # Wait a bit before retrying (exponential backoff)
                        wait_time = min(5 * (2 ** (retry_count - 1)), 30)  # 5s, 10s, 20s (max 30s)
                        print(f"   ⏳ Waiting {wait_time}s before retry...")
                        await asyncio.sleep(wait_time)

                        try:
                            operation_id = await video_service.generate_video(
                                prompt=scene["prompt"],
                                image_path=previous_frame_path,
                                resolution=metadata["resolution"],
                                duration=8,
                                aspect_ratio=metadata["aspect_ratio"]
                            )

                            video_id = await self._wait_for_segment_completion(operation_id)

                            if video_id:
                                metadata["segments"][idx]["video_id"] = video_id
                                metadata["segments"][idx]["status"] = "completed"
                                metadata["segments"][idx]["error"] = None
                                print(f"   ✅ Retry successful!")
                                break

                        except Exception as retry_error:
                            last_error = str(retry_error)
                            print(f"   ❌ Retry {retry_count} failed: {last_error}")

                            # Check if new error is retryable
                            if not self._is_retryable_error(last_error):
                                print(f"   ⚠️  Error is not retryable. Stopping retries.")
                                metadata["segments"][idx]["error"] = last_error
                                raise Exception(last_error)

                            if retry_count >= max_retries:
                                detailed_error = f"{last_error} (Failed after {max_retries} retry attempts)"
                                metadata["segments"][idx]["error"] = detailed_error
                                raise Exception(detailed_error)

                self._save_metadata(composition_id, metadata)

            # All segments completed successfully
            print(f"\n🎞️  All {total_segments} segments completed! Starting stitching...")
            metadata["status"] = "stitching"
            self._save_metadata(composition_id, metadata)

            # Stitch segments together with FFmpeg
            try:
                # Collect all segment video paths
                segment_paths = []
                for seg in metadata["segments"]:
                    video_id = seg.get("video_id")
                    if video_id:
                        video_path = Path("./videos") / f"{video_id}.mp4"
                        if video_path.exists():
                            segment_paths.append(video_path)
                        else:
                            print(f"   ⚠️  Segment video not found: {video_path}")

                if len(segment_paths) < total_segments:
                    raise Exception(f"Only {len(segment_paths)}/{total_segments} segment videos found")

                # Stitch with 0.5s crossfade transitions
                final_video_id = str(uuid.uuid4())
                final_video_path = comp_dir / f"final_{final_video_id}.mp4"

                await ffmpeg_service.stitch_segments_with_blending(
                    segment_paths=segment_paths,
                    output_path=final_video_path,
                    transition_duration=0.5
                )

                metadata["final_video_id"] = final_video_id
                metadata["final_video_path"] = str(final_video_path)
                metadata["status"] = "completed"
                metadata["completed_at"] = time.time()

                duration = metadata["completed_at"] - metadata["created_at"]
                print(f"\n🎉 Composition completed in {duration:.1f} seconds!")
                print(f"   Final video: {final_video_path.name}")

            except Exception as stitch_error:
                print(f"   ❌ Stitching failed: {stitch_error}")
                metadata["status"] = "failed"
                metadata["error"] = f"Stitching failed: {str(stitch_error)}"
                raise

        except Exception as e:
            print(f"\n❌ Composition failed: {e}")
            metadata["status"] = "failed"
            metadata["error"] = str(e)

        finally:
            self._save_metadata(composition_id, metadata)
            print(f"{'='*60}\n")

    def _is_retryable_error(self, error_msg: str) -> bool:
        """
        Determine if an error is retryable or should fail immediately

        Args:
            error_msg: The error message from video generation

        Returns:
            True if error is retryable (transient), False if it should fail immediately
        """
        error_lower = error_msg.lower()

        # Don't retry quota/authentication/permission errors - these won't fix themselves
        non_retryable_indicators = [
            "quota exceeded",
            "resource_exhausted",
            "authentication error",
            "invalid api key",
            "permission denied",
            "access denied",
            "model not found",
            "model error",
            "invalid input",
            "401",
            "403"
        ]

        for indicator in non_retryable_indicators:
            if indicator in error_lower:
                return False

        # Retry timeouts, rate limits, network errors, and service errors
        return True

    async def _wait_for_segment_completion(
        self,
        operation_id: str,
        max_wait_seconds: int = 600,
        poll_interval: int = 10
    ) -> Optional[str]:
        """
        Poll video_service until segment generation completes

        Args:
            operation_id: Operation ID from video_service
            max_wait_seconds: Maximum wait time before timeout
            poll_interval: Seconds between status checks

        Returns:
            video_id if successful, None if failed/timeout
        """
        elapsed = 0

        while elapsed < max_wait_seconds:
            status = await video_service.check_status(operation_id)

            if status.get("done"):
                video_id = status.get("video_id")
                if video_id:
                    return video_id
                else:
                    error = status.get("error", "Unknown error")
                    raise Exception(f"Video generation failed: {error}")

            await asyncio.sleep(poll_interval)
            elapsed += poll_interval

        raise Exception(f"Segment generation timed out after {max_wait_seconds} seconds")

    def get_composition_status(self, composition_id: str) -> Optional[Dict]:
        """
        Get current status of a composition

        Returns metadata dict or None if not found
        """
        # Check active compositions first
        if composition_id in self.active_compositions:
            return self.active_compositions[composition_id]

        # Check saved metadata
        metadata_path = self.compositions_path / composition_id / "metadata.json"
        if metadata_path.exists():
            with open(metadata_path, 'r') as f:
                return json.load(f)

        return None

    def _save_metadata(self, composition_id: str, metadata: dict):
        """Save composition metadata to JSON file"""
        comp_dir = self.compositions_path / composition_id
        metadata_path = comp_dir / "metadata.json"

        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)

        # Also update in-memory cache
        self.active_compositions[composition_id] = metadata

    def list_all_compositions(self) -> List[Dict]:
        """
        List all compositions (completed and in-progress)

        Returns list of composition metadata summaries
        """
        compositions = []

        for comp_dir in self.compositions_path.iterdir():
            if comp_dir.is_dir():
                metadata_path = comp_dir / "metadata.json"
                if metadata_path.exists():
                    with open(metadata_path, 'r') as f:
                        metadata = json.load(f)
                        compositions.append({
                            "composition_id": metadata.get("composition_id"),
                            "status": metadata.get("status"),
                            "created_at": metadata.get("created_at"),
                            "completed_at": metadata.get("completed_at"),
                            "total_segments": metadata.get("total_segments"),
                            "current_segment": metadata.get("current_segment")
                        })

        # Sort by created_at descending (newest first)
        compositions.sort(key=lambda x: x.get("created_at", 0), reverse=True)

        return compositions


# Global instance
sequence_service = SequenceService()
