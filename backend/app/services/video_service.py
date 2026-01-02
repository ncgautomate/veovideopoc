import os
import time
import uuid
import mimetypes
import base64
import json
from pathlib import Path
from google import genai
from google.genai import types
from app.config import get_settings

settings = get_settings()


class VideoGenerationService:
    """Service for handling Veo 3.1 video generation"""

    def __init__(self):
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.storage_path = Path(settings.video_storage_path)
        self.storage_path.mkdir(exist_ok=True)
        self.operations = {}  # Store operation states in-memory

    async def generate_video(
        self,
        image_path: str,
        prompt: str,
        negative_prompt: str = None,
        resolution: str = "720p",
        duration: int = 8,
        aspect_ratio: str = "16:9"
    ) -> str:
        """
        Initiate video generation and return operation ID

        Args:
            image_path: Path to the uploaded image file
            prompt: Text description for video generation
            negative_prompt: Optional elements to exclude
            resolution: "720p" or "1080p"
            duration: 4, 6, or 8 seconds
            aspect_ratio: "16:9" or "9:16"

        Returns:
            operation_id: Unique ID for polling status
        """

        # Handle optional image
        image_obj = None
        if image_path:
            # Read image file as bytes
            with open(image_path, 'rb') as f:
                image_bytes = f.read()

            # Determine MIME type from file extension
            mime_type, _ = mimetypes.guess_type(image_path)
            if not mime_type:
                mime_type = 'image/jpeg'  # Default fallback

            # Create Image object with proper structure for Veo 3.1
            image_obj = types.Image(
                image_bytes=image_bytes,
                mime_type=mime_type
            )

        # Build configuration object for Veo 3.1
        config_params = {
            "number_of_videos": 1,
            "duration_seconds": duration,
            "aspect_ratio": aspect_ratio,
            "resolution": resolution,
        }

        # Add optional negative prompt to config if provided
        if negative_prompt:
            config_params["negative_prompt"] = negative_prompt

        # Create config object
        config = types.GenerateVideosConfig(**config_params)

        # Build generate_videos parameters
        generate_params = {
            "model": settings.video_model,
            "prompt": prompt,
            "config": config,
        }

        # Only add image if provided
        if image_obj:
            generate_params["image"] = image_obj

        # Call the Veo API
        operation = self.client.models.generate_videos(**generate_params)

        # Generate unique operation ID and store operation info
        operation_id = str(uuid.uuid4())
        self.operations[operation_id] = {
            "operation": operation,
            "status": "processing",
            "started_at": time.time(),
            "video_id": None,
            "metadata": {
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "resolution": resolution,
                "duration": duration,
                "aspect_ratio": aspect_ratio,
                "has_image": image_path is not None,
                "is_public": False  # Default to private, can be changed later
            }
        }

        return operation_id

    async def check_status(self, operation_id: str) -> dict:
        """
        Check video generation status and download when ready

        Args:
            operation_id: The operation ID returned from generate_video

        Returns:
            dict with keys: done, status, video_url (if done), error (if failed)
        """

        # Check if operation exists
        if operation_id not in self.operations:
            return {
                "done": False,
                "status": "not_found",
                "error": "Operation not found"
            }

        op_data = self.operations[operation_id]

        # If already completed, return cached result
        if op_data.get("video_id"):
            return {
                "done": True,
                "status": "completed",
                "video_url": f"/api/videos/{op_data['video_id']}"
            }

        # If already failed, return cached error
        if op_data.get("error"):
            return {
                "done": True,
                "status": "failed",
                "error": op_data["error"]
            }

        operation = op_data["operation"]

        # Refresh operation status from Google API
        try:
            operation = self.client.operations.get(operation)
        except Exception as e:
            error_msg = f"Failed to check operation status: {str(e)}"
            op_data["error"] = error_msg
            return {
                "done": True,
                "status": "failed",
                "error": error_msg
            }

        # Update operation reference
        op_data["operation"] = operation

        # Check if still processing
        if not operation.done:
            elapsed = time.time() - op_data["started_at"]
            return {
                "done": False,
                "status": f"processing ({int(elapsed)}s elapsed)",
                "video_url": None
            }

        # Video is ready - download and save
        try:
            # Get the generated video from response
            video = operation.response.generated_videos[0]

            # Generate unique video ID
            video_id = str(uuid.uuid4())
            video_path = self.storage_path / f"{video_id}.mp4"

            # Download video from Google servers
            self.client.files.download(file=video.video)

            # Save to local storage
            video.video.save(str(video_path))

            # Save metadata alongside video
            metadata_path = self.storage_path / f"{video_id}.json"
            metadata = {
                **op_data["metadata"],
                "video_id": video_id,
                "created_at": time.time(),
                "filename": f"{video_id}.mp4"
            }
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)

            # Update operation status
            op_data["status"] = "completed"
            op_data["video_id"] = video_id

            return {
                "done": True,
                "status": "completed",
                "video_url": f"/api/videos/{video_id}"
            }

        except Exception as e:
            error_msg = f"Failed to download video: {str(e)}"
            op_data["error"] = error_msg
            return {
                "done": True,
                "status": "failed",
                "error": error_msg
            }

    def get_video_path(self, video_id: str) -> Path:
        """
        Get path to stored video file

        Args:
            video_id: The unique video identifier

        Returns:
            Path object to the video file
        """
        return self.storage_path / f"{video_id}.mp4"


# Singleton instance
video_service = VideoGenerationService()
