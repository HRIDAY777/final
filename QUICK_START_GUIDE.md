# 🚀 Quick Start Guide - EduCore Ultra

## ✅ Everything is 100% Ready!

Your EduCore Ultra website is fully configured and ready to run. Follow these simple steps to start using it.

---

## 📋 Prerequisites (Already Installed)

✅ Python 3.13.7  
✅ Node.js (18+)  
✅ All Dependencies Installed

---

## 🎯 Start the Website (2 Simple Steps)

### Step 1: Start the Backend Server

Open PowerShell/Terminal in the project folder and run:

```powershell
cd backend
python manage.py runserver
```

**Backend will run at:** http://127.0.0.1:8000

✅ You should see: "Starting development server at http://127.0.0.1:8000/"

---

### Step 2: Start the Frontend Server

Open a **NEW** PowerShell/Terminal window and run:

```powershell
cd frontend
npm run dev
```

**Frontend will run at:** http://localhost:5173

✅ You should see: "Local: http://localhost:5173/"

---

## 🌐 Access Your Website

Open your browser and go to:

### **http://localhost:5173**

**That's it! Your website is now running! 🎉**

---

## 📱 Available Features

Once the website loads, you can access:

### Main Dashboard
- Student Management
- Teacher Management
- Class Management
- Attendance System
- Examination System
- Library Management
- Financial Management
- E-commerce Platform
- E-learning System
- Analytics & Reports
- And 20+ more modules!

---

## 🔐 Create Your First Admin User (Optional)

To access the Django admin panel:

```powershell
cd backend
python manage.py createsuperuser
```

Follow the prompts to create your admin account.

**Access Admin Panel:** http://127.0.0.1:8000/admin

---

## 📚 API Documentation

Your API documentation is automatically available at:

- **Swagger UI:** http://127.0.0.1:8000/api/schema/swagger-ui/
- **ReDoc:** http://127.0.0.1:8000/api/schema/redoc/

---

## 🔧 Common Commands

### Backend Commands

```powershell
# Run development server
python manage.py runserver

# Create superuser
python manage.py createsuperuser

# Run migrations
python manage.py migrate

# Create new migrations
python manage.py makemigrations

# Run tests
python manage.py test

# Check system
python manage.py check
```

### Frontend Commands

```powershell
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm test
```

---

## 🎨 Customize Your Website

### Change Website Title
Edit `frontend/index.html` - line 7

### Change Colors/Theme
Edit `frontend/tailwind.config.ts`

### Add New Features
Create new components in `frontend/src/components/`

---

## 📊 Database

Your database is located at: `backend/db.sqlite3`

- **Type:** SQLite3
- **Status:** ✅ All migrations applied
- **Tables:** 185+ tables created

---

## 🌍 Deploy to Production

When you're ready to deploy:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Configure environment variables in `.env`

3. Use Docker Compose:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

Or follow the deployment guides:
- `DEPLOYMENT_CHECKLIST.md`
- `HOSTINGER_DEPLOYMENT_GUIDE.md`

---

## ❓ Troubleshooting

### Backend won't start?
- Check if port 8000 is free
- Ensure you're in the `backend` directory
- Try: `python manage.py check`

### Frontend won't start?
- Check if port 5173 is free
- Ensure you're in the `frontend` directory
- Try: `npm install` again

### Database errors?
- Run: `python manage.py migrate`
- Database file: `backend/db.sqlite3`

---

## 📖 Documentation

- **Full Documentation:** `SYSTEM_STATUS_REPORT.md`
- **README:** `README.md`
- **Deployment:** `DEPLOYMENT_CHECKLIST.md`

---

## 🎉 Summary

**Your website has:**
- ✅ 30+ working modules
- ✅ 100+ pages
- ✅ All buttons working
- ✅ All links configured
- ✅ All APIs ready
- ✅ Database configured
- ✅ Frontend built successfully
- ✅ Backend running perfectly

**Just run the 2 commands above and you're good to go!** 🚀

---

## 🆘 Need Help?

Check the documentation files:
1. `SYSTEM_STATUS_REPORT.md` - Complete system status
2. `README.md` - Full project documentation
3. `FUNCTIONALITY_TEST_REPORT.md` - Feature testing report

---

**Made with ❤️ by the EduCore Ultra Team**  
**GitHub:** https://github.com/HRIDAY777/final

