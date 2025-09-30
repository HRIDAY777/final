# EduCore Ultra - Deployment Guide

## 📋 Prerequisites

Before deploying EduCore Ultra, ensure you have the following installed:

1. **Docker Desktop** (version 20.10 or higher)
2. **Docker Compose** (included with Docker Desktop)
3. **Git** (for version control)
4. **PowerShell** (Windows) or **Bash** (Linux/macOS)

### System Requirements

- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 10GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)

### Pre-deployment Checklist

1. Install Docker Desktop from [docker.com](https://docker.com)
2. Start Docker Desktop and wait for it to be ready
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

After successful deployment, you can access the following services:

| Service | URL | Description |
|---------|-----|-------------|
| Main Application | [http://localhost](http://localhost) | Complete application |
| Frontend Only | [http://localhost:3000](http://localhost:3000) | React app directly |
| Backend API | [http://localhost:8000](http://localhost:8000) | Django API directly |
| Admin Panel | [http://localhost/admin](http://localhost/admin) | Django admin |
| API Docs | [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/) | API documentation |
| Grafana | [http://localhost:3001](http://localhost:3001) | Monitoring dashboard |
| Prometheus | [http://localhost:9090](http://localhost:9090) | Metrics collection |

### Default Credentials

- **Admin Username**: `admin`
- **Admin Password**: `admin123`

**⚠️ Important**: Change these credentials immediately after first login!

## 🔧 Service Management

### View Service Status

```bash
# Check all services
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Update Services

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Monitoring Setup

### Grafana Dashboard

1. Access Grafana at [http://localhost:3001](http://localhost:3001)
2. Default credentials:
   - Username: `admin`
   - Password: `admin`
3. Import the provided dashboard templates

### Prometheus Metrics

- Access Prometheus at [http://localhost:9090](http://localhost:9090)
- View metrics for all services
- Set up alerts for critical metrics

## 🔒 Security Configuration

### SSL/HTTPS Setup

For production deployment, replace the self-signed certificates:

1. **Obtain SSL certificates** (Let's Encrypt recommended)
2. **Replace certificate files**:
   - `nginx/ssl/cert.pem` (your certificate)
   - `nginx/ssl/key.pem` (your private key)
3. **Restart nginx**:
   ```bash
   docker-compose restart nginx
   ```

### Environment Variables

Update the following in your `.env` file:

```bash
# Security
SECRET_KEY=your_very_secure_secret_key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
DB_PASSWORD=your_secure_database_password

# Email
EMAIL_HOST_USER=your_email@domain.com
EMAIL_HOST_PASSWORD=your_email_password

# API Keys
OPENAI_API_KEY=your_openai_api_key
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**:
   - Check if ports 80, 8000, 3000, 3001, 9090 are available
   - Stop conflicting services or change ports in `docker-compose.yml`

2. **Permission errors**:
   - Run PowerShell as Administrator (Windows)
   - Use `sudo` for Linux/macOS

3. **Docker not running**:
   - Start Docker Desktop
   - Wait for Docker to be ready

4. **Database connection errors**:
   - Check PostgreSQL container status: `docker-compose ps db`
   - View database logs: `docker-compose logs db`

5. **SSL certificate errors**:
   - Accept self-signed certificates in browser
   - For production, use proper SSL certificates

### Debug Commands

```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs backend

# Check disk space
docker system df

# Clean up unused resources
docker system prune

# Check network connectivity
docker network ls
```

### Reset Everything

If you need to start fresh:

```bash
# Stop and remove everything
docker-compose down -v

# Remove all images
docker system prune -a

# Start fresh
./deploy.sh
```

## 📈 Production Deployment

### Before Going Live

1. **Update environment variables**:
   - Set `DEBUG=False`
   - Configure production database
   - Set up proper SSL certificates
   - Update `ALLOWED_HOSTS`

2. **Security hardening**:
   - Change default passwords
   - Enable 2FA for admin accounts
   - Configure firewall rules
   - Set up backup strategy

3. **Performance optimization**:
   - Enable Redis caching
   - Configure CDN for static files
   - Optimize database queries
   - Set up load balancing

### Production Checklist

- [ ] SSL certificates configured
- [ ] Environment variables updated
- [ ] Database backups configured
- [ ] Monitoring alerts set up
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Disaster recovery plan ready
- [ ] Documentation updated

## 📞 Support

### Getting Help

1. **Check logs**: `docker-compose logs -f`
2. **Verify prerequisites**: Ensure Docker is running
3. **Review configuration**: Check `.env` file settings
4. **Test connectivity**: Verify all ports are accessible

### Useful Commands

```bash
# Health check
curl http://localhost:8000/health/

# Database backup
docker-compose exec backend python manage.py dumpdata > backup.json

# Database restore
docker-compose exec backend python manage.py loaddata backup.json

# Create new superuser
docker-compose exec backend python manage.py createsuperuser
```

---

**🎯 Your EduCore Ultra system is now ready for deployment!**

For quick setup, see [QUICK_START.md](QUICK_START.md).
