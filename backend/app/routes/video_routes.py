import os
import uuid
import json
import asyncio
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from app.models import (
    VideoGenerationRequest,
    VideoGenerationResponse,
    VideoStatusResponse,
    PromptOptimizationRequest,
    PromptOptimizationResponse,
    ChatMessage,
    ChatResponse
)
from app.services.video_service import video_service
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api", tags=["video"])

# Temporary storage for uploaded images
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload-image", response_model=dict)
async def upload_image(file: UploadFile = File(...)):
    """
    Upload and validate image file

    - Accepts PNG or JPEG images
    - Maximum file size: 20MB
    - Returns image_id for use in video generation
    """

    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="File must be an image (PNG or JPEG)"
        )

    # Read file contents
    contents = await file.read()

    # Validate file size
    if len(contents) > settings.max_file_size:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {settings.max_file_size / 1024 / 1024}MB limit"
        )

    # Generate unique image ID
    image_id = str(uuid.uuid4())

    # Determine file extension
    file_extension = "jpg"
    if file.filename:
        ext = file.filename.split(".")[-1].lower()
        if ext in ["png", "jpg", "jpeg"]:
            file_extension = ext

    # Save file temporarily
    image_path = UPLOAD_DIR / f"{image_id}.{file_extension}"

    with open(image_path, "wb") as f:
        f.write(contents)

    return {
        "image_id": image_id,
        "filename": file.filename,
        "size": len(contents),
        "message": "Image uploaded successfully"
    }


@router.post("/generate-video", response_model=VideoGenerationResponse)
async def generate_video(request: VideoGenerationRequest):
    """
    Start video generation process

    - Image is optional - can generate from prompt only
    - If image_id provided, uses it to guide video generation
    - Accepts prompt and optional parameters
    - Returns operation_id for polling status
    - Video generation takes 11 seconds to 6 minutes
    """

    # Handle optional image
    image_path = None
    if request.image_id:
        # Find uploaded image
        image_files = list(UPLOAD_DIR.glob(f"{request.image_id}.*"))

        if not image_files:
            raise HTTPException(
                status_code=404,
                detail="Image not found. Please upload image first using /api/upload-image"
            )

        image_path = str(image_files[0])

    # Start video generation
    try:
        operation_id = await video_service.generate_video(
            image_path=image_path,
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            resolution=request.resolution.value,
            duration=request.duration.value,
            aspect_ratio=request.aspect_ratio.value
        )

        return VideoGenerationResponse(
            operation_id=operation_id,
            status="processing"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Video generation failed: {str(e)}"
        )


@router.get("/video-status/{operation_id}", response_model=VideoStatusResponse)
async def get_video_status(operation_id: str):
    """
    Check video generation status

    - Poll this endpoint every 10 seconds
    - Returns done=true when video is ready
    - Provides video_url when complete
    - May return error if generation failed
    """

    try:
        result = await video_service.check_status(operation_id)
        return VideoStatusResponse(**result)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to check status: {str(e)}"
        )


@router.get("/videos/{video_id}")
async def get_video(video_id: str):
    """
    Retrieve generated video file

    - Downloads the generated video
    - Supports video streaming and range requests
    - Returns MP4 file with audio
    """

    video_path = video_service.get_video_path(video_id)

    # Check if video file exists
    if not video_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Video not found. It may have been deleted or the ID is invalid."
        )

    # Return video file with proper media type
    return FileResponse(
        path=video_path,
        media_type="video/mp4",
        filename=f"generated_video_{video_id}.mp4"
    )


@router.get("/videos")
async def list_videos():
    """
    List all generated videos

    - Returns list of all videos with metadata
    - Includes video ID, filename, size, creation time, and prompt information
    """
    import json
    video_dir = Path(settings.video_storage_path)
    videos = []

    if video_dir.exists():
        for video_file in video_dir.glob("*.mp4"):
            stat = video_file.stat()
            video_id = video_file.stem

            # Load metadata if exists
            metadata_path = video_dir / f"{video_id}.json"
            metadata = None
            if metadata_path.exists():
                try:
                    with open(metadata_path, 'r') as f:
                        metadata = json.load(f)
                except:
                    metadata = None

            video_data = {
                "id": video_id,
                "filename": video_file.name,
                "size": stat.st_size,
                "created_at": stat.st_ctime,
                "modified_at": stat.st_mtime
            }

            # Add metadata if available
            if metadata:
                video_data["prompt"] = metadata.get("prompt")
                video_data["negative_prompt"] = metadata.get("negative_prompt")
                video_data["resolution"] = metadata.get("resolution")
                video_data["duration"] = metadata.get("duration")
                video_data["aspect_ratio"] = metadata.get("aspect_ratio")
                video_data["has_image"] = metadata.get("has_image", False)
                video_data["is_public"] = metadata.get("is_public", False)

            videos.append(video_data)

    # Sort by creation time, newest first
    videos.sort(key=lambda x: x['created_at'], reverse=True)

    return {
        "videos": videos,
        "count": len(videos)
    }


@router.delete("/videos/{video_id}")
async def delete_video(video_id: str):
    """
    Delete a generated video

    - Permanently removes the video file and metadata from storage
    - Returns success status
    """
    video_path = video_service.get_video_path(video_id)

    if not video_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Video not found"
        )

    try:
        video_path.unlink()  # Delete the video file

        # Also delete metadata file if exists
        metadata_path = Path(settings.video_storage_path) / f"{video_id}.json"
        if metadata_path.exists():
            metadata_path.unlink()

        return {
            "success": True,
            "message": f"Video {video_id} deleted successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete video: {str(e)}"
        )


@router.get("/library")
async def get_public_library():
    """
    Get all public videos (Community Library)

    - Returns only videos marked as public
    - Includes video metadata, prompts, and parameters
    - Sorted by creation time, newest first
    """
    import json
    video_dir = Path(settings.video_storage_path)
    public_videos = []

    if video_dir.exists():
        for video_file in video_dir.glob("*.mp4"):
            stat = video_file.stat()
            video_id = video_file.stem

            # Load metadata if exists
            metadata_path = video_dir / f"{video_id}.json"
            if metadata_path.exists():
                try:
                    with open(metadata_path, 'r') as f:
                        metadata = json.load(f)

                    # Only include public videos
                    if metadata.get("is_public", False):
                        video_data = {
                            "id": video_id,
                            "filename": video_file.name,
                            "size": stat.st_size,
                            "created_at": stat.st_ctime,
                            "modified_at": stat.st_mtime,
                            "prompt": metadata.get("prompt"),
                            "negative_prompt": metadata.get("negative_prompt"),
                            "resolution": metadata.get("resolution"),
                            "duration": metadata.get("duration"),
                            "aspect_ratio": metadata.get("aspect_ratio"),
                            "has_image": metadata.get("has_image", False),
                            "is_public": True
                        }
                        public_videos.append(video_data)
                except:
                    pass

    # Sort by creation time, newest first
    public_videos.sort(key=lambda x: x['created_at'], reverse=True)

    return {
        "videos": public_videos,
        "count": len(public_videos)
    }


@router.patch("/videos/{video_id}/visibility")
async def toggle_video_visibility(video_id: str, is_public: bool):
    """
    Toggle video visibility (public/private)

    - Updates the is_public field in video metadata
    - Public videos appear in the community library
    - Private videos only appear in My Videos
    """
    import json
    video_dir = Path(settings.video_storage_path)
    metadata_path = video_dir / f"{video_id}.json"

    if not metadata_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Video metadata not found"
        )

    try:
        # Read existing metadata
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)

        # Update visibility
        metadata["is_public"] = is_public

        # Write back to file
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)

        return {
            "success": True,
            "video_id": video_id,
            "is_public": is_public,
            "message": f"Video is now {'public' if is_public else 'private'}"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update visibility: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """
    Health check endpoint

    - Verifies API is running
    - Returns status information
    """
    return {
        "status": "healthy",
        "service": "CleverCreator.ai Video Generation API",
        "version": "1.0.0"
    }


@router.get("/models")
async def get_models_info():
    """
    Get information about AI models being used

    - Shows which models are configured for different functions
    - Useful for debugging and transparency
    """
    return {
        "models": {
            "video_generation": {
                "model": settings.video_model,
                "description": "Used for generating videos from prompts",
                "provider": "Google Veo 3.1"
            },
            "chat_assistant": {
                "model": settings.chat_model,
                "description": "Used for AI chat conversations",
                "provider": "Google Gemini"
            },
            "prompt_optimization": {
                "model": settings.optimize_model,
                "description": "Used for enhancing video prompts",
                "provider": "Google Gemini"
            }
        },
        "configuration": {
            "video_model": settings.video_model,
            "chat_model": settings.chat_model,
            "optimize_model": settings.optimize_model
        }
    }


@router.post("/optimize-prompt", response_model=PromptOptimizationResponse)
async def optimize_prompt(request: PromptOptimizationRequest):
    """
    Optimize video generation prompt using AI

    - Takes original prompt and additional context
    - Uses AI to enhance prompt with cinematic details
    - Returns optimized prompt for better video generation
    - Considers mood, camera style, audio style, and additional details
    """
    import google.generativeai as genai
    import traceback

    print("\n" + "=" * 60)
    print("OPTIMIZE ENDPOINT HIT")
    print("=" * 60)
    print(f"Request received at /api/optimize-prompt")
    print(f"Original prompt: {request.original_prompt[:100]}...")
    print(f"Prompt length: {len(request.original_prompt)} characters")
    print(f"Additional details: {request.additional_details[:50] if request.additional_details else 'None'}...")
    print(f"Mood: {request.mood}")
    print(f"Camera style: {request.camera_style}")
    print(f"Audio style: {request.audio_style}")
    print(f"API Key present: {bool(settings.gemini_api_key)}")
    print(f"API Key length: {len(settings.gemini_api_key) if settings.gemini_api_key else 0}")

    try:
        # Configure Gemini API
        print(f"\nConfiguring Gemini API...")
        genai.configure(api_key=settings.gemini_api_key)
        print(f"API configured successfully")
        print(f"Using model: {settings.optimize_model}")

        # Create model with system instruction
        print(f"Creating Gemini model...")
        model = genai.GenerativeModel(
            model_name=settings.optimize_model,
            system_instruction="""You are an expert video generation prompt engineer specializing in Google Veo 3.1.
Your task is to enhance video prompts to maximize quality and cinematic appeal.

Guidelines:
1. Enhance prompts with vivid, specific details about:
   - Subject description and appearance
   - Actions and movements
   - Visual style and aesthetics
   - Camera angles, movements, and framing
   - Lighting and atmosphere
   - Audio elements and soundscape
   - Color palette and mood

2. Keep prompts under 4096 characters (Veo 3.1 maximum)
3. Be specific and descriptive
4. Use cinematic language
5. Focus on visual and audio details that Veo 3.1 can generate
6. Maintain the original intent while enhancing quality
7. Incorporate user's additional requirements seamlessly

Return ONLY the optimized prompt, nothing else."""
        )
        print(f"Model created successfully")

        # Build user context
        user_context_parts = [f"Original prompt: {request.original_prompt}"]

        if request.additional_details:
            user_context_parts.append(f"Additional requirements: {request.additional_details}")
        if request.mood:
            user_context_parts.append(f"Desired mood/tone: {request.mood}")
        if request.camera_style:
            user_context_parts.append(f"Camera style: {request.camera_style}")
        if request.audio_style:
            user_context_parts.append(f"Audio style: {request.audio_style}")

        user_context = "\n\n".join(user_context_parts)
        full_prompt = user_context + "\n\nEnhance this prompt for optimal Veo 3.1 video generation:"

        print(f"\nSending request to Gemini...")
        print(f"Full prompt length: {len(full_prompt)} characters")

        # Generate optimized prompt using Gemini
        response = model.generate_content(full_prompt)

        print(f"Gemini response received")

        optimized = response.text.strip()
        print(f"Optimized prompt length: {len(optimized)} characters")
        print(f"Response preview: {optimized[:100]}...")

        # Ensure it's within Veo 3.1 character limit
        if len(optimized) > 4096:
            optimized = optimized[:4093] + "..."
            print("Truncated to 4096 characters")

        print("Optimization complete!")

        return PromptOptimizationResponse(
            optimized_prompt=optimized,
            original_prompt=request.original_prompt
        )

    except Exception as e:
        print("\n" + "=" * 60)
        print("OPTIMIZE ERROR OCCURRED")
        print("=" * 60)
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"Full traceback:")
        print(traceback.format_exc())
        print("=" * 60)

        raise HTTPException(
            status_code=500,
            detail=f"Optimization failed: {type(e).__name__}: {str(e)}"
        )


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatMessage):
    """
    Chat with AI assistant about video prompts and ideas (non-streaming version)

    - Conversational interface with Gemini
    - Helps brainstorm video ideas, refine prompts, answer questions
    - Maintains conversation history for context
    - Returns AI response and updated conversation history
    """
    import google.generativeai as genai
    import traceback

    print("\n" + "=" * 60)
    print("CHAT ENDPOINT HIT")
    print("=" * 60)
    print(f"Request received at /api/chat")
    print(f"Message: {request.message[:100]}...")
    print(f"History length: {len(request.conversation_history) if request.conversation_history else 0}")

    try:
        # Configure Gemini API
        genai.configure(api_key=settings.gemini_api_key)

        # Create Gemini model with system instruction
        model = genai.GenerativeModel(
            model_name=settings.chat_model,
            system_instruction="""You are a helpful AI assistant specializing in video generation with Google Veo 3.1.

Your role:
- Help users brainstorm creative video ideas
- Refine and improve video prompts for better results
- Answer questions about Veo 3.1 capabilities
- Suggest improvements to prompts (camera angles, lighting, mood, audio, etc.)
- Be concise but helpful
- Focus on actionable, specific advice

Veo 3.1 capabilities:
- Generates 8-second videos at 720p or 1080p
- Supports 16:9 and 9:16 aspect ratios
- Can work with or without reference images
- Generates native audio with the video
- Best results with detailed, cinematic descriptions

When users ask for prompt suggestions, provide them in a clear, formatted way that they can easily copy."""
        )

        # Build conversation history for Gemini chat
        history = []
        if request.conversation_history:
            for msg in request.conversation_history:
                history.append({
                    "role": msg["role"],
                    "parts": [msg["content"]]
                })

        # Start chat with history
        chat = model.start_chat(history=history)

        # Send message and get response
        response = chat.send_message(request.message)

        ai_response = response.text.strip()

        # Build updated conversation history
        messages = []
        if request.conversation_history:
            messages.extend(request.conversation_history)
        messages.append({"role": "user", "content": request.message})
        messages.append({"role": "model", "content": ai_response})

        return ChatResponse(
            response=ai_response,
            conversation_history=messages
        )

    except Exception as e:
        print("\n" + "=" * 60)
        print("CHAT ERROR OCCURRED")
        print("=" * 60)
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"Full traceback:")
        print(traceback.format_exc())
        print("=" * 60)

        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {type(e).__name__}: {str(e)}"
        )


@router.post("/chat/stream")
async def chat_with_ai_stream(request: ChatMessage):
    """
    Streaming chat with AI assistant - shows thinking process and steps

    Returns Server-Sent Events (SSE) stream with:
    - Thinking steps
    - Action details
    - Final response
    """
    import google.generativeai as genai

    async def event_generator():
        try:
            # Send initial thinking step
            yield f"data: {json.dumps({'type': 'thinking', 'content': 'Analyzing your question...'})}\n\n"
            await asyncio.sleep(0.3)

            # Configure Gemini API
            yield f"data: {json.dumps({'type': 'action', 'content': 'Connecting to Gemini AI...'})}\n\n"
            genai.configure(api_key=settings.gemini_api_key)
            await asyncio.sleep(0.2)

            # Create model
            yield f"data: {json.dumps({'type': 'action', 'content': 'Loading video generation knowledge base...'})}\n\n"
            model = genai.GenerativeModel(
                model_name=settings.chat_model,
                system_instruction="""You are a helpful AI assistant specializing in video generation with Google Veo 3.1.

Your role:
- Help users brainstorm creative video ideas
- Refine and improve video prompts for better results
- Answer questions about Veo 3.1 capabilities
- Suggest improvements to prompts (camera angles, lighting, mood, audio, etc.)
- Be concise but helpful
- Focus on actionable, specific advice

Veo 3.1 capabilities:
- Generates 8-second videos at 720p or 1080p
- Supports 16:9 and 9:16 aspect ratios
- Can work with or without reference images
- Generates native audio with the video
- Best results with detailed, cinematic descriptions

When users ask for prompt suggestions, provide them in a clear, formatted way that they can easily copy."""
            )
            await asyncio.sleep(0.2)

            # Build conversation history
            history = []
            if request.conversation_history:
                yield f"data: {json.dumps({'type': 'action', 'content': f'Loading {len(request.conversation_history)} previous messages...'})}\n\n"
                for msg in request.conversation_history:
                    history.append({
                        "role": msg["role"],
                        "parts": [msg["content"]]
                    })
                await asyncio.sleep(0.2)

            # Start chat
            yield f"data: {json.dumps({'type': 'thinking', 'content': 'Processing your request...'})}\n\n"
            chat = model.start_chat(history=history)
            await asyncio.sleep(0.3)

            # Send message with streaming
            yield f"data: {json.dumps({'type': 'action', 'content': 'Generating response...'})}\n\n"
            await asyncio.sleep(0.3)

            # Stream the response
            response = chat.send_message(request.message, stream=True)

            full_response = ""
            for chunk in response:
                if chunk.text:
                    full_response += chunk.text
                    yield f"data: {json.dumps({'type': 'content', 'content': chunk.text})}\n\n"
                    await asyncio.sleep(0.05)  # Small delay for smooth streaming

            # Send completion
            yield f"data: {json.dumps({'type': 'done', 'content': full_response})}\n\n"

        except Exception as e:
            error_msg = f"Error: {str(e)}"
            yield f"data: {json.dumps({'type': 'error', 'content': error_msg})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )
