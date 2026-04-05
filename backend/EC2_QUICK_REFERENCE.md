# EC2 Backend Deployment - Quick Reference

## Quick Start (One Command)

After SSH into your EC2 instance:

```bash
cd /tmp && curl -O https://raw.githubusercontent.com/not-dev10/CARMELLA/master/backend/setup-ec2-backend.sh && bash setup-ec2-backend.sh
```

Then update your `.env` file with credentials.

---

## Essential Commands

### Check Backend Status
```bash
pm2 status
pm2 logs carmella-backend
```

### Restart Backend
```bash
pm2 restart carmella-backend
```

### Test API
```bash
curl http://localhost:5000/api/health
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Get Public IP
```bash
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

---

## Environment Variables Template

Add these to your `/home/ec2-user/CARMELLA/backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=production

# Database (Supabase)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyxxxxx
SUPABASE_SERVICE_KEY=eyxxxxx

# AWS S3
AWS_REGION=eu-north-1
AWS_S3_BUCKET_NAME=carmella-bucket
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxxxx

# JWT
JWT_SECRET=your-random-secret-key-here

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# CORS
FRONTEND_URL=http://your-domain.com:3000
CORS_ORIGIN=http://your-domain.com:3000
```

---

## File Locations

| Item | Path |
|------|------|
| Backend Code | `/home/ec2-user/CARMELLA/backend/` |
| Environment File | `/home/ec2-user/CARMELLA/backend/.env` |
| Nginx Config | `/etc/nginx/conf.d/carmella-backend.conf` |
| PM2 Logs | `~/.pm2/logs/` |
| Nginx Logs | `/var/log/nginx/` |

---

## Monitoring

### Real-time Dashboard
```bash
pm2 monit
```

### System Resources
```bash
free -h              # Memory
df -h                # Disk
top                  # CPU
ps aux | grep node   # Node processes
```

### Network
```bash
sudo netstat -tlnp | grep :5000
sudo ss -tlnp | grep :5000
```

---

## Troubleshooting

### Backend not starting
```bash
pm2 logs carmella-backend
npm start  # Run directly to see errors
```

### Port already in use
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
```

### Database connection issues
```bash
# Check .env SUPABASE_URL and keys are correct
cat /home/ec2-user/CARMELLA/backend/.env | grep SUPABASE
```

### Nginx 502 Bad Gateway
```bash
# Check upstream is running
pm2 status
# Restart both
sudo systemctl restart nginx
pm2 restart carmella-backend
```

---

## Updates & Maintenance

### Pull latest code
```bash
cd /home/ec2-user/CARMELLA
git pull origin master
cd backend
npm install
npm run build
pm2 restart carmella-backend
```

### View update logs
```bash
pm2 logs carmella-backend --lines 100
```

### Health check endpoint
```bash
# Should return 200 OK
curl http://your-public-ip:5000/api/health
```

---

## Security Best Practices

1. ✅ Update .env with real credentials
2. ✅ Don't commit .env to git
3. ✅ Use security groups to limit access
4. ✅ Enable AWS CloudTrail for auditing
5. ✅ Use RDS with encryption for database
6. ✅ Set up SSL/TLS with Let's Encrypt
7. ✅ Monitor logs regularly
8. ✅ Update packages periodically

---

## Useful Links

- [EC2 Dashboard](https://console.aws.amazon.com/ec2/)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## Support

Check these files for detailed guides:
- `EC2_DEPLOYMENT_GUIDE.md` - Full deployment walkthrough
- `setup-ec2-backend.sh` - Automated setup script
- `.env.example` - Environment variables reference
