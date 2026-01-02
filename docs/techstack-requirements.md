# Veo Video Generation Webapp - Tech Stack Requirements

## POC Stack (Local Docker Deployment)
- **Frontend**: React with Vite (fast dev, modern UI).
- **Backend**: Python with FastAPI (async-native for long-polling, AI-friendly).
- **Styling**: Tailwind CSS (responsive, minimalistic).
- **API Integration**: Google Gemini SDK (`google-genai` Python library) for Veo 3.1 video generation.
- **Video Model**: Veo 3.1 (`veo-3.1-generate-preview`) - supports native audio, 720p/1080p, 4-8 seconds.
- **Storage**: Local filesystem with Docker volumes (videos expire on Google servers after 2 days).
- **Containerization**: Docker (Dockerfile, docker-compose.yml).
- **Other**: Axios for HTTP requests, FastAPI built-in file handling, Python `aiofiles` for async file operations.

## Production Stack (Scalable)
- **Frontend**: React (Vite build), deployed as static site (e.g., Azure Static Web Apps).
- **Backend**: Python FastAPI (async, AI-friendly for Gemini integration).
- **Database**: PostgreSQL (store metadata; use Azure Blob for videos).
- **Caching/Queue**: Redis/Azure Queue Storage (for async video processing).
- **Orchestration**: Docker + Kubernetes (AKS for scaling).
- **Deployment**: Azure (App Service/Functions, CDN for global access).
- **Monitoring**: Azure Application Insights.

## Why This Stack?
- POC: Quick setup with familiar tools.
- Prod: Python excels in AI; FastAPI for performance; PostgreSQL for reliability; Azure for managed scaling and cost-efficiency.
- Alternatives: Node.js for backend if preferred; Django if full framework needed.

## Dependencies

### POC Dependencies
**Frontend (React + Vite):**
- npm/yarn for package management
- React, React-DOM
- Tailwind CSS
- Axios for API calls
- React Player (for video playback with audio)

**Backend (Python FastAPI):**
- Python 3.11+
- FastAPI
- Uvicorn (ASGI server)
- google-genai (Gemini SDK)
- python-multipart (file uploads)
- python-dotenv (environment variables)
- aiofiles (async file operations)

**Infrastructure:**
- Docker & Docker Compose
- Google Gemini API Key (from https://aistudio.google.com/apikey)

### Production Dependencies
- All POC dependencies
- PostgreSQL driver (psycopg2)
- Azure SDK for Python
- Redis client
- Azure CLI for deployment
- Kubernetes/AKS manifests