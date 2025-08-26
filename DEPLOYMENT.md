# EduCore Ultra - Deployment Guide

## 🚀 Complete Deployment Setup

This guide will help you deploy the EduCore Ultra school management system with both frontend and backend services.

## 📋 Prerequisites

Before starting the deployment, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** (for cloning the repository)
- **OpenSSL** (for SSL certificate generation)

### Installing Docker on Windows

1. Download Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Install and start Docker Desktop
3. Ensure Docker is running (you should see the Docker icon in your system tray)

## 🏗️ Project Structure

```
educore-ultra/
├── frontend/                 # React frontend application
│   ├── src/                 # Source code
│   ├── public/              # Public assets
│   ├── Dockerfile           # Frontend Docker configuration
│   ├── nginx.conf           # Frontend nginx configuration
│   └── package.json         # Frontend dependencies
├── backend/                 # Django backend application
│   ├── apps/               # Django apps
│   ├── core/               # Core Django settings
│   ├── api/                # API endpoints
│   ├── Dockerfile.prod     # Backend Docker configuration
│   └── requirements.txt    # Python dependencies
├── nginx/                  # Main nginx configuration
│   └── nginx.conf         # Reverse proxy configuration
├── monitoring/             # Monitoring configuration
│   └── prometheus.yml     # Prometheus configuration
├── docker-compose.yml     # Main Docker Compose file
├── deploy.sh              # Deployment script
├── env.example            # Environment variables template
└── README.md              # Project documentation
```

## 🔧 Quick Deployment

### Step 1: Environment Setup

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file with your actual values:
   ```bash
   # Update these values with your actual configuration
   DB_PASSWORD=your_secure_password
   SECRET_KEY=your_django_secret_key
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_email_password
   OPENAI_API_KEY=your_openai_api_key
   ```

### Step 2: Run Deployment

#### On Linux/macOS:
```bash
./deploy.sh
```

#### On Windows (PowerShell):
```powershell
# Make sure Docker Desktop is running
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d
```

### Step 3: Manual Setup (if needed)

If the automatic deployment script doesn't work, follow these manual steps:

1. **Create necessary directories:**
   ```bash
   mkdir -p logs nginx/ssl monitoring backend/staticfiles backend/media frontend/dist
   ```

2. **Generate SSL certificates:**
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
       -keyout nginx/ssl/key.pem \
       -out nginx/ssl/cert.pem \
       -subj "/C=US/ST=State/L=City/O=EduCore/CN=localhost"
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

5. **Create superuser:**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

6. **Collect static files:**
   ```bash
   docker-compose exec backend python manage.py collectstatic --noinput
   ```

## 🌐 Access URLs

After successful deployment, you can access the application at:

- **Main Application:** http://localhost
- **Frontend Only:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost/admin
- **API Documentation:** http://localhost:8000/api/docs/
- **Grafana Dashboard:** http://localhost:3001
- **Prometheus:** http://localhost:9090

### Default Admin Credentials

- **Username:** admin
- **Password:** admin123

**⚠️ Important:** Change these credentials immediately after first login!

## 🔧 Service Management

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Update Services
```bash
docker-compose pull
docker-compose up -d
```

### Rebuild Services
```bash
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Monitoring

The deployment includes comprehensive monitoring:

### Prometheus
- **URL:** http://localhost:9090
- **Purpose:** Metrics collection and alerting
- **Configuration:** `monitoring/prometheus.yml`

### Grafana
- **URL:** http://localhost:3001
- **Username:** admin
- **Password:** admin123 (from .env file)
- **Purpose:** Dashboard and visualization

## 🔒 Security Configuration

### SSL Certificates
For production deployment, replace the self-signed certificates:

1. **Obtain SSL certificates** from a trusted CA (Let's Encrypt, etc.)
2. **Replace the certificates:**
   ```bash
   # Replace these files with your actual certificates
   nginx/ssl/cert.pem
   nginx/ssl/key.pem
   ```

### Environment Variables
Update the following in your `.env` file:

- `SECRET_KEY`: Generate a strong Django secret key
- `DB_PASSWORD`: Use a strong database password
- `EMAIL_HOST_PASSWORD`: Use app-specific passwords for email
- `OPENAI_API_KEY`: Your OpenAI API key for AI features

### Firewall Configuration
Ensure these ports are open:
- **80:** HTTP
- **443:** HTTPS
- **8000:** Backend API (optional, for direct access)
- **3000:** Frontend (optional, for direct access)
- **9090:** Prometheus (optional)
- **3001:** Grafana (optional)

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :80
   
   # Stop conflicting services
   sudo systemctl stop apache2  # if Apache is running
   sudo systemctl stop nginx    # if nginx is running
   ```

2. **Database connection failed:**
   ```bash
   # Check database logs
   docker-compose logs db
   
   # Restart database
   docker-compose restart db
   ```

3. **Frontend not loading:**
   ```bash
   # Check frontend logs
   docker-compose logs frontend
   
   # Rebuild frontend
   docker-compose build --no-cache frontend
   docker-compose up -d frontend
   ```

4. **Backend API errors:**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Run migrations
   docker-compose exec backend python manage.py migrate
   
   # Check Django settings
   docker-compose exec backend python manage.py check
   ```

### Health Checks

Test the health of your services:

```bash
# Backend health
curl http://localhost:8000/health/

# Frontend health
curl http://localhost:3000/health

# Main nginx health
curl http://localhost/health/
```

## 📈 Production Recommendations

### 1. Domain Configuration
Update `nginx/nginx.conf` with your actual domain:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

### 2. SSL Configuration
Use Let's Encrypt for free SSL certificates:
```bash
# Install certbot
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

### 3. Backup Strategy
Set up automated backups:
```bash
# Database backup
docker-compose exec db pg_dump -U educore_user educore_db > backup.sql

# Media files backup
tar -czf media_backup.tar.gz backend/media/
```

### 4. Monitoring Alerts
Configure Grafana alerts for:
- High CPU usage
- High memory usage
- Database connection issues
- API response time

### 5. Scaling
For high traffic, consider:
- Load balancer (HAProxy, Nginx)
- Multiple backend instances
- CDN for static files
- Database clustering

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Ensure all ports are available
4. Check Docker and Docker Compose versions
5. Verify SSL certificates (if using HTTPS)

## 📝 License

This deployment configuration is part of the EduCore Ultra project. Please refer to the main project license for usage terms.

