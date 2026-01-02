# 🐳 Docker Quick Start Guide

Get CleverCreator.ai running in **5 minutes** using Docker!

---

## ⚡ Quick Start (3 Steps)

### 1️⃣ Clone & Configure

```bash
# Clone the repository (or upload to your VPS)
git clone https://github.com/yourusername/veo2-video-poc-webapp.git
cd veo2-video-poc-webapp

# Copy and edit environment file
cp .env.example .env
nano .env  # or use any text editor
```

**Add your Google API keys to `.env`:**
```env
GOOGLE_GENAI_API_KEY=your_actual_veo_api_key_here
GOOGLE_API_KEY=your_actual_gemini_api_key_here
```

---

### 2️⃣ Build & Deploy

**On Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
# Select option 1: Build and start containers
```

**On Windows:**
```cmd
deploy.bat
# Select option 1: Build and start containers
```

**Or manually:**
```bash
docker-compose up -d --build
```

---

### 3️⃣ Access Your App

- **Frontend**: http://localhost
- **Backend**: http://localhost:9000

That's it! 🎉

---

## 🌐 Production Deployment (VPS)

### For Custom Domain:

1. **Update `.env` with your domain:**
```env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
VITE_BACKEND_URL=https://api.yourdomain.com
```

2. **Rebuild with new config:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

3. **Configure Nginx reverse proxy** (see [DEPLOYMENT.md](DEPLOYMENT.md#domain-configuration))

4. **Setup SSL with Let's Encrypt:**
```bash
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## 📋 Common Commands

```bash
# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# Check status
docker-compose ps

# Update after code changes
git pull
docker-compose build
docker-compose up -d
```

---

## 🔧 Troubleshooting

### Port 80 already in use?
```bash
# Change frontend port in docker-compose.yml
ports:
  - "8080:80"  # Access at http://localhost:8080
```

### API keys not working?
```bash
# Verify environment variables
docker-compose exec backend env | grep GOOGLE

# Restart after .env changes
docker-compose restart
```

### CORS errors?
Add your domain to `CORS_ORIGINS` in `.env` and restart:
```bash
docker-compose restart backend
```

---

## 📚 Full Documentation

For complete deployment guide, SSL setup, monitoring, and advanced configuration:

👉 **See [DEPLOYMENT.md](DEPLOYMENT.md)**

---

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. Verify `.env` configuration
3. Ensure ports 80 and 9000 are available
4. Make sure Docker is running

---

**Happy Creating! 🚀**

© 2025 CleverCreator.ai | Powered by Veo 3.1
