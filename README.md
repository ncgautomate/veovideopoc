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

- **Docker & Docker Compose** (for containerized deployment)
- **Python 3.11+** (for local development)
- **Node.js 18+** and npm (for frontend development)
- **Google Gemini API Key** - Get it from: https://aistudio.google.com/apikey

## Project Structure

```
veo2-video-poc-webapp/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── config.py       # Configuration
│   │   └── models.py       # Pydantic models
│   └── requirements.txt    # Python dependencies
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API client
│   │   └── App.jsx        # Main app
│   └── package.json       # Node dependencies
├── videos/                # Generated videos storage
├── uploads/               # Temporary image uploads
├── docker-compose.yml     # Docker orchestration
├── .env                   # Environment variables
└── docs/                  # Documentation
```

## Quick Start (Local Development)

### Step 1: Set up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Google Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### Step 2: Set up Backend

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

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Set up Frontend

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
# Make sure venv is activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Quick Start (Docker)

### Using Docker Compose (Recommended)

```bash
# Make sure .env file has your GEMINI_API_KEY

# Build and start containers
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python FastAPI + Google Gemini SDK
- **Model**: Veo 3.1 (`veo-3.1-generate-preview`)
  - Native audio generation
  - 720p and 1080p resolution options
  - 4, 6, or 8 second duration
  - 16:9 or 9:16 aspect ratio
- **Storage**: Local filesystem (videos expire on Google servers after 2 days)

## API Endpoints

- `GET /` - API info
- `GET /health` - Health check
- `POST /api/upload-image` - Upload image file
- `POST /api/generate-video` - Start video generation
- `GET /api/video-status/{operation_id}` - Check generation status
- `GET /api/videos/{video_id}` - Download generated video

Full interactive API documentation available at: http://localhost:8000/docs

## Usage

1. **Upload an Image**: Drag and drop or select a PNG/JPEG image (max 20MB)
2. **Write a Prompt**: Describe the video you want to create
   - Include: subject, action, style, camera angle
   - Add audio cues in quotes for dialogue
   - Specify sound effects descriptively
3. **Configure Parameters**:
   - Resolution: 720p or 1080p
   - Duration: 4, 6, or 8 seconds
   - Aspect Ratio: 16:9 (landscape) or 9:16 (portrait)
   - Optional: Add negative prompt for elements to exclude
4. **Generate**: Click "Generate Video" and wait (11s-6min)
5. **Download**: Once complete, view with audio and download

## Prompt Engineering Tips

Effective prompts include:

- **Subject**: Main focus (e.g., "a golden retriever puppy")
- **Action**: Movement description (e.g., "running through a field")
- **Style**: Creative direction (e.g., "cinematic, warm tones")
- **Camera**: Motion and angle (e.g., "aerial dolly shot")
- **Audio**: Dialogue in quotes, sound effects described

**Example:**
```
A close-up of a chef preparing pasta in a modern kitchen.
"This is my grandmother's recipe," the chef says warmly.
Sound of sizzling garlic and bubbling sauce. Soft jazz playing
in the background. Warm lighting, professional food photography
style, smooth camera dolly from left to right.
```

## Development Status

### Phase 1: Environment & Project Setup ✅ COMPLETE
- [x] Project structure created
- [x] Backend setup with FastAPI
- [x] Frontend setup with React + Vite + Tailwind
- [x] Environment configuration
- [x] Dependencies configured

### Phase 2: Backend Core ✅ COMPLETE
- [x] Video generation API endpoints
- [x] Veo 3.1 SDK integration
- [x] Polling mechanism
- [x] Video storage
- [x] FastAPI application with CORS
- [x] Comprehensive error handling
- [x] Testing guide and startup scripts

### Phase 3: Frontend UI/UX ✅ COMPLETE
- [x] Image upload component with drag & drop
- [x] Prompt form with all parameters
- [x] Video player with audio support
- [x] Progress indicator with polling visualization
- [x] API service layer
- [x] Complete workflow integration
- [x] Responsive design with Tailwind CSS
- [x] Step indicator and error handling

### Phase 4: API Integration & Testing ✅ COMPLETE
- [x] API service layer integration
- [x] State management with React hooks
- [x] Polling mechanism (10-second intervals)
- [x] End-to-end testing documentation
- [x] Quick start guide
- [x] Startup scripts (Windows & Linux/Mac)
- [x] Comprehensive testing guide
- [x] Troubleshooting documentation

### Phase 5: Dockerization (Pending)
- [ ] Backend Dockerfile
- [ ] Frontend Dockerfile
- [ ] Docker Compose configuration

### Phase 6: Polish & Documentation (Pending)
- [ ] Error handling improvements
- [ ] Mobile testing
- [ ] Final validation

## Troubleshooting

### Backend won't start
- Verify Python 3.11+ is installed: `python --version`
- Make sure virtual environment is activated
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify `.env` file exists with valid `GEMINI_API_KEY`

### Frontend won't start
- Verify Node.js 18+ is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for port conflicts (default: 5173)

### API Key Issues
- Get your API key from: https://aistudio.google.com/apikey
- Ensure key is set in `.env` file as `GEMINI_API_KEY=your_key`
- Restart backend after updating `.env`

### Docker Issues
- Ensure Docker Desktop is running
- Check `.env` file is in project root with valid API key
- View logs: `docker-compose logs backend` or `docker-compose logs frontend`

## Documentation

- [Planning Document](docs/planning.md) - Detailed implementation phases
- [Tech Stack Requirements](docs/techstack-requirements.md) - Technology choices
- [Implementation Guide](docs/implementation-guide.md) - Step-by-step instructions
- [Google Veo Documentation](https://ai.google.dev/gemini-api/docs/video) - Official API docs

## Next Steps (Production)

1. **Security**: Add authentication, rate limiting, secure API key storage
2. **Scalability**: PostgreSQL, Azure Blob Storage, Redis, deploy to Azure
3. **Monitoring**: Structured logging, Application Insights, alerts
4. **Features**: Video history, user accounts, batch generation, video editing

## License

MIT

## Support

For issues and questions:
- Google Veo Documentation: https://ai.google.dev/gemini-api/docs/video
- FastAPI Documentation: https://fastapi.tiangolo.com/
- React Documentation: https://react.dev/
