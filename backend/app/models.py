from pydantic import BaseModel, Field
from typing import Optional
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
    message: str = Field(..., max_length=2000)
    conversation_history: Optional[list] = None


class ChatResponse(BaseModel):
    response: str
    conversation_history: list
