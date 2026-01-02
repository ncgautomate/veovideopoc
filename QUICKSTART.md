# Quick Start Guide - Veo Video Generator

This guide will help you quickly set up and run the Veo Video Generation webapp locally.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Python 3.11+** installed - Check: `python --version`
- [ ] **Node.js 18+** installed - Check: `node --version`
- [ ] **npm** installed - Check: `npm --version`
- [ ] **Google Gemini API Key** - Get from: https://aistudio.google.com/apikey

## 🚀 Quick Setup (5 Minutes)

### Step 1: Set Up Environment Variables

1. Open the `.env` file in the project root
2. Add your Google Gemini API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
BACKEND_PORT=9000
BACKEND_HOST=0.0.0.0
VITE_BACKEND_URL=http://localhost:9000
VIDEO_STORAGE_PATH=./videos
```

**Note:** If you need to change the backend port (e.g., another app is using port 8000), update `BACKEND_PORT` and `VITE_BACKEND_URL` accordingly.

Save the file.

### Step 2: Install Backend Dependencies

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

### Step 3: Install Frontend Dependencies

```bash
# Open a new terminal (keep backend terminal open)
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install
```

## 🎬 Running the Application

You have two options:

### Option A: Using Startup Scripts (Recommended)

**Windows:**
```bash
# Double-click or run:
start-dev.bat
```

**Mac/Linux:**
```bash
# Make script executable (first time only)
chmod +x start-dev.sh

# Run the script
./start-dev.sh
```

This will automatically start both backend and frontend servers.

### Option B: Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Start backend server
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend

# Start frontend dev server
npm run dev
```

## 📍 Access the Application

Once both servers are running:

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:9000 (or your configured port)
- **API Documentation**: http://localhost:9000/docs
- **Alternative API Docs**: http://localhost:9000/redoc

## ✅ Verify Setup

1. **Check Backend Health:**
   - Open http://localhost:9000/api/health (or your configured port)
   - Should see: `{"status": "healthy", ...}`

2. **Check Frontend:**
   - Open http://localhost:5173
   - Should see the Veo Video Generator interface

## 🎥 Using the Application

### Step-by-Step Workflow

1. **Upload Image**
   - Drag and drop an image (PNG or JPEG, max 20MB)
   - Or click to browse and select
   - Image should preview immediately

2. **Create Prompt**
   - Write a detailed prompt (see tips below)
   - Configure parameters:
     - Resolution: 720p or 1080p
     - Duration: 4, 6, or 8 seconds
     - Aspect Ratio: 16:9 or 9:16
   - Optional: Add negative prompt
   - Click "🎬 Generate Video"

3. **Wait for Generation**
   - Progress bar shows status
   - Typical time: 11 seconds to 6 minutes
   - Updates every 10 seconds

4. **Watch & Download**
   - Video plays automatically when ready
   - Includes native AI-generated audio
   - Click "Download Video" to save
   - Click "Generate Another Video" to start over

### Prompt Engineering Tips

**Good Prompt Example:**
```
A chef preparing pasta in a modern kitchen. "This is my
grandmother's recipe," the chef says warmly. Sound of
sizzling garlic and bubbling sauce. Smooth camera dolly
from left to right. Warm lighting, professional food
photography style.
```

**Include:**
- **Subject**: Main focus (e.g., "a golden retriever puppy")
- **Action**: Movement (e.g., "running through a meadow")
- **Style**: Aesthetic (e.g., "cinematic, warm tones")
- **Camera**: Motion (e.g., "aerial dolly shot")
- **Audio**: Dialogue in quotes, sound effects described

## 🔧 Troubleshooting

### Backend Won't Start

**Error: "GEMINI_API_KEY not found"**
```bash
Solution:
1. Check .env file exists in project root (not in backend folder)
2. Verify API key is set: GEMINI_API_KEY=your_key
3. Restart backend server
```

**Error: "Module 'google' has no attribute 'genai'"**
```bash
Solution:
pip uninstall google-genai
pip install google-genai==0.2.0
```

**Error: "Address already in use"**
```bash
Solution:
1. Change the port in .env file:
   BACKEND_PORT=9000 (or any available port)
   VITE_BACKEND_URL=http://localhost:9000
2. Update frontend/.env with matching backend URL
3. Restart both servers

Or kill the process using the port (Windows):
netstat -ano | findstr :{port}
taskkill /PID <process_id> /F

Or kill the process (Mac/Linux):
lsof -ti:{port} | xargs kill -9
```

### Frontend Won't Start

**Error: "Cannot find module"**
```bash
Solution:
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error: "Port 5173 is already in use"**
```bash
Solution:
1. Stop other Vite dev servers
2. Or use different port: npm run dev -- --port 5174
```

### API Connection Issues

**Error: "Network Error" or "CORS Error"**
```bash
Solution:
1. Verify backend is running on correct port (check .env BACKEND_PORT)
2. Check frontend/.env has matching VITE_BACKEND_URL
3. Restart frontend: npm run dev
4. Check browser console for specific error
```

### Video Generation Issues

**Error: "Video generation failed"**
```bash
Possible causes:
1. Invalid API key - verify at https://aistudio.google.com/apikey
2. Image too large - max 20MB
3. Prompt contains unsafe content - modify prompt
4. API quota exceeded - check Google AI Studio
```

**Status stuck on "processing"**
```bash
Solution:
1. Wait up to 6 minutes (peak times)
2. Check backend logs for errors
3. Verify network connection
4. Try generating again with different parameters
```

## 📊 Backend Logs

To see detailed backend logs:

```bash
# In backend terminal, you'll see:
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
🚀 Veo Video Generation API Starting...
📝 API Documentation: http://0.0.0.0:8000/docs
🎬 Using Veo 3.1 Model: veo-3.1-generate-preview
💾 Video Storage: ./videos
```

## 🧪 Testing with API Docs

1. Open http://localhost:9000/docs (or your configured backend port)
2. Test endpoints interactively:
   - **POST /api/upload-image** - Upload a test image
   - **POST /api/generate-video** - Start generation
   - **GET /api/video-status/{id}** - Check status
   - **GET /api/videos/{id}** - Download video

## 📁 Generated Videos Location

Videos are saved locally in:
```
project-root/videos/
```

Each video is named: `{video_id}.mp4`

## 🛑 Stopping the Application

**If using startup scripts:**
- Press `Ctrl+C` in the terminal(s)

**If running manually:**
- Press `Ctrl+C` in each terminal (backend and frontend)

## 💡 Tips for Best Results

1. **Image Quality**: Use high-resolution images for best results
2. **Prompt Detail**: More detailed prompts = better videos
3. **Audio Cues**: Include dialogue in quotes and describe sound effects
4. **Patience**: First generation may take longer (up to 6 min)
5. **Resolution**: Start with 720p for faster generation
6. **Duration**: 8-second videos show more detail

## 🔄 Starting Fresh

To reset everything:

```bash
# Stop all servers (Ctrl+C)

# Clear generated videos
rm -rf videos/*
rm -rf uploads/*

# Restart servers
```

## 📚 Additional Resources

- **Google Veo Documentation**: https://ai.google.dev/gemini-api/docs/video
- **Backend Testing Guide**: [backend/TESTING.md](backend/TESTING.md)
- **Full Implementation Guide**: [docs/implementation-guide.md](docs/implementation-guide.md)
- **Planning Document**: [docs/planning.md](docs/planning.md)

## ✨ Features Summary

- ✅ Image upload (drag & drop)
- ✅ Native audio generation
- ✅ 720p and 1080p resolution
- ✅ 4, 6, or 8 second duration
- ✅ Landscape (16:9) and Portrait (9:16)
- ✅ Negative prompts
- ✅ Real-time progress updates
- ✅ Video download
- ✅ Mobile responsive

## 🎯 Next Steps

After successfully running the app:

1. **Phase 5**: Dockerization - See [docs/planning.md](docs/planning.md)
2. **Production Deployment**: Configure for Azure/cloud deployment
3. **Enhancements**: Add user authentication, video gallery, etc.

## 🆘 Need Help?

- Check backend logs in terminal
- Visit http://localhost:8000/docs for API testing
- Review error messages in browser console (F12)
- Check [README.md](README.md) for more details
- Review troubleshooting section above

---

**Ready to generate amazing videos!** 🎬✨
