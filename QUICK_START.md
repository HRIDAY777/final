# 🚀 EduCore Ultra - Quick Start Guide

## ⚡ 5-Minute Deployment

Follow these steps to get your EduCore Ultra school management system running in minutes!

### Prerequisites
- ✅ Docker Desktop installed and running
- ✅ Git (optional, for cloning)

### Step 1: Setup Environment
```powershell
# Copy environment template
Copy-Item env.example .env

# Edit .env file with your values (optional for testing)
# You can use default values for initial testing
```

### Step 2: Deploy Everything
```powershell
# Run the Windows deployment script
.\deploy.ps1
```

**OR** manually:
```powershell
# Stop any existing containers
docker-compose down --remove-orphans

# Build and start all services
docker-compose build
docker-compose up -d

# Wait for services to start (30 seconds)
Start-Sleep -Seconds 30

# Run database setup
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py collectstatic --noinput
```

### Step 3: Access Your Application

🎉 **Your application is now running!**

- **🌐 Main App:** http://localhost
- **🔐 Admin Panel:** http://localhost/admin
- **📊 API Docs:** http://localhost:8000/api/docs/
- **📈 Monitoring:** http://localhost:3001

**Default Admin Login:**
- Username: `admin`
- Password: `admin123`

## 🔧 Quick Commands

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Application
```powershell
docker-compose down
```

### Restart Application
```powershell
docker-compose restart
```

### Update Application
```powershell
docker-compose pull
docker-compose up -d
```

## 🚨 Troubleshooting

### Port Already in Use
```powershell
# Check what's using port 80
netstat -ano | findstr :80

# Stop conflicting services (if any)
# Or change ports in docker-compose.yml
```

### Docker Not Running
1. Start Docker Desktop
2. Wait for Docker to fully start
3. Run deployment again

### Database Connection Issues
```powershell
# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Frontend Not Loading
```powershell
# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

## 📊 What's Included

Your deployment includes:

- ✅ **React Frontend** - Modern UI with Tailwind CSS
- ✅ **Django Backend** - RESTful API with DRF
- ✅ **PostgreSQL Database** - Reliable data storage
- ✅ **Redis Cache** - Fast caching and sessions
- ✅ **Nginx Reverse Proxy** - Load balancing and SSL
- ✅ **Celery Workers** - Background task processing
- ✅ **Prometheus Monitoring** - Metrics collection
- ✅ **Grafana Dashboards** - Beautiful visualizations
- ✅ **SSL Certificates** - Secure HTTPS (self-signed for testing)

## 🔒 Security Notes

For production use:

1. **Change default passwords** in `.env` file
2. **Update SSL certificates** with real ones
3. **Configure domain name** in nginx settings
4. **Set up proper backups** using `.\backup.ps1`
5. **Enable firewall rules** for your ports

## 📞 Need Help?

1. Check the logs: `docker-compose logs -f`
2. Verify Docker is running
3. Ensure ports 80, 8000, 3000, 3001, 9090 are available
4. Check the full deployment guide: `DEPLOYMENT.md`

---

**🎉 Congratulations!** Your EduCore Ultra school management system is now running successfully!

