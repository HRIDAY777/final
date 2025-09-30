# 🚀 EduCore Ultra - Quick Start Guide

## ⚡ 5-Minute Deployment

Get your EduCore Ultra school management system running in just 5 minutes!

## 📋 Prerequisites

- Docker Desktop installed and running
- PowerShell (Windows) or Terminal (Linux/macOS)
- At least 4GB RAM available

## 🚀 Quick Deployment

### Windows (PowerShell)

```powershell
# 1. Setup environment
Copy-Item env.example .env

# 2. Deploy everything
.\deploy.ps1

# 3. Access your application
Start-Process http://localhost
```

### Linux/macOS (Terminal)

```bash
# 1. Setup environment
cp env.example .env

# 2. Deploy everything
./deploy.sh

# 3. Access your application
open http://localhost
```

## 🌐 Access Your Application

After deployment, access your services at:

| Service | URL | Description |
|---------|-----|-------------|
| Main App | [http://localhost](http://localhost) | Complete application |
| Admin Panel | [http://localhost/admin](http://localhost/admin) | Django admin |
| API Docs | [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/) | API documentation |
| Monitoring | [http://localhost:3001](http://localhost:3001) | Grafana dashboard |

## 👤 Default Login

- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Important**: Change these credentials immediately after first login!

## 🔧 Basic Commands

### Check Status

```bash
# View all services
docker-compose ps

# View logs
docker-compose logs -f
```

### Stop/Start

```bash
# Stop all services
docker-compose down

# Start all services
docker-compose up -d
```

### Troubleshooting

```bash
# Check if Docker is running
docker --version

# View service logs
docker-compose logs backend

# Restart specific service
docker-compose restart backend
```

## 🆘 Common Issues

1. **Docker not running**: Start Docker Desktop
2. **Port conflicts**: Check if ports 80, 8000, 3000 are free
3. **Permission errors**: Run PowerShell as Administrator
4. **SSL errors**: Accept self-signed certificates in browser

## 📞 Need Help?

- Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions
- View service logs: `docker-compose logs -f`
- Verify Docker is running: `docker --version`

---

**🎯 Your EduCore Ultra system is now ready to use!**
