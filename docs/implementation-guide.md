# Veo Video Generation Webapp - Quick Implementation Guide

## Quick Start Overview

This guide provides step-by-step instructions to quickly deploy the Veo video generation POC webapp in a local Docker container. Follow the phases sequentially for optimal results.

**Estimated Time**: 6-10 hours for complete POC

---

## Prerequisites

Before starting, ensure you have:

- [ ] **Docker Desktop** installed and running
- [ ] **Docker Compose** v2.0+ installed
- [ ] **Node.js** v18+ and npm (for frontend development)
- [ ] **Python** 3.11+ (for backend development)
- [ ] **Google Gemini API Key** - Get it from: <https://aistudio.google.com/apikey>
- [ ] **Git** (optional, for version control)
- [ ] Text editor/IDE (VS Code recommended)

---

## Phase 1: Environment & Project Setup (30-45 mins)

### Step 1.1: Create Project Structure

```bash
# Navigate to your project root
cd veo2-video-poc-webapp

# Create folder structure
mkdir -p backend/app/routes backend/app/services backend/app/models
mkdir -p frontend/src/components frontend/src/services frontend/src/utils
mkdir -p videos  # For storing generated videos
```

### Step 1.2: Set Up Backend (Python FastAPI)

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Create requirements.txt
```

**Create `backend/requirements.txt`:**

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6
python-dotenv==1.0.0
google-genai==0.2.0
aiofiles==23.2.1
pydantic==2.5.3
pydantic-settings==2.1.0
```

```bash
# Install dependencies
pip install -r requirements.txt
```

### Step 1.3: Set Up Frontend (React + Vite)

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Create Vite + React project
npm create vite@latest . -- --template react

# Install dependencies
npm install

# Install additional packages
npm install axios react-player tailwindcss postcss autoprefixer
npm install -D @tailwindcss/forms

# Initialize Tailwind CSS
npx tailwindcss init -p
```

**Configure `frontend/tailwind.config.js`:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

**Update `frontend/src/index.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 1.4: Configure Environment Variables

**Create `.env.example` in project root:**

```env
# Google Gemini API Configuration
GEMINI_API_KEY=your_api_key_here

# Backend Configuration
BACKEND_PORT=8000
BACKEND_HOST=0.0.0.0

# Frontend Configuration
VITE_BACKEND_URL=http://localhost:8000

# Video Storage
VIDEO_STORAGE_PATH=./videos
```

**Create `.env` file (copy from .env.example and fill in your API key):**

```bash
cp .env.example .env
# Edit .env and add your actual GEMINI_API_KEY
```

### Step 1.5: Verify Setup

```bash
# Test backend (from backend folder with venv activated)
uvicorn app.main:app --reload

# Test frontend (from frontend folder)
npm run dev

# Both should start without errors
```

**Phase 1 Complete** ✓

---

## Phase 2: Backend Core - Video Generation API (2-3 hours)

### Step 2.1: Create FastAPI Application Structure

**Create `backend/app/__init__.py`:**

```python
# Empty file to make app a package
```

**Create `backend/app/config.py`:**

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    gemini_api_key: str
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    video_storage_path: str = "./videos"
    max_file_size: int = 20 * 1024 * 1024  # 20MB

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
```

**Create `backend/app/models.py`:**

```python
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
    prompt: str = Field(..., max_length=1024)
    image_id: str
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
```

### Step 2.2: Create Video Generation Service

**Create `backend/app/services/__init__.py`:**

```python
# Empty file
```

**Create `backend/app/services/video_service.py`:**

```python
import os
import time
import uuid
from pathlib import Path
from google import genai
from app.config import get_settings

settings = get_settings()

class VideoGenerationService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.storage_path = Path(settings.video_storage_path)
        self.storage_path.mkdir(exist_ok=True)
        self.operations = {}  # Store operation states

    async def generate_video(
        self,
        image_path: str,
        prompt: str,
        negative_prompt: str = None,
        resolution: str = "720p",
        duration: int = 8,
        aspect_ratio: str = "16:9"
    ) -> str:
        """Initiate video generation and return operation ID"""

        # Read image file
        with open(image_path, 'rb') as f:
            image_bytes = f.read()

        # Prepare request parameters
        params = {
            "model": "veo-3.1-generate-preview",
            "prompt": prompt,
            "image": {"image_bytes": image_bytes},
            "aspect_ratio": aspect_ratio,
            "resolution": resolution,
            "duration_seconds": duration
        }

        if negative_prompt:
            params["negative_prompt"] = negative_prompt

        # Start video generation
        operation = self.client.models.generate_videos(**params)

        # Store operation info
        operation_id = str(uuid.uuid4())
        self.operations[operation_id] = {
            "operation": operation,
            "status": "processing",
            "started_at": time.time()
        }

        return operation_id

    async def check_status(self, operation_id: str) -> dict:
        """Check video generation status"""

        if operation_id not in self.operations:
            return {"done": False, "status": "not_found", "error": "Operation not found"}

        op_data = self.operations[operation_id]
        operation = op_data["operation"]

        # Refresh operation status
        operation = self.client.operations.get(operation)

        if not operation.done:
            elapsed = time.time() - op_data["started_at"]
            return {
                "done": False,
                "status": f"processing ({int(elapsed)}s elapsed)",
                "video_url": None
            }

        # Video is ready - download and save
        try:
            video = operation.response.generated_videos[0]
            video_id = str(uuid.uuid4())
            video_path = self.storage_path / f"{video_id}.mp4"

            # Download video
            self.client.files.download(file=video.video)
            video.video.save(str(video_path))

            # Update operation
            self.operations[operation_id]["status"] = "completed"
            self.operations[operation_id]["video_id"] = video_id

            return {
                "done": True,
                "status": "completed",
                "video_url": f"/api/videos/{video_id}"
            }
        except Exception as e:
            return {
                "done": True,
                "status": "failed",
                "error": str(e)
            }

    def get_video_path(self, video_id: str) -> Path:
        """Get path to stored video file"""
        return self.storage_path / f"{video_id}.mp4"

# Singleton instance
video_service = VideoGenerationService()
```

### Step 2.3: Create API Routes

**Create `backend/app/routes/__init__.py`:**

```python
# Empty file
```

**Create `backend/app/routes/video_routes.py`:**

```python
import os
import uuid
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse
from app.models import (
    VideoGenerationRequest,
    VideoGenerationResponse,
    VideoStatusResponse
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
    """Upload and validate image file"""

    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image (PNG or JPEG)")

    # Validate file size
    contents = await file.read()
    if len(contents) > settings.max_file_size:
        raise HTTPException(400, f"File size exceeds {settings.max_file_size / 1024 / 1024}MB limit")

    # Save file temporarily
    image_id = str(uuid.uuid4())
    file_extension = file.filename.split(".")[-1]
    image_path = UPLOAD_DIR / f"{image_id}.{file_extension}"

    with open(image_path, "wb") as f:
        f.write(contents)

    return {
        "image_id": image_id,
        "filename": file.filename,
        "size": len(contents)
    }

@router.post("/generate-video", response_model=VideoGenerationResponse)
async def generate_video(request: VideoGenerationRequest):
    """Start video generation process"""

    # Find uploaded image
    image_files = list(UPLOAD_DIR.glob(f"{request.image_id}.*"))
    if not image_files:
        raise HTTPException(404, "Image not found. Please upload image first.")

    image_path = str(image_files[0])

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
        raise HTTPException(500, f"Video generation failed: {str(e)}")

@router.get("/video-status/{operation_id}", response_model=VideoStatusResponse)
async def get_video_status(operation_id: str):
    """Check video generation status"""

    result = await video_service.check_status(operation_id)
    return VideoStatusResponse(**result)

@router.get("/videos/{video_id}")
async def get_video(video_id: str):
    """Retrieve generated video file"""

    video_path = video_service.get_video_path(video_id)

    if not video_path.exists():
        raise HTTPException(404, "Video not found")

    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename=f"generated_video_{video_id}.mp4"
    )
```

### Step 2.4: Create Main Application

**Create `backend/app/main.py`:**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.video_routes import router as video_router
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Veo Video Generation API",
    description="API for generating videos using Google Veo 3.1",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(video_router)

@app.get("/")
async def root():
    return {
        "message": "Veo Video Generation API",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### Step 2.5: Test Backend

```bash
# From backend folder with venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Open browser to http://localhost:8000/docs
# Test API endpoints using FastAPI auto-generated docs
```

**Phase 2 Complete** ✓

---

## Phase 3: Frontend UI/UX Development (2-3 hours)

### Step 3.1: Create API Service

**Create `frontend/src/services/api.js`:**

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_BASE_URL}/api/upload-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const generateVideo = async (params) => {
  const response = await api.post('/api/generate-video', params);
  return response.data;
};

export const checkVideoStatus = async (operationId) => {
  const response = await api.get(`/api/video-status/${operationId}`);
  return response.data;
};

export const getVideoUrl = (videoUrl) => {
  return `${API_BASE_URL}${videoUrl}`;
};

export default api;
```

### Step 3.2: Create Components

**Create `frontend/src/components/ImageUpload.jsx`:**

```jsx
import React, { useState } from 'react';

const ImageUpload = ({ onImageUploaded }) => {
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('File size must be less than 20MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Notify parent
    onImageUploaded(file);
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg shadow-md"
            />
            <button
              onClick={() => {
                setPreview(null);
                onImageUploaded(null);
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove Image
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-600">
              <label className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                Upload an image
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange}
                />
              </label>
              <p className="mt-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG or JPEG up to 20MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
```

**Create `frontend/src/components/PromptForm.jsx`:**

```jsx
import React, { useState } from 'react';

const PromptForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    prompt: '',
    negative_prompt: '',
    resolution: '720p',
    duration: 8,
    aspect_ratio: '16:9',
  });

  const [charCount, setCharCount] = useState(0);

  const handlePromptChange = (e) => {
    const value = e.target.value;
    if (value.length <= 1024) {
      setFormData({ ...formData, prompt: value });
      setCharCount(value.length);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.prompt.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video Prompt *
        </label>
        <textarea
          value={formData.prompt}
          onChange={handlePromptChange}
          placeholder="Describe the video you want to create. Include: subject, action, style, camera angle, and audio cues in quotes..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows="4"
          required
        />
        <div className="mt-1 text-xs text-gray-500 text-right">
          {charCount}/1024 characters
        </div>
      </div>

      {/* Negative Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Negative Prompt (Optional)
        </label>
        <input
          type="text"
          value={formData.negative_prompt}
          onChange={(e) =>
            setFormData({ ...formData, negative_prompt: e.target.value })
          }
          placeholder="Elements to exclude from the video..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resolution */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resolution
          </label>
          <select
            value={formData.resolution}
            onChange={(e) =>
              setFormData({ ...formData, resolution: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <select
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="4">4 seconds</option>
            <option value="6">6 seconds</option>
            <option value="8">8 seconds</option>
          </select>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aspect Ratio
          </label>
          <select
            value={formData.aspect_ratio}
            onChange={(e) =>
              setFormData({ ...formData, aspect_ratio: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait)</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !formData.prompt.trim()}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Generating...' : 'Generate Video'}
      </button>
    </form>
  );
};

export default PromptForm;
```

**Create `frontend/src/components/VideoPlayer.jsx`:**

```jsx
import React from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ videoUrl, onGenerateAnother }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'generated_video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="bg-black rounded-lg overflow-hidden shadow-xl">
        <ReactPlayer
          url={videoUrl}
          controls
          width="100%"
          height="auto"
          playing
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleDownload}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Download Video
        </button>
        <button
          onClick={onGenerateAnother}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Generate Another
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
```

**Create `frontend/src/components/ProgressIndicator.jsx`:**

```jsx
import React from 'react';

const ProgressIndicator = ({ status, elapsed }) => {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
      <div className="space-y-2">
        <p className="text-lg font-medium text-gray-900">{status}</p>
        {elapsed && (
          <p className="text-sm text-gray-500">
            Elapsed time: {Math.floor(elapsed)}s (Est. 11s-6min)
          </p>
        )}
      </div>
      <div className="max-w-md mx-auto bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
```

### Step 3.3: Create Main App Component

**Update `frontend/src/App.jsx`:**

```jsx
import React, { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import PromptForm from './components/PromptForm';
import VideoPlayer from './components/VideoPlayer';
import ProgressIndicator from './components/ProgressIndicator';
import { uploadImage, generateVideo, checkVideoStatus, getVideoUrl } from './services/api';

function App() {
  const [step, setStep] = useState('upload'); // upload, form, generating, completed
  const [imageFile, setImageFile] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [operationId, setOperationId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Handle image upload
  const handleImageUploaded = async (file) => {
    if (!file) {
      setImageFile(null);
      setImageId(null);
      setStep('upload');
      return;
    }

    setImageFile(file);
    setError(null);

    try {
      const result = await uploadImage(file);
      setImageId(result.image_id);
      setStep('form');
    } catch (err) {
      setError('Failed to upload image: ' + err.message);
    }
  };

  // Handle video generation
  const handleGenerateVideo = async (formData) => {
    setError(null);
    setStep('generating');
    setElapsedTime(0);

    try {
      const result = await generateVideo({
        ...formData,
        image_id: imageId,
      });
      setOperationId(result.operation_id);
    } catch (err) {
      setError('Failed to start video generation: ' + err.message);
      setStep('form');
    }
  };

  // Poll for video status
  useEffect(() => {
    if (step !== 'generating' || !operationId) return;

    const startTime = Date.now();
    const interval = setInterval(async () => {
      try {
        setElapsedTime((Date.now() - startTime) / 1000);

        const status = await checkVideoStatus(operationId);

        if (status.done) {
          clearInterval(interval);
          if (status.video_url) {
            setVideoUrl(getVideoUrl(status.video_url));
            setStep('completed');
          } else if (status.error) {
            setError('Video generation failed: ' + status.error);
            setStep('form');
          }
        }
      } catch (err) {
        clearInterval(interval);
        setError('Error checking status: ' + err.message);
        setStep('form');
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [step, operationId]);

  // Reset for new generation
  const handleGenerateAnother = () => {
    setStep('upload');
    setImageFile(null);
    setImageId(null);
    setOperationId(null);
    setVideoUrl(null);
    setError(null);
    setElapsedTime(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Veo Video Generator
          </h1>
          <p className="text-gray-600">
            Transform your images into stunning videos with AI
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {step === 'upload' && (
            <ImageUpload onImageUploaded={handleImageUploaded} />
          )}

          {step === 'form' && (
            <div className="space-y-6">
              <ImageUpload onImageUploaded={handleImageUploaded} />
              <PromptForm onSubmit={handleGenerateVideo} loading={false} />
            </div>
          )}

          {step === 'generating' && (
            <ProgressIndicator
              status="Generating your video..."
              elapsed={elapsedTime}
            />
          )}

          {step === 'completed' && videoUrl && (
            <VideoPlayer
              videoUrl={videoUrl}
              onGenerateAnother={handleGenerateAnother}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          Powered by Google Veo 3.1 | Built with React + FastAPI
        </div>
      </div>
    </div>
  );
}

export default App;
```

### Step 3.4: Test Frontend

```bash
# From frontend folder
npm run dev

# Open http://localhost:5173 in browser
```

**Phase 3 Complete** ✓

---

## Phase 4: API Integration & Testing (1-2 hours)

### Step 4.1: End-to-End Testing

1. Start both backend and frontend
2. Test complete workflow:
   - Upload an image
   - Fill in prompt and parameters
   - Generate video
   - Watch polling progress
   - View completed video with audio
   - Download video

### Step 4.2: Test Different Scenarios

- Test with different image sizes
- Test with various prompt styles
- Test with different resolutions (720p vs 1080p)
- Test with different durations (4s, 6s, 8s)
- Test with different aspect ratios
- Test negative prompts
- Test error handling (invalid image, network errors)

**Phase 4 Complete** ✓

---

## Phase 5: Dockerization & Local Deployment (1-2 hours)

### Step 5.1: Create Backend Dockerfile

**Create `backend/Dockerfile`:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./app ./app

# Create directories
RUN mkdir -p /app/uploads /app/videos

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 5.2: Create Frontend Dockerfile

**Create `frontend/Dockerfile`:**

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Create `frontend/nginx.conf`:**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 5.3: Create Docker Compose Configuration

**Create `docker-compose.yml` in project root:**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: veo-backend
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - VIDEO_STORAGE_PATH=/app/videos
    volumes:
      - ./videos:/app/videos
      - ./backend/uploads:/app/uploads
    restart: unless-stopped
    networks:
      - veo-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: veo-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - veo-network

networks:
  veo-network:
    driver: bridge

volumes:
  videos:
  uploads:
```

### Step 5.4: Deploy with Docker

```bash
# Make sure .env file has your GEMINI_API_KEY
# From project root

# Build and start containers
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
```

**Phase 5 Complete** ✓

---

## Phase 6: Polish, Documentation & Validation (30-60 mins)

### Step 6.1: Update README

**Create/Update `README.md`:**

```markdown
# Veo Video Generation Webapp

A modern web application for generating videos from images using Google's Veo 3.1 AI model.

## Features

- Upload images (PNG/JPEG, up to 20MB)
- Generate videos with native audio (4-8 seconds, 720p/1080p)
- Customize: resolution, duration, aspect ratio
- Real-time generation progress
- Download generated videos
- Mobile-responsive design
- Dockerized for easy deployment

## Prerequisites

- Docker & Docker Compose
- Google Gemini API Key from https://aistudio.google.com/apikey

## Quick Start

1. Clone the repository
2. Create `.env` file with your API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Run with Docker:
   ```bash
   docker-compose up --build
   ```
4. Open http://localhost:3000

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python FastAPI + Google Gemini SDK
- **Model**: Veo 3.1 (native audio, 720p/1080p)
- **Deployment**: Docker + Docker Compose

## API Endpoints

- `POST /api/upload-image` - Upload image
- `POST /api/generate-video` - Start video generation
- `GET /api/video-status/{id}` - Check generation status
- `GET /api/videos/{id}` - Download video

Full API docs: http://localhost:8000/docs

## Troubleshooting

**Issue**: Video generation fails
- Check API key is valid
- Ensure image is PNG or JPEG under 20MB
- Check backend logs: `docker-compose logs backend`

**Issue**: Frontend can't connect to backend
- Verify both containers are running: `docker-compose ps`
- Check network connectivity

## License

MIT
```

### Step 6.2: Final Validation Checklist

Run through this checklist:

- [ ] Image upload works (drag & drop and file select)
- [ ] Image validation (size, format)
- [ ] Video generation with 720p
- [ ] Video generation with 1080p
- [ ] Video generation with different durations (4s, 6s, 8s)
- [ ] Video generation with different aspect ratios
- [ ] Negative prompts work
- [ ] Polling shows progress
- [ ] Generated videos have audio
- [ ] Video playback works
- [ ] Video download works
- [ ] Error handling displays properly
- [ ] Mobile responsive design
- [ ] Docker deployment successful
- [ ] README documentation complete
- [ ] API documentation accessible

**Phase 6 Complete** ✓

---

## Deployment Summary

### Local Development (Without Docker)

```bash
# Terminal 1 - Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Docker Deployment (Recommended for POC)

```bash
# From project root
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## Next Steps for Production

1. **Security**:
   - Add authentication/authorization
   - Implement rate limiting
   - Add CSRF protection
   - Secure API key storage (Azure Key Vault)

2. **Scalability**:
   - Use PostgreSQL for metadata
   - Store videos in Azure Blob Storage
   - Add Redis for caching and queuing
   - Deploy to Azure (AKS, App Service)

3. **Monitoring**:
   - Add logging (structured logging)
   - Implement Azure Application Insights
   - Set up alerts for failures
   - Monitor API usage and costs

4. **Features**:
   - Video history and gallery
   - User accounts and saved videos
   - Batch video generation
   - Video editing capabilities
   - Share generated videos

---

## Support

For issues and questions, refer to:
- [Google Veo Documentation](https://ai.google.dev/gemini-api/docs/video)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)

---

**Ready to build!** Follow the phases sequentially for best results. Estimated completion: 6-10 hours.
