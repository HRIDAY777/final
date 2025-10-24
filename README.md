# 🎓 EduCore Ultra - AI-Powered School Management System

<div align="center">

![EduCore Ultra](https://img.shields.io/badge/EduCore-Ultra-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)
![Database](https://img.shields.io/badge/migrations-complete-success?style=for-the-badge)

**A comprehensive, AI-powered school management system built with Django REST Framework and React**

[Quick Start](#-quick-start) • [Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

## 🎯 **Current System Status: 100% OPERATIONAL**

### ✅ **Development Environment Ready**
- **Backend:** Django API running on http://127.0.0.1:8000
- **Frontend:** React UI running on http://localhost:3000
- **Database:** PostgreSQL with 200+ tables migrated
- **Admin:** Superuser created (admin@educore.com)

### 🚀 **Quick Access**
- **Frontend UI:** http://localhost:3000
- **Backend API:** http://127.0.0.1:8000
- **Admin Panel:** http://127.0.0.1:8000/admin

</div>

---

## 🚀 Quick Start

### Development URLs (Current Setup)
- **Frontend:** http://localhost:3000
- **Backend API:** http://127.0.0.1:8000
- **Admin Panel:** http://127.0.0.1:8000/admin
- **API Docs:** http://127.0.0.1:8000/api/docs

### Admin Credentials (Development)
```
Email:    admin@educore.com
Username: admin@educore.com
Password: Admin@12345
```

### Database Status
- ✅ PostgreSQL migrations completed (200+ tables)
- ✅ All modules configured and ready
- ✅ Superuser account created
- ✅ Development environment ready

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🌟 Overview

**EduCore Ultra** is a complete, production-ready school management system designed to streamline educational institution operations. Built with modern technologies, it offers a comprehensive suite of tools for managing students, teachers, academics, attendance, finances, and much more.

### Why EduCore Ultra?

- ✅ **Complete Solution** - All-in-one platform for school management
- 🚀 **Modern Tech Stack** - Built with React, Django, and TypeScript
- 🎨 **Beautiful UI** - Clean, responsive design with dark mode support
- 🔒 **Secure** - JWT authentication, RBAC, and security best practices
- 📊 **Analytics** - AI-powered insights and comprehensive reporting
- 🌍 **Multilingual** - Support for multiple languages (English, Bangla)
- 📱 **Mobile Friendly** - Fully responsive with mobile-optimized interface
- ⚡ **Performance** - Optimized for speed and scalability

---

## ✨ Features

### 👥 User Management
- **Students Management** - Complete student profiles, enrollment, and tracking
- **Teachers Management** - Teacher profiles, assignments, and performance
- **Staff Management** - HR operations and employee records
- **Role-Based Access Control** - Granular permissions and access management

### 📚 Academic Management
- **Classes & Sections** - Organize students into classes and sections
- **Subjects & Courses** - Curriculum management and course planning
- **Lessons & Assignments** - Lesson planning and assignment tracking
- **Grades & Results** - Grade calculation and result management
- **Timetable** - Schedule management and conflict resolution

### ⏰ Attendance System
- **Daily Attendance** - Mark and track student/staff attendance
- **Leave Management** - Leave requests and approval workflow
- **AI Analytics** - Attendance patterns and predictive analytics
- **Biometric Integration** - Support for biometric attendance devices
- **Guardian Portal** - Real-time attendance updates for parents

### 💰 Financial Management
- **Fee Management** - Fee structure, collection, and tracking
- **Billing & Invoicing** - Automated invoice generation
- **Payment Processing** - Multiple payment methods support
- **Financial Reports** - Revenue, expenses, and financial analytics
- **Outstanding Tracking** - Automated reminders for pending payments

### 📖 Library Management
- **Books Catalog** - Complete library inventory management
- **Borrowing System** - Issue and return tracking
- **Reservations** - Book reservation system
- **Fine Management** - Automated fine calculation
- **Authors & Categories** - Organized categorization

### 📝 Examination System
- **Exam Creation** - Create and schedule exams
- **Question Bank** - Centralized question repository
- **Online Quizzes** - Digital assessment platform
- **Result Management** - Automated result calculation
- **Grade Analysis** - Performance analytics and insights

### 🚌 Transport Management
- **Route Planning** - School bus route management
- **Vehicle Tracking** - Real-time vehicle tracking
- **Driver Management** - Driver profiles and assignments
- **Student Transport** - Student-route assignments

### 🏢 Hostel Management
- **Room Allocation** - Hostel room management
- **Building Management** - Multiple building support
- **Maintenance Tracking** - Maintenance requests and logs
- **Visitor Management** - Visitor logs and security

### 👔 HR & Payroll
- **Employee Management** - Complete HR operations
- **Payroll Processing** - Automated salary calculation
- **Leave Management** - Leave tracking and approval
- **Attendance Tracking** - Staff attendance management

### 📦 Inventory Management
- **Stock Management** - Track school assets and supplies
- **Asset Tracking** - Fixed asset management
- **Transactions** - Purchase and usage tracking
- **Maintenance Records** - Asset maintenance logs

### 🛒 E-commerce
- **Online Store** - School merchandise and books
- **Product Catalog** - Product management
- **Order Management** - Order processing and tracking
- **Customer Management** - Customer profiles and history

### 🎓 E-learning
- **Course Management** - Online course creation
- **Content Delivery** - Lessons and materials
- **Progress Tracking** - Student progress monitoring
- **Certificates** - Digital certificate generation

### 📅 Events Management
- **Event Calendar** - School events and activities
- **Event Planning** - Event organization and management
- **Notifications** - Automated event reminders
- **Analytics** - Event participation tracking

### 📊 Reports & Analytics
- **Custom Reports** - Report builder with templates
- **Scheduled Reports** - Automated report generation
- **Data Visualization** - Charts, graphs, and dashboards
- **Export Options** - PDF, Excel, CSV exports

### 🤖 AI Tools
- **Predictive Analytics** - AI-powered insights
- **Performance Prediction** - Student performance forecasting
- **Attendance Patterns** - Behavior analysis
- **Smart Recommendations** - AI-driven suggestions

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 4.2
- **API:** Django REST Framework 3.14
- **Database:** PostgreSQL (Production) / SQLite (Development)
- **Authentication:** JWT (djangorestframework-simplejwt)
- **Task Queue:** Celery
- **Cache:** Redis
- **Storage:** AWS S3 / Local Storage
- **Real-time:** Django Channels (WebSocket)

### Frontend
- **Framework:** React 18.2
- **Language:** TypeScript 5.2
- **Build Tool:** Vite 6.1
- **Styling:** Tailwind CSS 3.3
- **State Management:** Zustand 4.4
- **Routing:** React Router 6.20
- **Forms:** React Hook Form 7.48
- **Validation:** Zod 3.22
- **HTTP Client:** Axios 1.6
- **Charts:** Recharts 2.8
- **Animations:** Framer Motion 10.16
- **Icons:** Heroicons 2.0
- **Date Handling:** date-fns 4.1

### DevOps
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx
- **Monitoring:** Prometheus
- **Process Manager:** Gunicorn
- **Testing:** Vitest, Playwright
- **CI/CD:** GitHub Actions Ready

---

## 📸 Screenshots

> Coming soon! Screenshots of the dashboard, student management, attendance system, and more.

---

## 🚀 Installation

### Prerequisites

- **Python** 3.10 or higher
- **Node.js** 18.0 or higher
- **npm** 9.0 or higher
- **PostgreSQL** 14+ (for production)
- **Redis** 7+ (optional, for caching)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/HRIDAY777/final.git
cd final
```

#### 2. Backend Setup (✅ Already Configured)

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Database is already configured with PostgreSQL
# Migrations are already completed (200+ tables)
# Superuser is already created: admin@educore.com

# Start development server
python manage.py runserver
```

**✅ Backend Status:**
- Database: PostgreSQL connected and migrated
- Superuser: admin@educore.com (created)
- Server: Running on http://127.0.0.1:8000
- Admin panel: http://127.0.0.1:8000/admin

#### 3. Frontend Setup (✅ Already Running)

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

**✅ Frontend Status:**
- Server: Running on http://localhost:3000
- Build: Successful with all components loaded
- Import errors: Resolved

### Docker Setup (Recommended for Production)

```bash
# Development environment
docker-compose -f docker-compose.dev.yml up --build

# Production environment (complete stack with monitoring)
# Configured for: cqs-int.com
docker-compose -f docker-compose.production.yml up -d
```

**Production includes:**
- ✅ PostgreSQL (optimized)
- ✅ Redis (caching)
- ✅ Celery workers
- ✅ Nginx reverse proxy
- ✅ Prometheus + Grafana monitoring
- ✅ SSL/HTTPS support

---

## ⚙️ Configuration

### Production Configuration

The system is configured for **cqs-int.com** with:
- Database: PostgreSQL (educore_ultra_prod)
- Caching: Redis
- Domain: cqs-int.com
- Email: Configured for SMTP
- Monitoring: Grafana + Prometheus

Production environment file: `env.production` (already configured)

### Development Configuration

Create a `.env` file in the `backend` directory for local development:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL for production)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=educore_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Redis (Optional)
REDIS_URL=redis://localhost:6379/0

# Email Settings
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=your-bucket-name

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/ws
VITE_APP_VERSION=1.0.0
```

---

## 📖 Usage

### Default Login

**✅ System is Ready!** You can access:

- **Frontend:** http://localhost:3000
- **Backend API:** http://127.0.0.1:8000
- **Admin Panel:** http://127.0.0.1:8000/admin
  - **Email:** admin@educore.com
  - **Password:** Admin@12345

### API Documentation

Interactive API documentation is available at:
- **Swagger UI:** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/

### Admin Panel

Django admin panel is available at:
- **URL:** http://localhost:8000/admin/

---

## 📚 API Documentation

### Authentication

```bash
# Login
POST /api/auth/login/
{
  "email": "user@example.com",
  "password": "password123"
}

# Response
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Student Management

```bash
# List Students
GET /api/students/

# Create Student
POST /api/students/
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "date_of_birth": "2010-01-01",
  "gender": "M",
  "current_class": 1
}

# Get Student Details
GET /api/students/{id}/

# Update Student
PUT /api/students/{id}/

# Delete Student
DELETE /api/students/{id}/
```

### Attendance

```bash
# Mark Attendance
POST /api/attendance/sessions/{id}/bulk_mark_attendance/
{
  "attendance_records": [
    {"student": 1, "status": "present"},
    {"student": 2, "status": "absent"}
  ]
}
```

For complete API documentation, visit the Swagger UI at `/api/docs/`

---

## 📁 Project Structure

```
final/
├── backend/                    # Django Backend
│   ├── api/                   # Main API endpoints
│   │   ├── views.py          # API views
│   │   ├── urls.py           # URL routing
│   │   └── health.py         # Health check endpoints
│   ├── apps/                  # Django applications
│   │   ├── students/         # Student management
│   │   ├── teachers/         # Teacher management
│   │   ├── academics/        # Academic operations
│   │   ├── attendance/       # Attendance system
│   │   ├── billing/          # Finance & billing
│   │   ├── library/          # Library management
│   │   ├── exams/            # Examination system
│   │   ├── transport/        # Transport management
│   │   ├── hostel/           # Hostel management
│   │   ├── hr/               # HR & payroll
│   │   ├── inventory/        # Inventory management
│   │   ├── ecommerce/        # E-commerce
│   │   ├── elearning/        # E-learning platform
│   │   ├── events/           # Events management
│   │   ├── reports/          # Reports & analytics
│   │   ├── analytics/        # Analytics engine
│   │   ├── ai_tools/         # AI features
│   │   ├── accounts/         # User accounts & RBAC
│   │   └── tenants/          # Multi-tenancy
│   ├── core/                  # Core settings
│   │   ├── settings/         # Django settings
│   │   ├── middleware.py     # Custom middleware
│   │   └── utils.py          # Utility functions
│   ├── media/                 # User uploads
│   ├── static/                # Static files
│   ├── manage.py              # Django management
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── CRUD/        # CRUD components
│   │   │   ├── Forms/       # Form components
│   │   │   ├── Layout/      # Layout components
│   │   │   ├── UI/          # UI components
│   │   │   └── reports/     # Report components
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard/   # Dashboard
│   │   │   ├── Students/    # Student pages
│   │   │   ├── Teachers/    # Teacher pages
│   │   │   ├── Academics/   # Academic pages
│   │   │   ├── Attendance/  # Attendance pages
│   │   │   ├── Finance/     # Finance pages
│   │   │   └── ...          # Other modules
│   │   ├── hooks/            # Custom React hooks
│   │   ├── stores/           # Zustand stores
│   │   ├── services/         # API services
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # TypeScript types
│   │   └── App.tsx           # Main App component
│   ├── public/                # Public assets
│   ├── package.json           # Node dependencies
│   └── vite.config.ts        # Vite configuration
│
├── docker-compose.dev.yml          # Docker dev setup
├── docker-compose.prod.yml         # Docker prod setup (legacy)
├── docker-compose.production.yml   # Complete production setup (recommended)
├── nginx/                      # Nginx configuration
├── monitoring/                 # Monitoring setup
├── PROJECT_STATUS.md          # Project status
└── README.md                  # This file
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Backend Not Starting
```bash
# If backend fails to start, check:
1. PostgreSQL is running: Get-Service postgresql-x64-17
2. Database exists: Check if educore_ultra_prod database exists
3. SSL settings: Ensure DB_OPTIONS_SSLMODE=disable in .env
4. Port availability: Check if port 8000 is free
```

#### Frontend Import Errors
```bash
# If you see import errors:
1. Check if all components exist in src/pages/
2. Verify index.ts files are created for modules
3. Run: npm run dev to restart the server
```

#### Database Connection Issues
```bash
# If database connection fails:
1. Check PostgreSQL service: Get-Service postgresql-x64-17
2. Verify .env file has correct DB_HOST=localhost
3. Ensure DB_OPTIONS_SSLMODE=disable
4. Check if database exists: educore_ultra_prod
```

#### Port Conflicts
```bash
# If ports are busy:
# Backend (8000): netstat -an | findstr ":8000"
# Frontend (3000): netstat -an | findstr ":3000"
# Kill processes if needed: taskkill /PID <process_id> /F
```

### System Requirements Met
- ✅ Python 3.13 installed
- ✅ Node.js and npm installed  
- ✅ PostgreSQL 17 running
- ✅ All dependencies installed
- ✅ Database migrated successfully
- ✅ Both servers running

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Tests

```bash
cd frontend

# Unit tests
npm run test

# E2E tests
npm run e2e

# Coverage
npm run test:coverage
```

---

## 🚢 Deployment

### Production Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete production setup guide.

### Quick Production Setup

#### 1. Configure Environment (Already Done for cqs-int.com)
```bash
# Environment file already configured with:
# - Domain: cqs-int.com
# - Database: educore_ultra_prod
# - All security settings
# 
# To customize, edit: env.production
```

#### 2. Generate Secrets
```bash
# Generate Django SECRET_KEY
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

#### 3. Setup SSL Certificates
```bash
# Using Let's Encrypt
sudo certbot certonly --standalone -d cqs-int.com -d www.cqs-int.com
sudo cp /etc/letsencrypt/live/cqs-int.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/cqs-int.com/privkey.pem nginx/ssl/
```

#### 4. Deploy with Docker
```bash
# Build and start all services
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Run migrations
docker-compose -f docker-compose.production.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.production.yml exec backend python manage.py createsuperuser

# Collect static files
docker-compose -f docker-compose.production.yml exec backend python manage.py collectstatic --noinput
```

#### 5. Verify Deployment
- **Frontend:** `https://cqs-int.com`
- **Admin Panel:** `https://cqs-int.com/admin` (admin@cqs-int.com / Admin@12345)
- **API Docs:** `https://cqs-int.com/api/docs`
- **Health Check:** `https://cqs-int.com/health/`
- **Grafana:** `http://cqs-int.com:3001`

### Current Status (Development)
- ✅ Database migrations: **COMPLETE** (200+ tables)
- ✅ PostgreSQL configured: **Connected and migrated**
- ✅ Superuser created: **admin@educore.com**
- ✅ Backend server: **Running on port 8000**
- ✅ Frontend server: **Running on port 3000**
- ✅ All modules: **Loaded and functional**
- ✅ Development environment: **100% Ready**

### Production Services

The production stack includes:
- ✅ Django Backend (Gunicorn)
- ✅ React Frontend (Nginx)
- ✅ PostgreSQL Database (optimized)
- ✅ Redis Cache & Message Broker
- ✅ Celery Workers & Beat Scheduler
- ✅ Nginx Reverse Proxy with SSL
- ✅ Prometheus + Grafana Monitoring
- ✅ PostgreSQL, Redis, and Node Exporters

### Alternative Deployment Platforms

- **AWS EC2/ECS** - Full control with auto-scaling
- **DigitalOcean Droplets** - Simple VPS deployment
- **Google Cloud Platform** - Cloud Run or Compute Engine
- **Azure** - App Service or Container Instances
- **Railway** - Quick deployment with managed services
- **Heroku** - Simple deployment (separate frontend/backend)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Guidelines

- Follow PEP 8 for Python code
- Use ESLint rules for TypeScript/React
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and descriptive

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **HRIDAY777** - *Initial work* - [GitHub](https://github.com/HRIDAY777)

---

## 🙏 Acknowledgments

- Django REST Framework team
- React team
- Tailwind CSS team
- All open-source contributors

---

## 📞 Support

For support, email support@educore.com or join our Slack channel.

### Issues

If you find a bug or have a feature request, please open an issue on GitHub:
[https://github.com/HRIDAY777/final/issues](https://github.com/HRIDAY777/final/issues)

---

## 🗺️ Roadmap

- [ ] Mobile apps (iOS & Android)
- [ ] Advanced AI features
- [ ] Video conferencing integration
- [ ] Mobile payment integration
- [ ] Parent mobile app
- [ ] Teacher mobile app
- [ ] Offline mode support
- [ ] Multi-language expansion
- [ ] Advanced analytics dashboard
- [ ] Integration with learning management systems

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/HRIDAY777/final?style=social)
![GitHub forks](https://img.shields.io/github/forks/HRIDAY777/final?style=social)
![GitHub issues](https://img.shields.io/github/issues/HRIDAY777/final)
![GitHub pull requests](https://img.shields.io/github/issues-pr/HRIDAY777/final)

---

---

## 🎉 **System Status Summary**

### ✅ **FULLY OPERATIONAL - Development Environment**

| Component | Status | URL | Notes |
|-----------|--------|-----|-------|
| **Backend API** | ✅ Running | http://127.0.0.1:8000 | Django + PostgreSQL |
| **Frontend UI** | ✅ Running | http://localhost:3000 | React + Vite |
| **Database** | ✅ Migrated | PostgreSQL | 200+ tables created |
| **Admin Panel** | ✅ Ready | http://127.0.0.1:8000/admin | admin@educore.com |
| **API Docs** | ✅ Available | http://127.0.0.1:8000/api/docs | Swagger UI |

### 🚀 **Ready to Use**
- All modules loaded and functional
- Database fully migrated
- Superuser account created
- Both servers running successfully
- No import errors or configuration issues

### 📋 **Next Steps**
1. Access the frontend at http://localhost:3000
2. Login with admin@educore.com / Admin@12345
3. Explore all available modules and features
4. Start adding students, teachers, and academic data

---

<div align="center">

**[⬆ back to top](#-educore-ultra---ai-powered-school-management-system)**

Made with ❤️ by the EduCore Team

</div>

