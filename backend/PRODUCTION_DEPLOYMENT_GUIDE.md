# 🚀 Production Deployment Guide - EduCore Ultra

## ✅ Prerequisites

### Required Software
- **Python 3.10+**
- **PostgreSQL 12+**
- **Redis 6+**
- **Nginx** (as reverse proxy)
- **SSL Certificate** (Let's Encrypt recommended)

---

## 📋 Step-by-Step Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3-pip python3-venv postgresql postgresql-contrib \
    redis-server nginx certbot python3-certbot-nginx git

# Install Node.js (for frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. PostgreSQL Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE educore_ultra;
CREATE USER educore_user WITH PASSWORD 'your_secure_password';
ALTER ROLE educore_user SET client_encoding TO 'utf8';
ALTER ROLE educore_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE educore_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE educore_ultra TO educore_user;
\q
```

### 3. Redis Configuration

```bash
# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping  # Should return PONG
```

### 4. Clone and Setup Backend

```bash
# Create directory
sudo mkdir -p /var/www/educore
cd /var/www/educore

# Clone repository
git clone https://github.com/yourusername/educore-ultra.git .

# Create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn psycopg2-binary django-redis hiredis
```

### 5. Environment Configuration

```bash
# Copy production environment template
cp PRODUCTION_ENV_TEMPLATE.txt ../.env

# Edit with your actual values
nano ../.env
```

**Important: Update these values in `.env`:**
- `SECRET_KEY` - Generate using: `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`
- `ALLOWED_HOSTS` - Your domain names
- `DB_PASSWORD` - Your PostgreSQL password
- `EMAIL_*` - Your SMTP credentials
- `CORS_ALLOWED_ORIGINS` - Your frontend domain
- `CSRF_TRUSTED_ORIGINS` - Your frontend domain

### 6. Django Setup

```bash
# Set environment
export DJANGO_SETTINGS_MODULE=core.settings.prod

# Create required directories
mkdir -p logs backups

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Test if everything works
python manage.py check --deploy
```

### 7. Gunicorn Setup

Create systemd service file:

```bash
sudo nano /etc/systemd/system/educore.service
```

```ini
[Unit]
Description=EduCore Ultra Gunicorn Service
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/educore/backend
Environment="DJANGO_SETTINGS_MODULE=core.settings.prod"
EnvironmentFile=/var/www/educore/.env
ExecStart=/var/www/educore/backend/venv/bin/gunicorn \
    --workers 4 \
    --threads 2 \
    --worker-class gthread \
    --worker-tmp-dir /dev/shm \
    --bind unix:/var/www/educore/backend/gunicorn.sock \
    --access-logfile /var/www/educore/backend/logs/gunicorn-access.log \
    --error-logfile /var/www/educore/backend/logs/gunicorn-error.log \
    --log-level info \
    core.wsgi:application

ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl start educore
sudo systemctl enable educore
sudo systemctl status educore
```

### 8. Celery Setup (Background Tasks)

Create Celery service:

```bash
sudo nano /etc/systemd/system/educore-celery.service
```

```ini
[Unit]
Description=EduCore Celery Worker
After=network.target redis.service

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/var/www/educore/backend
EnvironmentFile=/var/www/educore/.env
ExecStart=/var/www/educore/backend/venv/bin/celery -A core worker \
    --loglevel=info \
    --logfile=/var/www/educore/backend/logs/celery.log \
    --pidfile=/var/run/celery/worker.pid

Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo mkdir /var/run/celery
sudo chown www-data:www-data /var/run/celery
sudo systemctl daemon-reload
sudo systemctl start educore-celery
sudo systemctl enable educore-celery
```

### 9. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/educore
```

```nginx
upstream educore_backend {
    server unix:/var/www/educore/backend/gunicorn.sock fail_timeout=0;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    client_max_body_size 10M;

    # Static files
    location /static/ {
        alias /var/www/educore/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /var/www/educore/backend/media/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # API requests
    location /api/ {
        proxy_pass http://educore_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Admin panel
    location /admin/ {
        proxy_pass http://educore_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend (React app)
    location / {
        root /var/www/educore/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/educore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 10. SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 11. Frontend Build

```bash
cd /var/www/educore/frontend

# Install dependencies
npm install

# Create production .env
cat > .env.production << EOF
VITE_API_URL=https://yourdomain.com/api
VITE_WS_URL=wss://yourdomain.com/ws
EOF

# Build for production
npm run build

# Set permissions
sudo chown -R www-data:www-data dist/
```

### 12. Permissions

```bash
cd /var/www/educore
sudo chown -R www-data:www-data backend/
sudo chmod -R 755 backend/
sudo chmod 600 .env
```

---

## 🔒 Security Checklist

- [ ] Changed `SECRET_KEY` to random secure value
- [ ] Set `DEBUG=False`
- [ ] Configured proper `ALLOWED_HOSTS`
- [ ] Enabled SSL/HTTPS
- [ ] Set secure database password
- [ ] Configured firewall (UFW)
- [ ] Regular backups configured
- [ ] Sentry error tracking enabled
- [ ] Rate limiting configured
- [ ] Security headers enabled

---

## 🔥 Firewall Setup

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

---

## 📊 Monitoring Commands

```bash
# Check backend status
sudo systemctl status educore

# Check Celery status
sudo systemctl status educore-celery

# View logs
sudo journalctl -u educore -f
sudo journalctl -u educore-celery -f
tail -f /var/www/educore/backend/logs/educore.log

# Check Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Auto-Backup Script

```bash
sudo nano /usr/local/bin/educore-backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/www/educore/backend/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
pg_dump -U educore_user educore_ultra | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Backup media files
tar -czf "$BACKUP_DIR/media_$DATE.tar.gz" /var/www/educore/backend/media/

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/educore-backup.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/educore-backup.sh
```

---

## 🚀 Deployment Updates

```bash
cd /var/www/educore
git pull origin main

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart educore
sudo systemctl restart educore-celery

# Frontend
cd ../frontend
npm install
npm run build
sudo systemctl restart nginx
```

---

## ⚡ Performance Optimization Tips

1. **Database Indexing**: Review and add indexes to frequently queried fields
2. **Redis Caching**: Implement view-level caching
3. **CDN**: Use CloudFlare or similar for static files
4. **Database Connection Pooling**: Already configured (CONN_MAX_AGE)
5. **Gzip Compression**: Enabled in Nginx
6. **Image Optimization**: Compress uploaded images

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check logs
sudo journalctl -u educore -n 50 --no-pager

# Test manually
cd /var/www/educore/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

### Database connection issues
```bash
# Test PostgreSQL connection
psql -U educore_user -d educore_ultra -h localhost

# Check if PostgreSQL is running
sudo systemctl status postgresql
```

### 502 Bad Gateway
```bash
# Check if Gunicorn socket exists
ls -la /var/www/educore/backend/gunicorn.sock

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl restart educore nginx
```

---

## 📞 Support

For issues, check logs in:
- `/var/www/educore/backend/logs/`
- `/var/log/nginx/`
- `sudo journalctl -u educore`

---

**🎉 Deployment Complete!**

Your EduCore Ultra platform should now be live at `https://yourdomain.com`

