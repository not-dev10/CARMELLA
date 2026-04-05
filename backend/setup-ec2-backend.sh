#!/bin/bash

# Carmella Backend - EC2 Automated Setup Script
# Run this on your EC2 instance after SSH connection
# Usage: bash setup-ec2-backend.sh

set -e

echo "🚀 Starting Carmella Backend EC2 Setup..."

# Step 1: Update system
echo "📦 Updating system packages..."
sudo yum update -y
sudo yum upgrade -y

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
sudo yum install -y curl git

# Step 3: Install Node.js
echo "📦 Installing Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18
nvm use 18
npm install -g pm2

# Step 4: Clone repository
echo "📦 Cloning Carmella repository..."
cd /home/ec2-user
if [ -d "CARMELLA" ]; then
    echo "Repository already exists. Pulling latest..."
    cd CARMELLA
    git pull origin master
else
    git clone https://github.com/not-dev10/CARMELLA.git
    cd CARMELLA
fi

# Step 5: Setup backend
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Step 6: Create .env file
echo "📝 Creating .env file..."
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# server config
PORT=5000
NODE_ENV=production

# database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_KEY=your_service_key

# aws s3
AWS_REGION=eu-north-1
AWS_S3_BUCKET_NAME=carmella-bucket
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# jwt
JWT_SECRET=your_jwt_secret

# email
MAIL_HOST=your_mail_host
MAIL_PORT=587
MAIL_USER=your_email
MAIL_PASSWORD=your_password

# oauth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# cors
FRONTEND_URL=http://your-frontend-domain:3000
CORS_ORIGIN=http://your-frontend-domain:3000
EOF
    echo "✅ .env file created. Update it with your credentials:"
    echo "   nano backend/.env"
else
    echo "✅ .env file already exists"
fi

# Step 7: Build backend
echo "🔨 Building backend..."
npm run build || npm install --only=dev && npm run build

# Step 8: Setup PM2
echo "🔧 Setting up PM2..."
pm2 start "npm start" --name "carmella-backend"
pm2 startup
pm2 save

# Step 9: Install and setup Nginx
echo "🌐 Installing Nginx..."
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Step 10: Create Nginx config
echo "⚙️  Configuring Nginx..."
sudo tee /etc/nginx/conf.d/carmella-backend.conf > /dev/null << 'EOF'
upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name _;

    client_max_body_size 50M;

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
        proxy_read_timeout 90;
    }
}
EOF

# Reload Nginx
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your credentials:"
echo "   nano /home/ec2-user/CARMELLA/backend/.env"
echo ""
echo "2. Restart backend:"
echo "   pm2 restart carmella-backend"
echo ""
echo "3. Check status:"
echo "   pm2 status"
echo ""
echo "4. View logs:"
echo "   pm2 logs carmella-backend"
echo ""
echo "5. Get your public IP:"
echo "   curl http://169.254.169.254/latest/meta-data/public-ipv4"
echo ""
echo "Useful commands:"
echo "  pm2 logs carmella-backend     - View logs"
echo "  pm2 restart carmella-backend  - Restart"
echo "  pm2 stop carmella-backend     - Stop"
echo "  pm2 delete carmella-backend   - Remove"
echo "  tail -f /var/log/nginx/error.log  - Nginx errors"
echo ""
