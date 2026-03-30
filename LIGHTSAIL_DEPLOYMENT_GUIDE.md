# AWS Lightsail Backend Deployment Guide

Deploy your backend to AWS Lightsail for testing while keeping frontend on Vercel.

## 🚀 Step 1: Create Lightsail Instance

### 1. Go to AWS Lightsail Console
- https://lightsail.aws.amazon.com/
- Click **Create instance**

### 2. Configuration
- **Location**: Pick closest to your users
- **OS**: Ubuntu 22.04 LTS (or 24.04)
- **Plan**: $5/month starter (2GB RAM, 1vCPU, 40GB SSD)
- **Name**: `carmella-backend`
- Click **Create instance**

### 3. Wait for Instance
- Takes ~1-2 minutes to be ready
- Status will show "Running" with green checkmark

---

## 🔑 Step 2: Get SSH Key & Access

### 1. Download SSH Key
- Click on your instance
- Go to **Connect** tab
- Download default key if needed (or create custom)
- Save as: `lightsail-key.pem`

### 2. Set Permissions (Windows PowerShell)
```powershell
# If on Windows, set proper permissions
icacls "C:\path\to\lightsail-key.pem" /grant:r "$env:USERNAME:R" /inheritance:r
```

### 3. Connect via SSH
```powershell
ssh -i "C:\path\to\lightsail-key.pem" ubuntu@YOUR_INSTANCE_IP
```

Get your IP from Lightsail dashboard (Public IP field)

---

## 📦 Step 3: Install Dependencies on Lightsail

Once connected via SSH, run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL client (to connect to Supabase)
sudo apt install -y postgresql-client

# Install Git
sudo apt install -y git

# Verify installations
node --version
npm --version
```

---

## 🐙 Step 4: Clone & Setup Backend

```bash
# Clone your repo
git clone https://github.com/not-dev10/CARMELLA.git
cd CARMELLA/backend

# Install dependencies
npm install

# Create .env file with production values
cat > .env << 'EOF'
# Supabase
SUPABASE_URL=https://wrfagwidnhxrafemqwkq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZmFnd2lkbmh4cmFmZW1xd2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTc2ODgsImV4cCI6MjA4NDIzMzY4OH0.NFxtALeuXfhFnRh7ZK-lmWbmbCbdaaSQkE9K8pcktD8
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_SERVICE_KEY_HERE

# Cloudinary
CLOUDINARY_CLOUD_NAME=dwis8ote1
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET

# Server
PORT=3000
NODE_ENV=production
EOF
```

---

## 🏃 Step 5: Start Backend Server

### Option A: Direct Run (for testing)
```bash
npm start
```

### Option B: PM2 (Recommended - Keep running)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start backend with PM2
pm2 start "npm start" --name "carmella-backend"

# Make it restart on boot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs carmella-backend
```

---

## 🌐 Step 6: Open Firewall

### In AWS Lightsail Console:
1. Click your instance
2. Go to **Networking** tab
3. Click **Add rule**
4. **Protocol**: TCP
5. **Port**: 3000
6. **Source**: Anywhere (0.0.0.0/0)
7. Click **Create**

---

## 🔗 Step 7: Update Frontend (Vercel)

### Get Your Lightsail IP
```bash
# On your local machine
aws lightsail get-instances --query 'instances[0].publicIpAddress' --output text
```

Or find it in the Lightsail dashboard → Public IP

### Update Vercel Environment Variables

1. Go to: https://vercel.com/not-dev10s-projects/carmella/settings/environment-variables
2. Update `VITE_API_URL`:
   ```
   Name: VITE_API_URL
   Value: http://YOUR_LIGHTSAIL_IP:3000
   Environment: Production ✓ Preview ✓ Development ✓
   ```
3. Save and Vercel will redeploy automatically

---

## ✅ Step 8: Test Connection

### From your local machine:
```powershell
# Test backend is accessible
$IP = "YOUR_LIGHTSAIL_IP"
curl "http://$IP:3000/api/health"
```

Expected response: Check your backend health endpoint

### From Vercel frontend:
- Visit: https://carmella-mu.vercel.app/
- Check browser console (F12 → Console)
- Should see successful API calls to your Lightsail backend

---

## 🚨 Troubleshooting

### Can't SSH?
```powershell
# Check key permissions
icacls "C:\path\to\lightsail-key.pem"

# Try with -v flag for verbose
ssh -v -i "C:\path\to\lightsail-key.pem" ubuntu@IP
```

### Backend not responding?
```bash
# SSH to instance and check:
pm2 status
pm2 logs carmella-backend
sudo netstat -tlnp | grep 3000
```

### Still can't access?
- Check security group allows port 3000
- Verify backend actually started: `pm2 logs`
- Check firewall: `sudo ufw status`

---

## 📊 Monitoring

```bash
# View real-time logs
pm2 logs carmella-backend

# View process info
pm2 show carmella-backend

# Restart if needed
pm2 restart carmella-backend

# Stop server
pm2 stop carmella-backend
```

---

## 💰 Cost
- **$5/month** for Lightsail instance (perfect for testing)
- No additional charges for data transfer between AWS services

---

## Next Steps
1. ✅ Create Lightsail instance
2. ✅ Install Node.js and dependencies
3. ✅ Clone backend repo
4. ✅ Start with PM2
5. ✅ Update Vercel `VITE_API_URL` environment variable
6. ✅ Test end-to-end

**Your app will be live at: https://carmella-mu.vercel.app/ (frontend) + http://YOUR_IP:3000 (backend)**
