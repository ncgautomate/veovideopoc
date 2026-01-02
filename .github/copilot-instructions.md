# Veo Video Generator - AI Agent Instructions

## Architecture Overview
- **Backend**: FastAPI (Python) with modular structure: `routes/` for endpoints, `services/` for business logic, `config.py` for settings, `models.py` for Pydantic schemas.
- **Frontend**: React + Vite + Tailwind CSS, components in `src/components/`, API client in `src/services/`.
- **Data Flow**: Image upload → backend validates/stores in `uploads/` → generates video via Gemini Veo API → stores in `videos/` → frontend polls status and downloads.
- **Key Decision**: Async video generation with polling (Veo API is non-blocking); in-memory operation tracking for simplicity.

## Critical Workflows
- **Local Dev**: Activate Python venv (`venv\Scripts\activate` on Windows), install deps (`pip install -r requirements.txt`), run backend (`uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`), frontend (`npm run dev`).
- **Full App**: Use `docker-compose up` for containerized deployment.
- **Testing**: Follow `TESTING.md` - curl endpoints like `POST /api/upload-image` with multipart/form-data, poll `GET /api/video-status/{operation_id}`.
- **Build**: Backend uses uvicorn; frontend `npm run build` for production static files.

## Project-Specific Conventions
- **Configuration**: Use `get_settings()` from `config.py` for env vars (e.g., `GEMINI_API_KEY`); .env in project root.
- **Models**: Enums for resolution/aspect_ratio/duration in `models.py`; validate with Pydantic (max 1024 chars for prompts).
- **Error Handling**: Raise `HTTPException` with status/details; try/except in services for API failures.
- **File Handling**: Base64 encode images for Gemini API; store videos as UUID-named files.
- **CORS**: Configured in `main.py` for localhost:5173/3000 (Vite/Docker ports).
- **API Patterns**: Async endpoints; operation IDs for tracking; health check at `/api/health`.

## Integration Points
- **Gemini API**: Use `genai.Client` in `video_service.py`; handle `types.GenerateContentConfig` for Veo model (`veo-3.1-generate-preview`).
- **Frontend-Backend**: Axios calls to `VITE_BACKEND_URL` (env var); handle multipart uploads and polling.
- **Storage**: Local dirs (`videos/`, `uploads/`); no DB, use in-memory dicts for operations.

## Examples
- Add endpoint: Follow `video_routes.py` - define router, use `response_model`, handle files with `UploadFile`.
- Video gen: In `video_service.py`, create operation ID, start async gen, return ID for polling.
- Component: Use Tailwind classes for responsive design; fetch from API in `useEffect`.