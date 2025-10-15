# 🎓 EduCore Ultra - AI-Powered School Management System

Complete, production-ready school management system with Django backend and React frontend.

## 🚀 Quick Start

### One-Command Startup

**Windows:**
```bash
START_ALL.bat
```

**Linux/Mac:**
```bash
chmod +x START_ALL.sh
./START_ALL.sh
```

### Access Points

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Docs** | http://localhost:8000/api/docs/ |
| **Admin** | http://localhost:8000/admin/ |

## 📚 Documentation

- **[Quick Start Guide](./QUICK_START.md)** - Get started in minutes
- **[Backend Guide](./backend/BACKEND_COMPLETE_GUIDE.md)** - Backend setup & deployment
- **[Frontend Guide](./frontend/FRONTEND_PRODUCTION_GUIDE.md)** - Frontend optimization
- **[Environment Setup](./frontend/ENV_SETUP_GUIDE.md)** - Configuration guide
- **[Deployment Guide](./backend/PRODUCTION_DEPLOYMENT_GUIDE.md)** - Production deployment

## ✨ Features

### Core Modules
- 👥 **User Management** - Students, Teachers, Staff, Parents
- 📚 **Academic Management** - Classes, Subjects, Courses, Grades
- ✅ **Attendance System** - Real-time tracking with AI analytics
- 📝 **Examination** - Exam creation, results, report cards
- 📅 **Events & Calendar** - Academic calendar, events management
- 💰 **Fee Management** - Fee structure, payments, invoicing
- 📖 **Library** - Book management, issue/return tracking
- 🚌 **Transport** - Route management, vehicle tracking
- 🏠 **Hostel** - Room allocation, mess management
- 👨‍💼 **HR** - Employee management, payroll
- 📊 **Reports & Analytics** - Comprehensive reporting system

### Advanced Features
- 🤖 **AI Tools** - Automated analytics and predictions
- 💬 **Real-time Chat** - WebSocket-based communication
- 📱 **PWA Support** - Works offline, installable
- 🌐 **Multi-language** - Bangla & English support
- 🔐 **Role-based Access** - Fine-grained permissions
- 📈 **Analytics Dashboard** - Real-time insights
- 🛒 **E-commerce** - Online shop integration
- 🎓 **E-learning** - Online courses and content

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing fast builds
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for data fetching
- **Socket.io** for WebSocket

### Backend
- **Django 4.2** with Python 3.10+
- **Django REST Framework** for API
- **PostgreSQL** database
- **Redis** for caching
- **Celery** for background tasks
- **Django Channels** for WebSocket

## 📋 Prerequisites

- **Python** 3.10 or higher
- **Node.js** 18 or higher
- **PostgreSQL** (for production)
- **Redis** (for caching & WebSocket)

## 🔧 Manual Setup

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

## 🚀 Production Deployment

### Frontend Build
```bash
cd frontend
npm run build:prod
```

### Backend Setup
```bash
cd backend

# Collect static files
python manage.py collectstatic

# Run with Gunicorn
gunicorn core.wsgi:application --bind 0.0.0.0:8000
```

See detailed guides in documentation.

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run test          # Unit tests
npm run e2e           # E2E tests
npm run test:coverage # With coverage
```

### Backend
```bash
cd backend
python manage.py test
```

## 📊 Key Features Implemented

### Performance
- ✅ Code splitting & lazy loading
- ✅ Advanced caching (multi-layer)
- ✅ Bundle size < 500KB
- ✅ Service Worker/PWA
- ✅ Image optimization

### Security
- ✅ XSS Protection
- ✅ CSRF Protection
- ✅ JWT Authentication
- ✅ Rate limiting
- ✅ Secure headers
- ✅ Input validation

### Developer Experience
- ✅ TypeScript for type safety
- ✅ Hot Module Replacement
- ✅ Auto API documentation
- ✅ Comprehensive testing
- ✅ ESLint & Prettier
- ✅ Git hooks

## 🗂️ Project Structure

```
educore-ultra/
├── backend/              # Django backend
│   ├── apps/            # Django apps
│   ├── core/            # Core settings
│   ├── manage.py
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
├── START_ALL.bat        # Windows startup
├── START_ALL.sh         # Linux/Mac startup
└── README.md
```

## 📖 API Documentation

Interactive API documentation available at:
- **Swagger UI:** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000 (backend)
# Windows: netstat -ano | findstr :8000
# Linux/Mac: lsof -ti:8000 | xargs kill -9

# Kill process on port 3000 (frontend)
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -ti:3000 | xargs kill -9
```

### Database Issues
```bash
cd backend
python manage.py migrate --run-syncdb
```

### Dependency Issues
```bash
# Backend
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir

# Frontend
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

- **Documentation:** See `QUICK_START.md` for detailed guide
- **Backend Issues:** Check `backend/BACKEND_COMPLETE_GUIDE.md`
- **Frontend Issues:** Check `frontend/FRONTEND_PRODUCTION_GUIDE.md`
- **Deployment:** See `backend/PRODUCTION_DEPLOYMENT_GUIDE.md`

## 📝 License

MIT License - see LICENSE file for details

## 🎉 Status

**✅ Production Ready**
- All modules implemented
- Full API integration
- Security hardened
- Performance optimized
- Comprehensively tested
- Completely documented

---

**Built with ❤️ for modern education management**

**Start building:** Run `START_ALL.bat` (Windows) or `./START_ALL.sh` (Linux/Mac)
