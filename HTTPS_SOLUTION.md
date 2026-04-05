# HTTPS Solution for Carmella Backend

## Problem
Your frontend is on HTTPS (Vercel), but your backend is on HTTP (EC2). Browsers block mixed content requests.

## Solution Options

### Option 1: Cloudflare Tunnel (Free, Recommended)

This gives you a free HTTPS URL for your EC2 backend.

**Steps:**

1. SSH into your EC2 instance:
```bash
ssh -i your-key.pem ubuntu@13.61.49.46
```

2. Install Cloudflare Tunnel:
```bash
# Download cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Verify installation
cloudflared --version
```

3. Create and run tunnel:
```bash
# This will give you a temporary HTTPS URL
cloudflared tunnel --url http://localhost:5000
```

You'll get a URL like: `https://random-name.trycloudflare.com`

4. For permanent tunnel (recommended):
```bash
# Login to Cloudflare (opens browser)
cloudflared tunnel login

# Create named tunnel
cloudflared tunnel create carmella-backend

# Note the tunnel ID from output

# Create config file
nano ~/.cloudflared/config.yml
```

Add this to config.yml:
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/ubuntu/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: your-subdomain.yourdomain.com
    service: http://localhost:5000
  - service: http_status:404
```

5. Run tunnel as service:
```bash
# Install as service
sudo cloudflared service install

# Start service
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared
```

6. Update Vercel environment variable:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `VITE_API_URL` to your Cloudflare tunnel URL
   - Redeploy

---

### Option 2: Deploy Backend to Vercel

Deploy your backend as Vercel serverless functions.

**Pros:**
- Automatic HTTPS
- No server management
- Free tier available

**Cons:**
- Serverless limitations (10s timeout on free tier)
- Redis needs external service (Upstash)
- Cold starts

**Steps:**

1. Create a new Vercel project for backend:
```bash
cd carmella/backend
vercel
```

2. Update Redis to use Upstash (free Redis):
   - Sign up at https://upstash.com
   - Create Redis database
   - Get connection URL
   - Update `.env` with Upstash Redis URL

3. Update Vercel environment variables with all your backend env vars

4. Deploy:
```bash
vercel --prod
```

5. Update frontend `VITE_API_URL` to your new Vercel backend URL

---

### Option 3: Get a Domain + Let's Encrypt SSL

If you have or can get a domain name:

1. Point domain A record to: `13.61.49.46`

2. SSH into EC2 and install SSL:
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is configured automatically
```

3. Update Nginx config (Certbot does this automatically)

4. Update Vercel env var to: `https://api.yourdomain.com/api`

---

## Quick Recommendation

**For immediate fix:** Use Cloudflare Tunnel Option 1 (temporary URL)
```bash
ssh -i your-key.pem ubuntu@13.61.49.46
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
cloudflared tunnel --url http://localhost:5000
```

This will give you an HTTPS URL immediately. Copy that URL and update it in Vercel environment variables.

**For production:** Get a domain name and use Let's Encrypt (Option 3)
