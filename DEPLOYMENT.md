# 🚀 CleverCreator.ai - Docker Deployment Guide

This guide will help you deploy CleverCreator.ai on your VPS server using Docker.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ A VPS server (Ubuntu 20.04+ recommended)
- ✅ Docker installed (version 20.10+)
- ✅ Docker Compose installed (version 2.0+)
- ✅ Domain name pointed to your VPS (optional, but recommended)
- ✅ Google AI API keys:
  - **Google Veo API Key** (for video generation)
  - **Google Gemini API Key** (for chat and optimization)
  - Get them at: https://ai.google.dev/

---

## 🔧 Installation Steps

### 1. Install Docker (if not already installed)

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Logout and login again for group changes to take effect
```

---

### 2. Clone the Repository

```bash
# Clone your repository
git clone https://github.com/yourusername/veo2-video-poc-webapp.git
cd veo2-video-poc-webapp

# Or upload your project files via SFTP/SCP
```

---

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your credentials
nano .env
```

**Update the following values in `.env`:**

```env
# Google AI API Keys (REQUIRED)
GOOGLE_GENAI_API_KEY=your_actual_veo_api_key
GOOGLE_API_KEY=your_actual_gemini_api_key

# CORS Origins - Add your domain(s)
CORS_ORIGINS=http://localhost,https://yourdomain.com,https://www.yourdomain.com

# For production deployment with custom domain
VITE_BACKEND_URL=https://api.yourdomain.com
```

---

### 4. Build and Run with Docker Compose

```bash
# Build the Docker images
docker-compose build

# Start the containers
docker-compose up -d

# View logs (optional)
docker-compose logs -f

# Check container status
docker-compose ps
```

---

## 🌐 Domain Configuration

### Option 1: Using Nginx Reverse Proxy (Recommended)

If you have other websites on the same VPS, use Nginx as a reverse proxy:

#### Install Nginx (if not already installed)

```bash
sudo apt install nginx -y
```

#### Create Nginx Configuration for CleverCreator.ai

```bash
sudo nano /etc/nginx/sites-available/clevercreator
```

**Add the following configuration:**

```nginx
# Frontend - Main domain
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API - Subdomain
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Increase timeout for video generation
        proxy_read_timeout 600s;
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
    }
}
```

#### Enable the site and restart Nginx

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/clevercreator /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

### Option 2: SSL/HTTPS with Let's Encrypt (Highly Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

---

### Option 3: Direct Port Mapping (Simple, No Other Sites)

If CleverCreator.ai is the only site on your VPS:

**Update `docker-compose.yml` ports:**

```yaml
services:
  frontend:
    ports:
      - "80:80"    # HTTP
      - "443:443"  # HTTPS (if using SSL)

  backend:
    ports:
      - "9000:9000"
```

---

## 🔍 Verification

### Check if services are running:

```bash
# Check Docker containers
docker-compose ps

# Should show:
# clevercreator-frontend   running   0.0.0.0:80->80/tcp
# clevercreator-backend    running   0.0.0.0:9000->9000/tcp

# Check logs
docker-compose logs backend
docker-compose logs frontend

# Test backend health
curl http://localhost:9000/health

# Test frontend
curl http://localhost:80
```

### Access your application:

- **Frontend**: `http://yourdomain.com` or `http://your-vps-ip`
- **Backend API**: `http://api.yourdomain.com` or `http://your-vps-ip:9000`

---

## 🛠️ Common Commands

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (⚠️ deletes uploaded files)
docker-compose down -v

# Rebuild after code changes
docker-compose build --no-cache
docker-compose up -d

# View real-time logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update to latest code
git pull
docker-compose build
docker-compose up -d
```

---

## 📊 Monitoring & Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f backend

# Check container resource usage
docker stats
```

---

## 🔒 Security Best Practices

1. **Firewall Configuration:**
```bash
# Allow only necessary ports
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH
sudo ufw enable
```

2. **Keep API Keys Secret:**
   - Never commit `.env` file to Git
   - Use strong, unique API keys
   - Rotate keys periodically

3. **Regular Updates:**
```bash
# Update Docker images
docker-compose pull
docker-compose up -d

# Update system packages
sudo apt update && sudo apt upgrade -y
```

4. **Backups:**
```bash
# Backup uploaded files
docker-compose exec backend tar -czf /app/uploads-backup.tar.gz /app/uploads

# Copy backup to host
docker cp clevercreator-backend:/app/uploads-backup.tar.gz ./backups/
```

---

## 🐛 Troubleshooting

### Issue: Containers won't start

```bash
# Check logs for errors
docker-compose logs

# Verify .env file is configured
cat .env

# Check if ports are already in use
sudo lsof -i :80
sudo lsof -i :9000
```

### Issue: API keys not working

```bash
# Verify environment variables are loaded
docker-compose exec backend env | grep GOOGLE

# Restart containers after changing .env
docker-compose down
docker-compose up -d
```

### Issue: CORS errors

```bash
# Update CORS_ORIGINS in .env
# Add your domain to the list
CORS_ORIGINS=http://localhost,https://yourdomain.com

# Restart backend
docker-compose restart backend
```

### Issue: Frontend can't connect to backend

1. Check `VITE_BACKEND_URL` in `.env`
2. Ensure backend is accessible: `curl http://localhost:9000/health`
3. Verify CORS configuration includes your frontend domain

---

## 📈 Performance Optimization

### Increase Docker Resources (if needed)

Edit `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Enable Swap (for low-memory VPS)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify all environment variables are set correctly
3. Ensure API keys are valid
4. Check firewall and port configurations

---

## 📝 License

© 2025 CleverCreator.ai | Powered by Veo 3.1
