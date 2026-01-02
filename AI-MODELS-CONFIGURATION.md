# AI Models Configuration Guide

## Overview

CleverCreator.ai now uses configurable AI models for different functions. This allows you to easily switch between different Google AI models for optimal performance and cost.

## Current Model Configuration

### Video Generation
- **Model**: `veo-3.1-generate-preview`
- **Provider**: Google Veo 3.1
- **Used For**: Generating videos from text prompts and images
- **Capabilities**:
  - 8-second videos
  - 720p or 1080p resolution
  - 16:9 or 9:16 aspect ratio
  - Native audio generation

### Chat Assistant
- **Model**: `gemini-2.0-flash-exp`
- **Provider**: Google Gemini
- **Used For**: AI chat conversations to help brainstorm video ideas
- **Features**:
  - Fast response times
  - Conversational context awareness
  - Video generation expertise

### Prompt Optimization
- **Model**: `gemini-2.0-flash-exp`
- **Provider**: Google Gemini
- **Used For**: Enhancing and optimizing video prompts
- **Features**:
  - Cinematic language enhancement
  - Technical detail addition
  - Prompt length optimization (max 1024 chars)

## Configuration Files

### backend/.env
This file contains the model configuration:

```env
# AI Model Configuration
VIDEO_MODEL=veo-3.1-generate-preview
CHAT_MODEL=gemini-2.0-flash-exp
OPTIMIZE_MODEL=gemini-2.0-flash-exp
```

### backend/app/config.py
The Settings class now includes:

```python
class Settings(BaseSettings):
    # AI Model Configuration
    video_model: str = "veo-3.1-generate-preview"
    chat_model: str = "gemini-2.0-flash-exp"
    optimize_model: str = "gemini-2.0-flash-exp"
```

## Available Models

### Google Gemini Models (for Text Generation)

#### Gemini 2.0 Flash (Experimental)
- **Model Name**: `gemini-2.0-flash-exp`
- **Best For**: Fast chat responses, real-time optimization
- **Speed**: Very fast
- **Quality**: Good
- **Cost**: Lower

#### Gemini 1.5 Flash
- **Model Name**: `gemini-1.5-flash`
- **Best For**: Balanced speed and quality
- **Speed**: Fast
- **Quality**: Good
- **Cost**: Lower

#### Gemini 1.5 Pro
- **Model Name**: `gemini-1.5-pro`
- **Best For**: High-quality prompt optimization
- **Speed**: Moderate
- **Quality**: Excellent
- **Cost**: Higher

### Google Veo Models (for Video Generation)

#### Veo 3.1
- **Model Name**: `veo-3.1-generate-preview`
- **Best For**: High-quality video generation
- **Features**: Latest model with improved quality

## How to Change Models

### Method 1: Edit .env File (Recommended)

1. Open `backend/.env`
2. Update the model names:

```env
# Use Gemini 1.5 Pro for better prompt optimization
OPTIMIZE_MODEL=gemini-1.5-pro

# Use Gemini 1.5 Flash for faster chat
CHAT_MODEL=gemini-1.5-flash
```

3. Restart the backend server

### Method 2: Environment Variables

Set environment variables before starting:

```bash
export CHAT_MODEL=gemini-1.5-pro
export OPTIMIZE_MODEL=gemini-1.5-pro
python run.py
```

## Checking Current Models

### Via API Endpoint

```bash
curl http://localhost:9001/api/models
```

Response:
```json
{
  "models": {
    "video_generation": {
      "model": "veo-3.1-generate-preview",
      "description": "Used for generating videos from prompts",
      "provider": "Google Veo 3.1"
    },
    "chat_assistant": {
      "model": "gemini-2.0-flash-exp",
      "description": "Used for AI chat conversations",
      "provider": "Google Gemini"
    },
    "prompt_optimization": {
      "model": "gemini-2.0-flash-exp",
      "description": "Used for enhancing video prompts",
      "provider": "Google Gemini"
    }
  }
}
```

### Via Startup Logs

When the backend starts, it displays the configured models:

```
============================================================
CleverCreator.ai API Starting...
API Documentation: http://0.0.0.0:9001/docs

AI Models Configuration:
  Video Generation: veo-3.1-generate-preview
  Chat Assistant:   gemini-2.0-flash-exp
  Prompt Optimizer: gemini-2.0-flash-exp
============================================================
```

### Via Browser

Open http://localhost:9001/api/models in your browser to see the current configuration.

## Model Selection Guidelines

### For Chat Assistant

**Use Gemini 2.0 Flash Exp** when:
- You want fast, responsive chat
- Cost efficiency is important
- Quality is good enough for brainstorming

**Use Gemini 1.5 Pro** when:
- You need the highest quality responses
- You're willing to wait a bit longer
- Budget allows for higher-tier model

### For Prompt Optimization

**Use Gemini 2.0 Flash Exp** when:
- You need quick prompt enhancements
- Iterating rapidly on ideas
- Basic prompt optimization is sufficient

**Use Gemini 1.5 Pro** when:
- You want the best possible prompt quality
- Final production prompts
- Maximum cinematic detail needed

## Code Implementation

### Video Service
```python
# backend/app/services/video_service.py
generate_params = {
    "model": settings.video_model,  # Uses VIDEO_MODEL from .env
    "prompt": prompt,
    "config": config
}
```

### Chat Endpoint
```python
# backend/app/routes/video_routes.py
model = genai.GenerativeModel(
    model_name=settings.chat_model,  # Uses CHAT_MODEL from .env
    system_instruction="""..."""
)
```

### Optimize Endpoint
```python
# backend/app/routes/video_routes.py
model = genai.GenerativeModel(
    model_name=settings.optimize_model,  # Uses OPTIMIZE_MODEL from .env
    system_instruction="""..."""
)
```

## Troubleshooting

### Model Not Found Error

If you see an error like `Model not found: xyz`:

1. Check that the model name is correct in `.env`
2. Verify the model is available in your region
3. Check Google AI Studio for supported models
4. Ensure your API key has access to the model

### Startup Shows Wrong Model

If the startup logs show different models than expected:

1. Check `backend/.env` has the correct values
2. Ensure there are no typos in model names
3. Restart the backend completely
4. Verify no environment variables are overriding .env

### Best Practices

1. **Use .env for configuration** - Don't hardcode model names
2. **Test model changes** - Try new models in development first
3. **Monitor costs** - Different models have different pricing
4. **Document changes** - Note why you chose specific models
5. **Version control** - Keep track of model configuration changes

## References

- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs/models/gemini)
- [Gemini Models Overview](https://ai.google.dev/gemini-api/docs/gemini-3)
- [Veo Video Generation](https://ai.google.dev/api/generate-video)

---

**Last Updated**: Configuration system implemented with dynamic model selection
