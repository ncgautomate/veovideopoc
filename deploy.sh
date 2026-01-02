#!/bin/bash

# CleverCreator.ai - Quick Deploy Script
# This script helps you quickly deploy the application using Docker

set -e  # Exit on error

echo "=========================================="
echo "  CleverCreator.ai - Docker Deployment"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Please install Docker Compose first"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "📝 Please edit .env file and add your Google API keys:"
    echo "   - GOOGLE_GENAI_API_KEY"
    echo "   - GOOGLE_API_KEY"
    echo ""
    echo "After updating .env, run this script again."
    exit 1
fi

echo "✅ .env file found"
echo ""

# Check if API keys are set
if grep -q "your_google_veo_api_key_here" .env || grep -q "your_google_gemini_api_key_here" .env; then
    echo "⚠️  API keys not configured!"
    echo "Please edit .env and add your actual Google API keys."
    exit 1
fi

echo "✅ API keys configured"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Build and start containers"
echo "2) Stop containers"
echo "3) Restart containers"
echo "4) View logs"
echo "5) Rebuild containers (fresh build)"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🔨 Building Docker images..."
        docker-compose build
        echo ""
        echo "🚀 Starting containers..."
        docker-compose up -d
        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "📊 Container status:"
        docker-compose ps
        echo ""
        echo "🌐 Access your application:"
        echo "   Frontend: http://localhost"
        echo "   Backend:  http://localhost:9000"
        ;;
    2)
        echo ""
        echo "⏹️  Stopping containers..."
        docker-compose down
        echo ""
        echo "✅ Containers stopped"
        ;;
    3)
        echo ""
        echo "🔄 Restarting containers..."
        docker-compose restart
        echo ""
        echo "✅ Containers restarted"
        echo ""
        docker-compose ps
        ;;
    4)
        echo ""
        echo "📋 Showing logs (Ctrl+C to exit)..."
        docker-compose logs -f
        ;;
    5)
        echo ""
        echo "🔨 Rebuilding containers (no cache)..."
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        echo ""
        echo "✅ Rebuild complete!"
        echo ""
        docker-compose ps
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "For more information, see DEPLOYMENT.md"
echo "=========================================="
