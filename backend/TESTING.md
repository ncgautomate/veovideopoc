# Backend Testing Guide

## Prerequisites

1. **Install Python dependencies**:
   ```bash
   cd backend
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

2. **Set up environment variables**:
   - Ensure `.env` file exists in project root with your `GEMINI_API_KEY`
   - Get API key from: https://aistudio.google.com/apikey

## Running the Backend

### Option 1: Using run script (Recommended)
```bash
# Windows
run.bat

# Mac/Linux
chmod +x run.sh
./run.sh

# Or using Python directly
python run.py
```

### Option 2: Using uvicorn directly
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Testing Endpoints

Once the server is running, you can test the API in several ways:

### 1. Interactive API Documentation (Recommended)

Open your browser to:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

The Swagger UI allows you to test all endpoints interactively.

### 2. Testing Workflow

#### Step 1: Upload Image
```bash
# Using curl (replace with your image path)
curl -X POST "http://localhost:8000/api/upload-image" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/image.jpg"

# Response:
{
  "image_id": "abc123...",
  "filename": "image.jpg",
  "size": 123456,
  "message": "Image uploaded successfully"
}
```

#### Step 2: Generate Video
```bash
# Using curl (replace image_id from step 1)
curl -X POST "http://localhost:8000/api/generate-video" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A serene beach at sunset with gentle waves",
    "image_id": "abc123...",
    "resolution": "720p",
    "duration": 8,
    "aspect_ratio": "16:9"
  }'

# Response:
{
  "operation_id": "xyz789...",
  "status": "processing"
}
```

#### Step 3: Poll Status (every 10 seconds)
```bash
# Using curl (replace operation_id from step 2)
curl -X GET "http://localhost:8000/api/video-status/xyz789..."

# While processing:
{
  "done": false,
  "status": "processing (15s elapsed)",
  "video_url": null
}

# When complete:
{
  "done": true,
  "status": "completed",
  "video_url": "/api/videos/video123..."
}
```

#### Step 4: Download Video
```bash
# Using browser or curl
curl "http://localhost:8000/api/videos/video123..." --output generated_video.mp4

# Or open in browser:
# http://localhost:8000/api/videos/video123...
```

### 3. Using Python Requests

Create a test script `test_api.py`:

```python
import requests
import time

BASE_URL = "http://localhost:8000"

# 1. Upload image
with open("test_image.jpg", "rb") as f:
    response = requests.post(
        f"{BASE_URL}/api/upload-image",
        files={"file": f}
    )
    image_data = response.json()
    print("Image uploaded:", image_data)

# 2. Generate video
video_request = {
    "prompt": "A beautiful sunset over the ocean with birds flying",
    "image_id": image_data["image_id"],
    "resolution": "720p",
    "duration": 8,
    "aspect_ratio": "16:9"
}

response = requests.post(
    f"{BASE_URL}/api/generate-video",
    json=video_request
)
operation_data = response.json()
print("Video generation started:", operation_data)

# 3. Poll status
operation_id = operation_data["operation_id"]
while True:
    response = requests.get(f"{BASE_URL}/api/video-status/{operation_id}")
    status_data = response.json()
    print(f"Status: {status_data['status']}")

    if status_data["done"]:
        if status_data.get("video_url"):
            print(f"Video ready: {BASE_URL}{status_data['video_url']}")
        elif status_data.get("error"):
            print(f"Error: {status_data['error']}")
        break

    time.sleep(10)  # Wait 10 seconds before next poll
```

## Expected Response Times

- **Image Upload**: Instant (< 1 second)
- **Video Generation Start**: 1-2 seconds
- **Video Processing**: 11 seconds to 6 minutes (average: 30-90 seconds)
- **Video Download**: 1-5 seconds (depending on size)

## Common Issues

### Issue: "GEMINI_API_KEY not found"
**Solution**:
- Create `.env` file in project root (not backend folder)
- Add: `GEMINI_API_KEY=your_actual_key_here`
- Restart the server

### Issue: "Module 'google' has no attribute 'genai'"
**Solution**:
- Install the correct package: `pip install google-genai`
- Make sure you're in the virtual environment

### Issue: "Image not found"
**Solution**:
- Ensure you're using the correct `image_id` from upload response
- Images are stored in `uploads/` folder temporarily

### Issue: Video generation fails with safety filter
**Solution**:
- Modify your prompt to be more descriptive and less ambiguous
- Avoid potentially harmful or unsafe content descriptions

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/api/health` | Health check |
| POST | `/api/upload-image` | Upload image file |
| POST | `/api/generate-video` | Start video generation |
| GET | `/api/video-status/{id}` | Check generation status |
| GET | `/api/videos/{id}` | Download video |

## Monitoring Logs

The server logs will show:
- Startup information
- Incoming requests
- Error messages
- Video generation progress

Watch the console for debugging information.

## Next Steps

After verifying the backend works:
1. Proceed to Phase 3: Frontend UI/UX Development
2. Integrate frontend with these API endpoints
3. Test end-to-end workflow

## Support

- FastAPI Docs: http://localhost:8000/docs
- Google Veo Documentation: https://ai.google.dev/gemini-api/docs/video
