# Veo Video Generation Webapp - Planning Document

## Overview
This document outlines the planning for a POC webapp that allows users to upload images and generate videos using Google's Veo API via Gemini. The app features a modern, minimalistic UI/UX, mobile-responsive design, and runs locally in a Docker container.

## Key Requirements
- Friendly, modern, minimalistic UI/UX.
- Mobile-friendly responsive app.
- Image upload functionality.
- Video generation using Veo API.
- Local POC deployment via Docker.

## Architecture
- **Frontend**: React (Vite) SPA with Tailwind CSS for responsiveness.
- **Backend**: Python FastAPI async API to handle requests and integrate with Gemini Veo 3.1 API.
- **Video Model**: Veo 3.1 (`veo-3.1-generate-preview`) - native audio, 720p/1080p, 4-8 seconds.
- **Storage**: Local filesystem with Docker volumes (Google stores videos for only 2 days).
- **Flow**: User uploads image + prompt → Backend calls Veo 3.1 API → Polls operation status (11s-6min) → Downloads & stores video → Frontend displays with audio.

## Detailed Implementation Plan - Phased Approach

### Phase 1: Environment & Project Setup (30-45 mins)
**Goal**: Initialize project structure with Python FastAPI backend and React frontend.

1. Create project structure:
   ```
   veo2-video-poc-webapp/
   ├── backend/
   ├── frontend/
   ├── docker-compose.yml
   ├── .env.example
   └── README.md
   ```

2. Backend setup:
   - Initialize Python virtual environment
   - Create `requirements.txt` with dependencies
   - Set up FastAPI app structure (`main.py`, `config.py`, `routes/`)
   - Configure environment variables for API key

3. Frontend setup:
   - Initialize Vite + React project
   - Install Tailwind CSS
   - Install Axios, React Player
   - Set up basic folder structure (`components/`, `services/`, `utils/`)

4. Get Google Gemini API Key from https://aistudio.google.com/apikey

**Deliverable**: Working dev environment with both servers running locally.

**Status**: ✅ COMPLETE

---

### Phase 2: Backend Core - Video Generation API (2-3 hours)
**Goal**: Build FastAPI endpoints for Veo 3.1 video generation with polling mechanism.

1. **File Upload Endpoint** (`POST /api/upload-image`)
   - Accept image file (max 20MB)
   - Validate format (PNG, JPEG)
   - Save temporarily for processing
   - Return image reference ID

2. **Video Generation Endpoint** (`POST /api/generate-video`)
   - Accept parameters:
     - `prompt` (text description)
     - `image` (uploaded image reference)
     - `negative_prompt` (optional)
     - `resolution` (720p or 1080p)
     - `duration` (4, 6, or 8 seconds)
     - `aspect_ratio` (16:9 or 9:16)
   - Integrate `google-genai` SDK
   - Call Veo 3.1 API (`veo-3.1-generate-preview`)
   - Return operation ID for polling

3. **Polling Status Endpoint** (`GET /api/video-status/{operation_id}`)
   - Check operation status via Gemini SDK
   - Return `{done: boolean, progress: string}`
   - When done, download video from Google
   - Save to local filesystem (`/videos` volume)
   - Return video URL/path

4. **Video Retrieval Endpoint** (`GET /api/videos/{video_id}`)
   - Stream video file from local storage
   - Support range requests for video playback

**Key Implementation Details**:
- Use async/await for all operations
- Implement polling loop (10-second intervals)
- Handle timeouts (6-minute max)
- Error handling for safety filters
- Store videos locally (Google only keeps 2 days)

**Deliverable**: Working FastAPI backend with video generation and polling.

**Status**: ✅ COMPLETE

---

### Phase 3: Frontend UI/UX Development (2-3 hours)
**Goal**: Build responsive, user-friendly interface for video generation.

1. **Main Layout Component**
   - Header with branding
   - Responsive grid layout (mobile-first)
   - Status indicator section

2. **Image Upload Component**
   - Drag & drop zone
   - File input button
   - Image preview
   - Size validation (max 20MB)
   - Format validation (PNG, JPEG)

3. **Prompt Form Component**
   - Text prompt textarea with character counter (1024 max)
   - Audio prompt section (dialogue + sound effects guidance)
   - Negative prompt input (optional)
   - Parameter selectors:
     - Resolution toggle (720p/1080p)
     - Duration selector (4/6/8 seconds)
     - Aspect ratio toggle (16:9/9:16)
   - Submit button with loading state

4. **Prompt Examples/Helper**
   - Tooltip with prompt engineering best practices
   - Example prompts for inspiration
   - Guidance: Subject, Action, Style, Camera, Audio

5. **Progress Indicator Component**
   - Loading spinner during upload
   - Polling progress bar (estimated 11s-6min)
   - Status messages ("Uploading...", "Generating...", "Processing...")

6. **Video Player Component**
   - React Player for video with audio support
   - Playback controls
   - Download button
   - "Generate Another" button

7. **Error Handling UI**
   - Toast notifications for errors
   - Retry mechanism
   - Clear error messages

**Styling**:
- Tailwind CSS for all components
- Mobile-responsive (breakpoints: sm, md, lg, xl)
- Modern, minimalistic design
- Loading states and animations

**Deliverable**: Fully functional, responsive frontend.

**Status**: ✅ COMPLETE

---

### Phase 4: API Integration & Testing (1-2 hours)
**Goal**: Connect frontend to backend and test end-to-end workflow.

1. **API Service Layer**
   - Create Axios client with base URL
   - Implement API methods:
     - `uploadImage(file)`
     - `generateVideo(params)`
     - `pollVideoStatus(operationId)`
     - `getVideo(videoId)`

2. **State Management**
   - React useState/useContext for global state
   - Track: uploaded image, generation status, video URL
   - Loading states for each operation

3. **Polling Implementation**
   - Frontend polls every 10 seconds
   - Display progress updates
   - Handle completion/errors
   - Auto-stop polling when done

4. **End-to-End Testing**
   - Test image upload
   - Test video generation with various parameters
   - Test error scenarios (invalid image, API errors)
   - Test on different screen sizes

**Deliverable**: Working end-to-end video generation flow.

**Status**: ✅ COMPLETE

---

### Phase 5: Dockerization & Local Deployment (1-2 hours)
**Goal**: Containerize application for easy local deployment.

1. **Backend Dockerfile**
   - Use Python 3.11 slim image
   - Install dependencies from requirements.txt
   - Copy application code
   - Expose port 8000
   - Set up volume for video storage

2. **Frontend Dockerfile**
   - Multi-stage build:
     - Stage 1: Build React app with Vite
     - Stage 2: Serve with nginx
   - Expose port 80

3. **Docker Compose Configuration**
   - Define services: `backend`, `frontend`
   - Set up networking
   - Configure volumes:
     - `./backend:/app` (dev hot-reload)
     - `./videos:/app/videos` (video persistence)
   - Environment variables (.env file)
   - Port mappings:
     - Frontend: http://localhost:3000
     - Backend: http://localhost:8000

4. **Environment Configuration**
   - Create `.env.example` template
   - Document required variables:
     - `GEMINI_API_KEY`
     - `BACKEND_URL`
     - `VIDEO_STORAGE_PATH`

5. **Testing Docker Deployment**
   - Build containers
   - Run docker-compose up
   - Test full workflow in containerized environment
   - Verify volume persistence

**Deliverable**: Dockerized POC ready for local deployment.

---

### Phase 6: Polish, Documentation & Validation (30-60 mins)
**Goal**: Finalize POC with documentation and testing.

1. **Error Handling Improvements**
   - Graceful API failures
   - User-friendly error messages
   - Retry logic for transient failures

2. **Documentation**
   - Update README.md:
     - Project overview
     - Prerequisites
     - Setup instructions
     - Docker deployment steps
     - Environment variables guide
     - Usage guide
     - Troubleshooting
   - Code comments for complex logic
   - API documentation (FastAPI auto-docs)

3. **Mobile Testing**
   - Test on various mobile screen sizes
   - Verify responsive design
   - Test touch interactions

4. **Final Validation Checklist**
   - ✓ Image upload works
   - ✓ Video generation with all parameter combinations
   - ✓ Audio playback in generated videos
   - ✓ Polling mechanism works reliably
   - ✓ Videos stored locally
   - ✓ Error handling covers edge cases
   - ✓ Mobile responsive
   - ✓ Docker deployment works
   - ✓ Documentation complete

**Deliverable**: Production-ready POC with full documentation.

---

## Timeline Summary
- **Total**: 6-10 hours for fully functional POC
- **Phase 1**: 30-45 mins (Setup)
- **Phase 2**: 2-3 hours (Backend)
- **Phase 3**: 2-3 hours (Frontend)
- **Phase 4**: 1-2 hours (Integration)
- **Phase 5**: 1-2 hours (Docker)
- **Phase 6**: 30-60 mins (Polish)

**Recommended Approach**: Complete Phases 1-2 first, then run parallel development on Phase 3 while testing Phase 2.

## Risks & Considerations
- Veo API limits and async handling.
- Image validation and security.
- Scale to prod: Refactor to FastAPI, add DB, deploy to cloud.