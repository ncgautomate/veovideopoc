from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routes.video_routes import router as video_router
from app.config import get_settings
import time

settings = get_settings()

# Create FastAPI application
app = FastAPI(
    title="CleverCreator.ai API",
    description="AI-powered video generation using Google Veo 3.1",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server (local)
        "http://localhost:5175",  # Nuclear reset frontend port
        "http://localhost:3000",  # Docker frontend
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:3000",
        "http://192.168.1.35:5173",  # Network access (host computer)
        "http://192.168.1.35:5175",
        "http://192.168.1.35:3000",
    ],
    allow_origin_regex=r"http://(192\.168\.\d{1,3}\.\d{1,3}|172\.\d{1,3}\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|localhost|127\.0\.0\.1):(5173|5175|3000|9001|9005)",  # Allow all local network IPs and common ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Log all incoming requests with details for debugging
    """
    start_time = time.time()

    # Log incoming request
    print(f"\n{'='*60}")
    print(f"[INCOMING REQUEST]")
    print(f"{'='*60}")
    print(f"Method: {request.method}")
    print(f"Path: {request.url.path}")
    print(f"Client: {request.client.host if request.client else 'Unknown'}")
    print(f"Origin: {request.headers.get('origin', 'No Origin header')}")
    print(f"User-Agent: {request.headers.get('user-agent', 'Unknown')[:50]}...")

    # Process request
    try:
        response = await call_next(request)

        # Log response
        process_time = (time.time() - start_time) * 1000
        print(f"\n[RESPONSE]")
        print(f"Status: {response.status_code}")
        print(f"Time: {process_time:.2f}ms")
        print(f"{'='*60}\n")

        return response

    except Exception as e:
        # Log error
        print(f"\n[REQUEST ERROR]")
        print(f"Error: {type(e).__name__}: {str(e)}")
        print(f"{'='*60}\n")
        raise

# Include API routes
app.include_router(video_router)


@app.get("/")
async def root():
    """
    Root endpoint - API information
    """
    return {
        "message": "CleverCreator.ai API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/api/health",
        "endpoints": {
            "upload_image": "POST /api/upload-image",
            "generate_video": "POST /api/generate-video",
            "check_status": "GET /api/video-status/{operation_id}",
            "list_videos": "GET /api/videos",
            "get_video": "GET /api/videos/{video_id}",
            "delete_video": "DELETE /api/videos/{video_id}",
            "library": "GET /api/library",
            "toggle_visibility": "PATCH /api/videos/{video_id}/visibility",
            "models_info": "GET /api/models",
            "optimize_prompt": "POST /api/optimize-prompt",
            "chat": "POST /api/chat"
        },
        "status": "running"
    }


@app.on_event("startup")
async def startup_event():
    """
    Startup event - Log application start and validate configuration
    """
    print("\n" + "=" * 80)
    print("  CLEVERCREATOR.AI API STARTING")
    print("=" * 80)

    # Server Configuration
    print(f"\n[SERVER CONFIGURATION]")
    print(f"   Host: {settings.backend_host}")
    print(f"   Port: {settings.backend_port}")
    print(f"   API Docs: http://{settings.backend_host}:{settings.backend_port}/docs")
    print(f"   API Root: http://{settings.backend_host}:{settings.backend_port}/")

    # API Key Validation
    print(f"\n[API KEY VALIDATION]")
    if settings.gemini_api_key:
        print(f"   [OK] Gemini API Key: Present (length: {len(settings.gemini_api_key)})")
        print(f"   API Key prefix: {settings.gemini_api_key[:15]}...")
    else:
        print(f"   [ERROR] Gemini API Key is MISSING!")
        print(f"   Please set GEMINI_API_KEY in backend/.env")

    # AI Models Configuration
    print(f"\n[AI MODELS CONFIGURATION]")
    print(f"   Video Generation: {settings.video_model}")
    print(f"   Chat Assistant:   {settings.chat_model}")
    print(f"   Prompt Optimizer: {settings.optimize_model}")

    # Storage Configuration
    print(f"\n[STORAGE CONFIGURATION]")
    print(f"   Video Storage Path: {settings.video_storage_path}")
    print(f"   Max File Size: {settings.max_file_size / (1024*1024):.1f} MB")

    # CORS Configuration
    print(f"\n[CORS CONFIGURATION]")
    print(f"   Allowed Origins:")
    print(f"     - http://localhost:5173 (standard Vite)")
    print(f"     - http://localhost:5175 (nuclear reset)")
    print(f"     - http://172.26.160.1:5173")
    print(f"     - http://172.26.160.1:5175")
    print(f"   Regex Pattern: Supports all local network IPs on ports 5173, 5175, 9001, 9005")

    # Registered API Routes
    print(f"\n[REGISTERED API ROUTES]")
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            methods = ', '.join(route.methods)
            print(f"   {methods:10} {route.path}")

    print("\n" + "=" * 80)
    print("  [OK] BACKEND READY - Waiting for requests...")
    print("=" * 80 + "\n")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Shutdown event - Cleanup
    """
    print("Shutting down CleverCreator.ai API...")
