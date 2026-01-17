# Deployment Guide for Carmella Backend

## Development to Production Checklist

### Phase 1: Local Development

- [ ] Backend running locally: `npm run dev`
- [ ] Frontend running locally: `npm run dev` (in frontend)
- [ ] All APIs tested with Postman/Thunder Client
- [ ] Authentication flows working (signup, login, Google)
- [ ] Products loading correctly
- [ ] B2B approval system tested
- [ ] Protected routes requiring auth working

### Phase 2: Supabase Setup

- [ ] Supabase project created
- [ ] Production database configured
- [ ] All tables created (see SQL in SETUP.md)
- [ ] Row Level Security (RLS) policies configured (if needed)
- [ ] Backups enabled
- [ ] Auth providers configured (Google OAuth)
- [ ] API keys noted (URL, ANON_KEY, SERVICE_KEY)

### Phase 3: Backend Deployment

#### Option 1: Vercel (Recommended for Express)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. In backend directory
cd carmella/backend

# 3. Deploy
vercel

# Follow prompts to:
# - Create project
# - Set environment variables
# - Link to repository

# 4. Update production .env in Vercel dashboard
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Option 2: Railway

```bash
# 1. Login to railway.app
# 2. Create new project
# 3. Connect GitHub repo
# 4. Add variables:
#    SUPABASE_URL
#    SUPABASE_ANON_KEY
#    SUPABASE_SERVICE_KEY
#    CORS_ORIGIN
#    NODE_ENV=production
# 5. Deploy on push

# Get production URL from Railway dashboard
```

#### Option 3: Render

```bash
# 1. Go to render.com
# 2. Create "Web Service"
# 3. Connect GitHub
# 4. Build Command: npm install && npm run build
# 5. Start Command: npm start
# 6. Add environment variables
# 7. Deploy
```

#### Option 4: Self-Hosted (VPS)

```bash
# 1. SSH into server (Ubuntu/Debian)
ssh user@your-server.com

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 for process management
sudo npm install -g pm2

# 4. Clone repository
git clone <your-repo-url>
cd carmella/backend

# 5. Install dependencies
npm install

# 6. Create production build
npm run build

# 7. Create .env file
cp .env.example .env
# Edit with production credentials

# 8. Start with PM2
pm2 start dist/index.js --name carmella-api
pm2 save
pm2 startup

# 9. Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/default
# Add:
# server {
#   listen 80;
#   server_name api.carmella.com;
#   location / {
#     proxy_pass http://localhost:5000;
#   }
# }

sudo systemctl restart nginx

# 10. Setup SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.carmella.com
```

### Phase 4: Frontend Deployment

#### Vercel (Recommended)

```bash
cd carmella/frontend

# 1. Create vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "VITE_API_URL": "@api_url"
  }
}

# 2. Deploy
vercel

# 3. Add environment variables in Vercel dashboard:
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=https://your-api-domain.com
```

#### Netlify

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect at netlify.com
# 3. Build settings:
#    Build command: npm run build
#    Publish directory: dist
# 4. Add environment variables
# 5. Deploy
```

## Environment Configuration

### Production Backend .env

```dotenv
# Supabase (Production)
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_KEY=your_production_service_key

# Server
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Production Frontend .env.local

```dotenv
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_API_URL=https://your-api-domain.com
```

## Database Migration

### Backup Existing Data

```sql
-- Before deploying new version
pg_dump -h your-host -U postgres -d your_db > backup_$(date +%Y%m%d).sql
```

### Run Production Migrations

```bash
# All migration SQL is in SETUP.md
# Execute in Supabase SQL editor:

-- Copy and paste table creation scripts
-- Ensure all tables exist with correct schema
```

## SSL/HTTPS Setup

### For Backend

```bash
# Using Let's Encrypt (free)
sudo certbot certonly --standalone -d api.your-domain.com

# Update backend to use HTTPS
# Or use reverse proxy (Nginx, CloudFlare)
```

### For Frontend

- Vercel: Automatic SSL
- Netlify: Automatic SSL
- Custom domain: Use CloudFlare (free SSL)

## CORS Configuration

Update `CORS_ORIGIN` in backend .env for each environment:

```dotenv
# Development
CORS_ORIGIN=http://localhost:5173

# Production
CORS_ORIGIN=https://carmella.com
```

## Monitoring & Logging

### Vercel

- Built-in logs at vercel.com dashboard
- Monitor real-time errors

### Railway

- Logs tab in dashboard
- Email alerts for errors

### Render

- Logs viewer in dashboard
- Metrics and monitoring

### Self-Hosted

```bash
# View PM2 logs
pm2 logs

# Keep persistent logs
pm2 log

# Monitor processes
pm2 monitor
```

## Database Backups

### Supabase Backups

1. Go to Supabase dashboard
2. Settings → Backups
3. Enable daily backups
4. Set retention (30 days recommended)
5. Download backups as needed

### Manual Backup

```bash
# Export database
pg_dump -h <host> -U postgres -d <database> > backup.sql

# Restore database
psql -h <host> -U postgres -d <database> < backup.sql
```

## Performance Optimization

### Backend

```typescript
// Add caching headers in response
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 min cache
  next();
});

// Add compression
import compression from 'compression';
app.use(compression());

// Connection pooling for DB
// (Supabase handles this)
```

### Database

```sql
-- Add indexes for common queries
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_b2b_approvals_status ON b2b_approvals(status);
CREATE INDEX idx_users_email ON users(email);

-- Analyze queries
EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = '...';
```

### Frontend

- Enable gzip compression
- Minify CSS/JS
- Lazy load images
- Code splitting
- CDN for assets (Vercel auto-handles)

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build
      - run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## Health Monitoring

### Setup Uptime Monitoring

```bash
# Health check endpoint
GET /health

# Add to UptimeRobot.com or similar
# Alert if response is not 200 for 5 minutes
```

## Troubleshooting Production Issues

### Backend won't start

```bash
# Check logs
vercel logs [project-name]

# Verify environment variables are set
# Check Node version (should be 18+)
# Check all dependencies installed
```

### Database connection errors

```
Error: Missing Supabase configuration
→ Check SUPABASE_URL and keys in .env
→ Verify keys have correct permissions

Error: Invalid token
→ Check SUPABASE_ANON_KEY matches frontend
→ Verify token hasn't expired
```

### CORS errors in frontend

```
No 'Access-Control-Allow-Origin' header
→ Check CORS_ORIGIN in backend .env
→ Should match exact frontend domain
→ Include protocol (https://domain.com)
```

### Slow database queries

```sql
-- Check slow query log
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Add missing indexes
-- Optimize queries with EXPLAIN ANALYZE
```

## Disaster Recovery

### Database Corruption

1. Stop application
2. Restore from latest backup
3. Verify data integrity
4. Restart application

### Lost API Keys

1. Generate new keys in Supabase
2. Update .env in deployment
3. Redeploy application
4. Verify API working

### DDoS/Attack

1. Enable CloudFlare protection
2. Set rate limiting
3. Block suspicious IPs
4. Check logs for patterns

## Performance Benchmarks

### Expected Response Times

- `GET /products` - < 200ms
- `GET /products/:id` - < 100ms
- `POST /auth/login` - < 500ms
- `GET /users/:id` - < 150ms

### Expected Throughput

- 100+ requests/second
- 1000+ concurrent users
- (Scaling depends on Supabase tier)

## Post-Deployment

- [ ] Test all user flows
- [ ] Test all admin features
- [ ] Verify email notifications work
- [ ] Check analytics/monitoring
- [ ] Document any issues
- [ ] Brief team on deployment
- [ ] Set up on-call alerts
- [ ] Plan backup rotation
- [ ] Schedule security updates

---

**Deployment ready!** Follow these steps to go live with confidence.
