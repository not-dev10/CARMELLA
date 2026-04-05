# Carmella Backend - AWS EC2 Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────┐
│    AWS EC2 Instance (Ubuntu)    │
├─────────────────────────────────┤
│  Port 80/443 - Nginx (Reverse   │
│               Proxy)             │
│       ↓                          │
│  Port 5000 - Node.js Backend    │
│  (PM2 Process Manager)          │
│       ↓                          │
│  Port 6379 - Redis (Docker)     │
│                                 │
│  External:                      │
│  - Supabase (Database)          │
│  - AWS S3 (Storage)             │
│  - Google OAuth (Auth)          │
└─────────────────────────────────┘
```

**Technology Stack:**
- **Frontend**: React + Vite (deployed separately)
- **Backend**: Node.js 18+ (PM2 process manager)
- **Database**: Supabase (PostgreSQL)
- **Cache/Queue**: Redis 7 (Docker container)
- **Storage**: AWS S3 (eu-north-1)
- **Web Server**: Nginx (reverse proxy)
- **Auth**: Supabase + Google OAuth
- **Containerization**: Docker (for Redis)

---



### Instance Configuration
- **AMI**: Ubuntu 22.04 LTS or 24.04 LTS
- **Instance Type**: t3.micro (free tier eligible)
- **Key Pair**: Create new or select existing
- **Public IP**: Enable auto-assign
- **Storage**: 16 GiB gp3 (recommended)

### Security Group Rules
Allow traffic:
- **SSH** (Port 22): From your IP or 0.0.0.0/0
- **HTTP** (Port 80): From 0.0.0.0/0
- **HTTPS** (Port 443): From 0.0.0.0/0
- **Custom TCP** (Port 5000): From 0.0.0.0/0 (Your API port)

---

## Step 2: Connect to Instance

```bash
# SSH into your instance (replace with your key and instance IP)
ssh -i your-key-pair.pem ubuntu@your-instance-public-ip

# Update system
sudo apt update
sudo apt upgrade -y
``` 

---

## Step 3: Install Node.js & npm

```bash
# Install Node Version Manager (NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load NVM
source ~/.bashrc

# Install Node.js 18 (LTS)
nvm install 18
nvm use 18

# Verify installation
node --version
npm --version
```

---

## Step 4: Clone Repository & Setup Backend

```bash
# Install Git
sudo apt install git -y

# Clone your repository using Personal Access Token
cd /home/ubuntu
git clone https://YOUR_PERSONAL_TOKEN@github.com/not-dev10/CARMELLA.git
cd CARMELLA/backend

# Install dependencies
npm install

# Install PM2 globally
npm install -g pm2
```

---

## Step 4b: Install Docker (For Redis)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Start Docker daemon
sudo systemctl start docker
sudo systemctl enable docker
```

---

## Step 4c: Run Redis in Docker

```bash
# Pull Redis image
docker pull redis:7-alpine

# Create a directory for Redis data
mkdir -p /home/ubuntu/redis-data

# Run Redis container
docker run -d \
  --name carmella-redis \
  -p 6379:6379 \
  -v /home/ubuntu/redis-data:/data \
  redis:7-alpine redis-server --appendonly yes

# Verify Redis is running
docker ps | grep carmella-redis

# Test Redis connection
redis-cli ping
# Should return: PONG
```

---

## Step 5: Configure Environment Variables

```bash
# Copy your .env template
cp .env.example .env  # or create manually

# Edit the .env file with your settings
nano .env
```

**Required `.env` variables for backend:**
```env
PORT=5000
NODE_ENV=production

# Redis Connection
REDIS_URL=redis://localhost:6379

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_KEY=your_service_key

# AWS S3
AWS_REGION=eu-north-1
AWS_S3_BUCKET_NAME=carmella-bucket
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# JWT
JWT_SECRET=your_jwt_secret

# Email (if using NodeMailer)
MAIL_HOST=your_mail_host
MAIL_PORT=587
MAIL_USER=your_email
MAIL_PASSWORD=your_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL
FRONTEND_URL=http://your-frontend-domain-or-ip:3000
CORS_ORIGIN=http://your-frontend-domain-or-ip:3000
```

---

## Step 6: Build & Run Backend

```bash
# Build TypeScript (if applicable)
npm run build

# Test run
npm start

# If working, stop with Ctrl+C
```

---

## Step 7: Setup PM2 Process Manager

```bash
# Start backend with PM2
pm2 start "npm start" --name "carmella-backend"

# Make PM2 auto-start on reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs carmella-backend
```

---

## Step 8: Setup Reverse Proxy with Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Edit Nginx config
sudo nano /etc/nginx/conf.d/carmella-backend.conf
```

**Add this Nginx config:**
```nginx
upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name your-instance-public-ip;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 9: Setup SSL with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate SSL certificate (requires domain name)
sudo certbot certonly --nginx -d your-domain.com

# Auto-renew SSL
sudo systemctl start certbot-renew.timer
sudo systemctl enable certbot-renew.timer
```

---

## Step 10: Monitor & Maintain

```bash
# View PM2 logs
pm2 logs carmella-backend

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Restart backend
pm2 restart carmella-backend

# Update code from GitHub
cd /home/ubuntu/CARMELLA/backend
git pull origin master
npm install
npm run build
pm2 restart carmella-backend
```

---

## Step 10b: Docker & Redis Management

```bash
# View Redis container logs
docker logs -f carmella-redis

# Stop Redis container
docker stop carmella-redis

# Start Redis container
docker start carmella-redis

# Restart Redis container
docker restart carmella-redis

# Remove Redis container (destructive)
docker rm carmella-redis

# Check Redis connection
redis-cli ping

# View Redis memory stats
redis-cli info memory

# View all docker containers
docker ps -a
```

---

## Step 11: Database Migrations (If needed)

```bash
# Run database migrations
npm run migrate

# Seed initial data (if applicable)
npm run seed
```

---

## Troubleshooting

### Check if backend is running
```bash
pm2 status
curl http://localhost:5000/api/health
```

### Check if Redis is running
```bash
docker ps | grep carmella-redis
redis-cli ping  # Should return PONG
```

### Check port availability
```bash
sudo netstat -tlnp | grep 5000  # Node.js backend
sudo netstat -tlnp | grep 6379  # Redis
```

### View system resources
```bash
free -h  # Memory
df -h   # Disk space
top     # CPU usage
```

### Restart everything
```bash
# Restart Redis
docker restart carmella-redis

# Restart backend
pm2 restart carmella-backend

# Restart Nginx
sudo systemctl restart nginx
```

### Clean up Docker (if needed)
```bash
# Remove all stopped containers
docker container prune -f

# Remove dangling images
docker image prune -f

# Clean up Redis data (WARNING: destructive)
sudo rm -rf /home/ubuntu/redis-data/*
```

---

## Production URLs

Once deployed:
- **Backend API**: `http://your-instance-public-ip:5000/api`
- **Backend API (via Nginx)**: `http://your-instance-public-ip/api`
- **Health Check**: `http://your-instance-public-ip:5000/api/health`

---

## Cost Estimation (Monthly)
- **EC2 t3.micro**: ~$3-5/month (free tier eligible for 12 months)
- **Data transfer**: Varies (~$0.02 per GB out)
- **Elastic IP** (if static): $0/month if attached
- **Docker**: Free (open source)
- **Redis container**: Free (included in Docker)
- **Total**: ~$5-10/month + data costs

---

## Quick Start (All Steps Combined)

Run these commands in sequence:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Git
sudo apt install git -y

# 3. Install Node & NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 4. Clone & install backend
cd /home/ubuntu
git clone https://YOUR_TOKEN@github.com/not-dev10/CARMELLA.git
cd CARMELLA/backend
npm install
npm install -g pm2

# 5. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 6. Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# 7. Run Redis
docker pull redis:7-alpine
mkdir -p /home/ubuntu/redis-data
docker run -d --name carmella-redis -p 6379:6379 -v /home/ubuntu/redis-data:/data redis:7-alpine redis-server --appendonly yes

# 8. Create .env file and paste credentials
nano .env

# 9. Build backend
npm run build

# 10. Start with PM2
pm2 start "npm start" --name "carmella-backend"
pm2 startup
pm2 save

# 11. Install Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# ✅ Done! Your backend is running on port 5000
```

