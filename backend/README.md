# EduCore Ultra - Backend

## 🏫 AI-Powered School Management System Backend

EduCore Ultra is a comprehensive, enterprise-grade school management system built with Django REST Framework, featuring AI-powered tools, real-time communication, and advanced analytics.

## 🚀 Features

### Core Modules

- **Student Management** - Complete student lifecycle management
- **Teacher Management** - Teacher profiles, qualifications, performance tracking
- **Academic Management** - Classes, subjects, timetables, curriculum
- **Attendance System** - Real-time attendance tracking and reporting
- **Exam Management** - Exam scheduling, grading, analytics
- **Library System** - Book management, borrowing, catalog
- **Hostel Management** - Room allocation, fees, maintenance
- **Transport Management** - Routes, vehicles, drivers
- **Billing System** - Fee management, invoices, payments
- **HR Management** - Employee management, payroll, performance
- **Inventory Management** - Asset tracking, maintenance
- **Events Management** - Event planning, registration
- **E-commerce** - School store, online payments
- **E-learning** - Online courses, assignments, progress tracking
- **AI Tools** - Chatbot, analytics, automation
- **Reports & Analytics** - Comprehensive dashboards and insights

### Technical Features

- **RESTful API** - Complete API with Swagger documentation
- **Real-time Communication** - WebSocket support with Channels
- **AI/ML Integration** - Langchain, OpenAI, custom AI models
- **Multi-tenancy** - Support for multiple schools
- **Advanced Security** - JWT, OAuth2, role-based access control
- **File Management** - Cloud storage integration
- **Email System** - Automated notifications and templates
- **Background Tasks** - Celery for async processing
- **Caching** - Redis for performance optimization
- **Monitoring** - Prometheus, Grafana, Sentry integration
- **Testing** - Comprehensive test suite
- **Documentation** - Auto-generated API docs

## 🛠️ Technology Stack

- **Framework**: Django 4.2+ with Django REST Framework
- **Database**: PostgreSQL with pgvector for AI features
- **Cache**: Redis
- **Message Broker**: Redis for Celery
- **Real-time**: Django Channels with Redis backend
- **AI/ML**: Langchain, OpenAI, scikit-learn
- **Authentication**: JWT, OAuth2, Django-Allauth
- **File Storage**: Django-Storages (AWS S3, Google Cloud)
- **Email**: Django-Anymail
- **Monitoring**: Prometheus, Grafana, Sentry
- **Testing**: pytest, factory-boy
- **Documentation**: DRF-Spectacular (Swagger/OpenAPI)

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL 13+
- Redis 6+
- Docker & Docker Compose (for production)
- Node.js 18+ (for frontend)

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd educore-ultra/backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Set up database**

   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Run development server**

   ```bash
   python manage.py runserver
   ```

### Production Deployment

1. **Using Docker Compose (Recommended)**

   ```bash
   # Make deployment script executable
   chmod +x deploy.sh
   
   # Run deployment
   ./deploy.sh
   ```

2. **Manual Deployment**

   ```bash
   # Build and start services
   docker-compose -f docker-compose.prod.yml up -d
   
   # Run migrations
   docker-compose -f docker-compose.prod.yml exec web python manage.py migrate
   
   # Create superuser
   docker-compose -f docker-compose.prod.yml exec web python manage.py createsuperuser
   ```

## 📁 Project Structure

```text
backend/
├── apps/                    # Django applications
│   ├── students/           # Student management
│   ├── teachers/           # Teacher management
│   ├── academics/          # Academic management
│   ├── attendance/         # Attendance system
│   ├── exams/              # Exam management
│   ├── library/            # Library system
│   ├── hostel/             # Hostel management
│   ├── transport/          # Transport management
│   ├── billing/            # Billing system
│   ├── hr/                 # HR management
│   ├── inventory/          # Inventory management
│   ├── events/             # Events management
│   ├── ecommerce/          # E-commerce
│   ├── elearning/          # E-learning
│   ├── ai_tools/           # AI tools
│   ├── analytics/          # Analytics and reporting
│   └── ...
├── core/                   # Core Django settings
│   ├── settings/           # Environment-specific settings
│   ├── urls.py            # Main URL configuration
│   └── wsgi.py            # WSGI configuration
├── api/                    # API configuration
│   ├── urls.py            # API URL routing
│   └── views.py           # API view exports
├── monitoring/             # Monitoring configuration
├── nginx/                  # Nginx configuration
├── requirements.txt        # Python dependencies
├── docker-compose.prod.yml # Production Docker setup
├── Dockerfile.prod         # Production Dockerfile
├── deploy.sh              # Deployment script
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Django Settings
SECRET_KEY=your-secret-key
DEBUG=False
DJANGO_SETTINGS_ENV=prod

# Database
DB_NAME=educore_db
DB_USER=educore_user
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_BACKEND=anymail.backends.sendgrid.EmailBackend
SENDGRID_API_KEY=your-sendgrid-key

# AI/ML
OPENAI_API_KEY=your-openai-key
LANGCHAIN_API_KEY=your-langchain-key

# File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=your-bucket

# Monitoring
SENTRY_DSN=your-sentry-dsn

# Security
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com
```

## 📊 API Documentation

Once the server is running, access the API documentation at:

- **Swagger UI**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- **ReDoc**: [http://localhost:8000/api/redoc/](http://localhost:8000/api/redoc/)

## 🧪 Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.students

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

## 📈 Monitoring

- **Grafana Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Prometheus**: [http://localhost:9090](http://localhost:9090)
- **Application Metrics**: [http://localhost:8000/metrics/](http://localhost:8000/metrics/)

## 🔒 Security

- **HTTPS**: SSL/TLS encryption
- **Security Headers**: HSTS, CSP, XSS protection
- **Rate Limiting**: API throttling
- **Authentication**: JWT tokens with refresh
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive validation
- **SQL Injection Protection**: Django ORM
- **XSS Protection**: Django template escaping

## 🚀 Performance

- **Database Optimization**: Indexing, query optimization
- **Caching**: Redis for frequently accessed data
- **Static Files**: CDN integration
- **Background Tasks**: Celery for heavy operations
- **Load Balancing**: Nginx reverse proxy
- **Monitoring**: Performance metrics tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-username/educore-ultra/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/educore-ultra/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/educore-ultra/discussions)
- **Email**: [support@educore.com](mailto:support@educore.com)

## 🏆 Acknowledgments

- Django community for the excellent framework
- Django REST Framework team for the powerful API toolkit
- All contributors and maintainers

---

**EduCore Ultra** - Revolutionizing School Management with AI 🚀
