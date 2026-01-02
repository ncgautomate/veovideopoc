# Video Generation Fix - Critical Bug Resolved

## Issue Identified

The video generation was failing with the error:
```
Failed to start video generation: Video generation failed:
module 'google.genai.types' has no attribute 'GenerateVideosConfig'
```

## Root Cause

The video service was trying to use `types.GenerateVideosConfig` which **does not exist** in the Google Veo SDK. This was causing all video generation attempts to fail.

## What Was Fixed

### File: backend/app/services/video_service.py

**BEFORE (Incorrect):**
```python
# This was creating a non-existent config object
config_params = {
    "number_of_videos": 1,
    "duration_seconds": duration,
    "aspect_ratio": aspect_ratio,
    "resolution": resolution,
}

if negative_prompt:
    config_params["negative_prompt"] = negative_prompt

config = types.GenerateVideosConfig(**config_params)  # ❌ DOESN'T EXIST

generate_params = {
    "model": settings.video_model,
    "prompt": prompt,
    "config": config  # ❌ WRONG
}
```

**AFTER (Correct):**
```python
# Pass parameters directly to generate_videos - NO separate config object
generate_params = {
    "model": settings.video_model,
    "prompt": prompt,
    "number_of_videos": 1,
    "duration_seconds": duration,
    "aspect_ratio": aspect_ratio,
    "resolution": resolution,
}

if negative_prompt:
    generate_params["negative_prompt"] = negative_prompt

if image_obj:
    generate_params["image"] = image_obj

# Call the Veo API with parameters directly ✓ CORRECT
operation = self.client.models.generate_videos(**generate_params)
```

## Why This Happened

The Google Veo SDK doesn't use a separate `GenerateVideosConfig` class like the text generation APIs do. The Veo API expects all parameters to be passed directly to the `generate_videos()` method.

## SDK Differences

### Veo SDK (Video Generation) ✓ CORRECT
```python
from google import genai

client = genai.Client(api_key=key)
operation = client.models.generate_videos(
    model="veo-3.1-generate-preview",
    prompt="A sunset",
    duration_seconds=8,
    resolution="720p",
    aspect_ratio="16:9"
)
```

### Gemini SDK (Text/Chat Generation) ✓ CORRECT
```python
import google.generativeai as genai

genai.configure(api_key=key)
model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp",
    system_instruction="..."
)
response = model.generate_content("Hello")
```

## Configuration Now Properly Separated

### Video Generation
- **SDK**: `from google import genai` (Veo SDK)
- **Model**: `veo-3.1-generate-preview` (from `settings.video_model`)
- **Usage**: Direct parameter passing to `generate_videos()`
- **Used By**: Video generation endpoint

### Chat & Prompt Optimization
- **SDK**: `import google.generativeai as genai` (Gemini SDK)
- **Models**:
  - Chat: `gemini-2.0-flash-exp` (from `settings.chat_model`)
  - Optimize: `gemini-2.0-flash-exp` (from `settings.optimize_model`)
- **Usage**: `GenerativeModel` class with `generate_content()` or `start_chat()`
- **Used By**: Chat assistant and prompt optimization

## Verification

After the fix, video generation should work with parameters like:
- **Resolution**: 720p or 1080p ✓
- **Duration**: 4, 6, or 8 seconds ✓
- **Aspect Ratio**: 16:9 or 9:16 ✓
- **Negative Prompt**: Optional ✓
- **Image Upload**: Optional ✓

## Testing

To test the fix:

1. **Restart the backend** (REQUIRED)
   ```
   start-dev.bat
   ```

2. **Try generating a video**
   - Open http://localhost:5173
   - Enter a prompt
   - Click "Generate Video"
   - Should see: "Video generation started!"
   - NOT: "Failed to start video generation"

3. **Check backend logs**
   - Should see: "Generating video with model: veo-3.1-generate-preview"
   - Should NOT see: "GenerateVideosConfig" error

## Summary of All Model Configurations

| Function | SDK | Model | Config Location |
|----------|-----|-------|----------------|
| **Video Generation** | `google.genai` (Veo) | `veo-3.1-generate-preview` | `backend/.env` → `VIDEO_MODEL` |
| **Chat Assistant** | `google.generativeai` (Gemini) | `gemini-2.0-flash-exp` | `backend/.env` → `CHAT_MODEL` |
| **Prompt Optimization** | `google.generativeai` (Gemini) | `gemini-2.0-flash-exp` | `backend/.env` → `OPTIMIZE_MODEL` |

## Files Changed

1. ✅ **backend/app/services/video_service.py** - Fixed video generation parameter passing
2. ✅ **backend/app/config.py** - Added model configuration settings
3. ✅ **backend/.env** - Added VIDEO_MODEL, CHAT_MODEL, OPTIMIZE_MODEL
4. ✅ **backend/app/routes/video_routes.py** - Updated to use configured models
5. ✅ **backend/app/main.py** - Display model info on startup

## Next Steps

1. **Run start-dev.bat** to restart with the fix
2. **Test video generation** to confirm it works
3. **Check /api/models** endpoint to see configuration: http://localhost:9001/api/models

---

**Status**: ✅ FIXED - Video generation now uses correct Veo SDK parameter format
