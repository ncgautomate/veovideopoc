#!/bin/bash
# Linux/Mac script to run the backend server
# Activates virtual environment and starts uvicorn

echo "Starting Veo Video Generation API Backend..."
echo ""

# Check if virtual environment exists
if [ ! -f "venv/bin/activate" ]; then
    echo "Virtual environment not found!"
    echo "Please run: python -m venv venv"
    echo "Then: source venv/bin/activate"
    echo "Then: pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if .env file exists
if [ ! -f "../.env" ]; then
    echo "WARNING: .env file not found in project root!"
    echo "Please create .env file with your GEMINI_API_KEY"
    echo ""
fi

# Run the server
python run.py
