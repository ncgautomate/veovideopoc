from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class Resolution(str, Enum):
    P720 = "720p"
    P1080 = "1080p"


class AspectRatio(str, Enum):
    LANDSCAPE = "16:9"
    PORTRAIT = "9:16"


class Duration(int, Enum):
    FOUR = 4
    SIX = 6
    EIGHT = 8


class VideoGenerationRequest(BaseModel):
    prompt: str = Field(..., max_length=4096)  # Veo 3.1 supports up to 4096 characters
    image_id: Optional[str] = None  # Image is optional - can generate from prompt only
    negative_prompt: Optional[str] = None
    resolution: Resolution = Resolution.P720
    duration: Duration = Duration.EIGHT
    aspect_ratio: AspectRatio = AspectRatio.LANDSCAPE


class VideoGenerationResponse(BaseModel):
    operation_id: str
    status: str = "processing"


class VideoStatusResponse(BaseModel):
    done: bool
    status: str
    video_url: Optional[str] = None
    error: Optional[str] = None


class PromptOptimizationRequest(BaseModel):
    original_prompt: str = Field(..., max_length=4096)  # Veo 3.1 supports up to 4096 characters
    additional_details: Optional[str] = None
    mood: Optional[str] = None
    camera_style: Optional[str] = None
    audio_style: Optional[str] = None


class PromptOptimizationResponse(BaseModel):
    optimized_prompt: str
    original_prompt: str


class ChatMessage(BaseModel):
    message: str = Field(..., max_length=10000)
    conversation_history: Optional[list] = None


class ChatResponse(BaseModel):
    response: str
    conversation_history: list


# ========================================
# Sequence / 60-Second Video Models
# ========================================

class SceneDescription(BaseModel):
    scene_number: int = Field(..., ge=1, le=8)
    prompt: str = Field(..., min_length=10, max_length=4096)
    duration: int = Field(default=8, ge=4, le=8)  # Variable duration: 4, 6, or 8 seconds
    camera_style: Optional[str] = Field(default=None, max_length=500)  # Optional camera movement/angle
    style_control: Optional[str] = Field(default=None, max_length=500)  # Optional visual style


class StoryAnalysisRequest(BaseModel):
    story_prompt: str = Field(..., min_length=20, max_length=8192)
    aspect_ratio: AspectRatio = AspectRatio.LANDSCAPE
    scene_count: int = Field(default=4, ge=4, le=8)  # Flexible scene count: 4-8 scenes
    duration: int = Field(default=8, ge=4, le=8)  # Duration per scene: 4, 6, or 8 seconds
    default_camera_style: Optional[str] = Field(default=None, max_length=500)  # Optional default camera for all scenes
    default_style_control: Optional[str] = Field(default=None, max_length=500)  # Optional default visual style for all scenes


class StoryAnalysisResponse(BaseModel):
    scenes: List[SceneDescription]
    total_duration: int  # Total seconds (8 * 8 = 64)


class SequenceSubmitRequest(BaseModel):
    scenes: List[SceneDescription] = Field(..., min_length=4, max_length=8)
    resolution: Resolution = Resolution.P720
    aspect_ratio: AspectRatio = AspectRatio.LANDSCAPE
    duration: int = Field(default=8, ge=4, le=8)  # Duration per scene


class SequenceSubmitResponse(BaseModel):
    composition_id: str
    status: str = "processing"
    total_segments: int = 8


class SegmentStatus(BaseModel):
    scene_number: int
    status: str  # pending, processing, completed, failed
    operation_id: Optional[str] = None
    video_id: Optional[str] = None
    error: Optional[str] = None


class SequenceStatusResponse(BaseModel):
    composition_id: str
    status: str  # analyzing, generating, stitching, completed, failed
    current_segment: int  # 0-8 (0 = not started, 8 = all segments done)
    total_segments: int = 8
    segments: List[SegmentStatus]
    final_video_url: Optional[str] = None
    error: Optional[str] = None
    created_at: float
    completed_at: Optional[float] = None


class CompositionGalleryItem(BaseModel):
    composition_id: str
    story_prompt: str
    status: str
    thumbnail_url: Optional[str] = None
    created_at: float
    duration: int = 60  # Approximate final duration
