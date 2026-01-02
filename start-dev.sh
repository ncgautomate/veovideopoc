#!/bin/bash
# Linux/Mac startup script for Veo Video Generator
# Starts both backend and frontend servers

echo "============================================"
echo "  Veo Video Generator - Development Mode"
echo "============================================"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "ERROR: .env file not found!"
    echo "Please create .env file with your GEMINI_API_KEY"
    echo ""
    exit 1
fi

# Check if backend venv exists
if [ ! -d "backend/venv" ]; then
    echo "ERROR: Backend virtual environment not found!"
    echo "Please run: cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    echo ""
    exit 1
fi

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "ERROR: Frontend node_modules not found!"
    echo "Please run: cd frontend && npm install"
    echo ""
    exit 1
fi

echo "Starting Backend Server..."
echo "Backend will run on: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""

# Start backend in background
cd backend
source venv/bin/activate
python run.py &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

echo "Starting Frontend Server..."
echo "Frontend will run on: http://localhost:5173"
echo ""

# Start frontend in background
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================"
echo "  Both servers are running!"
echo "============================================"
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Backend PID:  $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Wait for Ctrl+C
wait
