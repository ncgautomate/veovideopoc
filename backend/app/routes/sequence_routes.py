"""
Sequence Routes
API endpoints for 60-second sequential video generation
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.models import (
    StoryAnalysisRequest,
    StoryAnalysisResponse,
    SequenceSubmitRequest,
    SequenceSubmitResponse,
    SequenceStatusResponse,
    CompositionGalleryItem
)
from app.services.story_analyzer import story_analyzer
from app.services.sequence_service import sequence_service
from typing import List
from pathlib import Path

router = APIRouter(prefix="/api/sequence", tags=["sequence"])


@router.post("/analyze-story", response_model=StoryAnalysisResponse)
async def analyze_story(request: StoryAnalysisRequest):
    """
    Analyze a story prompt and break it into sequential scene descriptions

    - **story_prompt**: Long-form story description (20-8192 characters)
    - **aspect_ratio**: Video format for shot composition (16:9 or 9:16)
    - **scene_count**: Number of scenes (4 for testing, 8 for full)

    Returns scene descriptions with detailed video prompts
    """
    try:
        # Use story analyzer to generate scenes
        scenes = await story_analyzer.analyze_story(
            story_prompt=request.story_prompt,
            aspect_ratio=request.aspect_ratio,
            scene_count=request.scene_count,
            duration=request.duration,
            default_camera_style=request.default_camera_style,
            default_style_control=request.default_style_control
        )

        # Calculate total duration
        total_duration = sum(scene.duration for scene in scenes)

        return StoryAnalysisResponse(
            scenes=scenes,
            total_duration=total_duration
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze story: {str(e)}"
        )


@router.post("/submit", response_model=SequenceSubmitResponse)
async def submit_sequence(request: SequenceSubmitRequest):
    """
    Submit edited scenes for batch video generation

    - **scenes**: List of 4-8 scene descriptions
    - **resolution**: Video resolution (720p or 1080p)
    - **aspect_ratio**: Video format (16:9 or 9:16)

    Returns composition_id for tracking progress
    """
    try:
        # Validate scene count (4-8)
        if len(request.scenes) < 4 or len(request.scenes) > 8:
            raise HTTPException(
                status_code=400,
                detail=f"4-8 scenes required, got {len(request.scenes)}"
            )

        # Start composition generation in background
        composition_id = await sequence_service.start_composition(
            scenes=request.scenes,
            resolution=request.resolution,
            aspect_ratio=request.aspect_ratio
        )

        return SequenceSubmitResponse(
            composition_id=composition_id,
            status="processing",
            total_segments=len(request.scenes)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start composition: {str(e)}"
        )


@router.get("/status/{composition_id}", response_model=SequenceStatusResponse)
async def get_composition_status(composition_id: str):
    """
    Get current status of a composition being generated

    Returns:
    - composition_id
    - status: pending/generating/stitching/completed/failed
    - current_segment: Which segment is being processed (0-8)
    - segments: List of segment statuses
    - final_video_url: URL when completed
    """
    metadata = sequence_service.get_composition_status(composition_id)

    if not metadata:
        raise HTTPException(
            status_code=404,
            detail=f"Composition {composition_id} not found"
        )

    # Convert metadata to response model
    from app.models import SegmentStatus

    segments = [
        SegmentStatus(**seg) for seg in metadata.get("segments", [])
    ]

    final_video_url = None
    if metadata.get("status") == "completed" and metadata.get("final_video_id"):
        final_video_url = f"/api/sequence/{composition_id}/video"

    return SequenceStatusResponse(
        composition_id=metadata["composition_id"],
        status=metadata["status"],
        current_segment=metadata["current_segment"],
        total_segments=metadata["total_segments"],
        segments=segments,
        final_video_url=final_video_url,
        error=metadata.get("error"),
        created_at=metadata["created_at"],
        completed_at=metadata.get("completed_at")
    )


@router.get("/{composition_id}/video")
async def get_composition_video(composition_id: str):
    """
    Download final stitched 60-second video

    Returns the complete video file with all 8 segments stitched together
    """
    metadata = sequence_service.get_composition_status(composition_id)

    if not metadata:
        raise HTTPException(
            status_code=404,
            detail=f"Composition {composition_id} not found"
        )

    if metadata.get("status") != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Composition not ready. Status: {metadata.get('status')}"
        )

    # Get final video path from metadata
    final_video_path = metadata.get("final_video_path")
    if not final_video_path:
        raise HTTPException(
            status_code=404,
            detail="Final video file not found in metadata"
        )

    video_file = Path(final_video_path)
    if not video_file.exists():
        raise HTTPException(
            status_code=404,
            detail="Final video file not found on disk"
        )

    return FileResponse(
        path=video_file,
        media_type="video/mp4",
        filename=f"composition_{composition_id}.mp4"
    )


@router.get("/gallery", response_model=List[CompositionGalleryItem])
async def list_compositions():
    """
    List all compositions (completed and in-progress)

    Returns list of composition metadata for gallery view
    """
    try:
        compositions_list = sequence_service.list_all_compositions()

        # Convert to CompositionGalleryItem models
        gallery_items = []
        for comp in compositions_list:
            # Get full metadata for story_prompt
            full_metadata = sequence_service.get_composition_status(comp["composition_id"])
            story_prompt = ""
            if full_metadata and full_metadata.get("scenes"):
                # Use first scene as story summary
                story_prompt = full_metadata["scenes"][0].get("prompt", "")[:200]

            gallery_items.append(
                CompositionGalleryItem(
                    composition_id=comp["composition_id"],
                    story_prompt=story_prompt,
                    status=comp["status"],
                    thumbnail_url=None,  # TODO: Generate thumbnails later
                    created_at=comp["created_at"],
                    duration=60
                )
            )

        return gallery_items

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list compositions: {str(e)}"
        )
