# 🔐 Facebook Login Setup Guide / ফেসবুক লগইন সেটআপ গাইড

## ✅ Status: Facebook Login Ready!

আপনার ওয়েবসাইটে Facebook Login এবং Google Login সম্পূর্ণভাবে কনফিগার করা আছে! শুধু Facebook App তৈরি করতে হবে।

Your website is fully configured for Facebook & Google Login! You just need to create a Facebook App.

---

## 📋 Step 1: Facebook App তৈরি করুন / Create Facebook App

### 1.1 Facebook Developers-এ যান
Visit: **https://developers.facebook.com/**

### 1.2 "My Apps" > "Create App" ক্লিক করুন

### 1.3 App Type Select করুন:
- Select: **"Consumer"** বা **"Business"**
- Click: **"Next"**

### 1.4 App Details Fill করুন:
- **App Name:** EduCore Ultra (অথবা আপনার পছন্দের নাম)
- **App Contact Email:** আপনার ইমেইল
- Click: **"Create App"**

---

## 📱 Step 2: Facebook Login Configure করুন

### 2.1 Left Sidebar থেকে:
1. Click **"Add Products"**
2. Find **"Facebook Login"**
3. Click **"Set Up"**

### 2.2 Platform Select করুন:
- Select: **"Website"**
- Site URL: `http://localhost:5173` (development এর জন্য)
- Click: **"Save"**
- Click: **"Continue"**

### 2.3 Settings > Basic থেকে:
1. App ID copy করুন
2. App Secret copy করুন (Show button ক্লিক করে)

---

## ⚙️ Step 3: Valid OAuth Redirect URIs Set করুন

### 3.1 Facebook Login > Settings যান

### 3.2 "Valid OAuth Redirect URIs" তে Add করুন:

**Development:**
```
http://localhost:8000/accounts/facebook/login/callback/
http://127.0.0.1:8000/accounts/facebook/login/callback/
```

**Production:** (যখন deploy করবেন)
```
https://yourdomain.com/accounts/facebook/login/callback/
```

### 3.3 Save Changes ক্লিক করুন

---

## 🔧 Step 4: Django Admin-এ Social App Add করুন

### 4.1 Backend Server Start করুন:
```powershell
cd backend
python manage.py runserver
```

### 4.2 Admin Panel-এ Login করুন:
1. Visit: **http://127.0.0.1:8000/admin**
2. প্রথমবার? Superuser তৈরি করুন:
   ```powershell
   python manage.py createsuperuser
   ```

### 4.3 Social Applications Add করুন:
1. Left sidebar থেকে **"Social applications"** ক্লিক করুন
2. **"Add Social Application"** ক্লিক করুন

### 4.4 Facebook App Information Fill করুন:

**Provider:** Select **"Facebook"**

**Name:** `Facebook` (যেকোনো নাম দিতে পারেন)

**Client ID:** আপনার Facebook **App ID** paste করুন

**Secret Key:** আপনার Facebook **App Secret** paste করুন

**Key:** (খালি রাখুন / Leave empty)

**Sites:** 
- Available sites থেকে **"example.com"** select করুন
- Arrow button (>) ক্লিক করে Chosen sites এ add করুন

**Settings (JSON):** (Optional)
```json
{
  "SCOPE": ["email", "public_profile"],
  "FIELDS": ["id", "email", "name", "first_name", "last_name"]
}
```

### 4.5 "Save" ক্লিক করুন

---

## 🌐 Step 5: Frontend-এ Facebook Login Button Add করুন

### Login Page এ Facebook Button যুক্ত করুন:

**File:** `frontend/src/pages/Auth/Login.tsx`

```typescript
import { Button } from '@/components/UI';

function Login() {
  const handleFacebookLogin = () => {
    window.location.href = 'http://127.0.0.1:8000/accounts/facebook/login/';
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://127.0.0.1:8000/accounts/google/login/';
  };

  return (
    <div>
      {/* Your existing login form */}
      
      <div className="mt-6 space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Facebook Login Button */}
        <Button
          onClick={handleFacebookLogin}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Continue with Facebook
        </Button>

        {/* Google Login Button */}
        <Button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
```

---

## 🎯 Step 6: Test করুন / Testing

### 6.1 Servers Start করুন:

**Backend:**
```powershell
cd backend
python manage.py runserver
```

**Frontend:**
```powershell
cd frontend
npm run dev
```

### 6.2 Browser-এ যান:
```
http://localhost:5173
```

### 6.3 Facebook Login Button ক্লিক করুন

### 6.4 Facebook Login Page দেখা যাবে - Login করুন

### 6.5 Success! ✅ আপনি লগইন হয়ে যাবেন

---

## 🔴 App Live/Production Mode এ নিন (Optional)

যদি Public করতে চান:

### 1. Facebook App Dashboard যান
### 2. Settings > Basic
### 3. "App Mode" section-এ
### 4. **"Switch to Live"** toggle করুন
### 5. Privacy Policy URL এবং Terms of Service URL দিন

**Note:** Development mode-এ শুধু App admin/developers/testers লগইন করতে পারবে।

---

## 🎨 Already Configured Features

✅ **Backend Configuration:**
- Django Allauth installed
- Facebook & Google providers configured
- OAuth URLs ready
- Social account models created

✅ **Settings Configured:**
```python
SOCIALACCOUNT_PROVIDERS = {
    'facebook': {
        'METHOD': 'oauth2',
        'SCOPE': ['email', 'public_profile'],
        'FIELDS': [
            'id', 'email', 'name',
            'first_name', 'last_name',
        ],
        'VERSION': 'v18.0',
    }
}
```

✅ **Available URLs:**
- `/accounts/facebook/login/` - Facebook login start
- `/accounts/facebook/login/callback/` - Facebook callback
- `/accounts/google/login/` - Google login start
- `/accounts/google/login/callback/` - Google callback

---

## 📊 User Data যা পাবেন / User Data You'll Receive

Facebook থেকে:
- ✅ Email
- ✅ Name (First & Last)
- ✅ Profile Picture
- ✅ Facebook User ID

Google থেকে:
- ✅ Email
- ✅ Name
- ✅ Profile Picture
- ✅ Google User ID

---

## 🔧 Environment Variables (Optional)

`.env` file এ add করতে পারেন:

```env
# Social Auth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 🌍 Google Login Setup করতে চান?

Same process! শুধু:
1. Visit: https://console.cloud.google.com/
2. Create Project
3. Enable Google+ API
4. Create OAuth 2.0 Credentials
5. Add Redirect URI: `http://127.0.0.1:8000/accounts/google/login/callback/`
6. Django Admin-এ Social App add করুন (Provider: Google)

---

## ❓ Troubleshooting / সমস্যা সমাধান

### Facebook Login কাজ করছে না?

1. **Check Redirect URI:**
   - Facebook App Settings-এ সঠিক URI দিয়েছেন কিনা চেক করুন

2. **Check Social Application:**
   - Django Admin-এ Facebook App properly add করেছেন কিনা

3. **Check Site:**
   - Social Application-এ "example.com" site add করেছেন কিনা

4. **Check App Mode:**
   - Development mode-এ আছেন? App admin/tester হিসেবে add করেছেন কিনা

5. **Clear Browser Cache:**
   - Browser cache clear করে আবার try করুন

### Error: "App Not Setup"
- Facebook App-এ Facebook Login product properly add করুন

### Error: "Redirect URI Mismatch"
- Facebook Settings-এ Valid OAuth Redirect URIs চেক করুন

---

## 📚 Additional Resources

- **Django Allauth Docs:** https://django-allauth.readthedocs.io/
- **Facebook Login Docs:** https://developers.facebook.com/docs/facebook-login/
- **Google OAuth Docs:** https://developers.google.com/identity/protocols/oauth2

---

## ✅ Summary / সারাংশ

আপনার ওয়েবসাইট Facebook এবং Google Login এর জন্য সম্পূর্ণ ready! 

শুধু:
1. ✅ Facebook App তৈরি করুন
2. ✅ Client ID & Secret copy করুন
3. ✅ Django Admin-এ Social App add করুন
4. ✅ Frontend-এ Login button add করুন
5. ✅ Test করুন

**That's it! Your users can now login with Facebook & Google! 🎉**

---

**Made with ❤️ for EduCore Ultra**  
**GitHub:** https://github.com/HRIDAY777/final

