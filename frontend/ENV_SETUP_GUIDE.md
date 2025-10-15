# Environment Variables Setup Guide

## Quick Setup

### 1. Create `.env.local` file in frontend directory

```env
# Copy this template and update values as needed

# ============================================================================
# API Configuration
# ============================================================================
VITE_API_URL=http://localhost:8000
VITE_API_BASE_PATH=/api
VITE_API_TIMEOUT=30000
VITE_API_VERSION=v1

# ============================================================================
# WebSocket Configuration
# ============================================================================
VITE_WS_URL=ws://localhost:8000
VITE_WS_PATH=/ws
VITE_WS_RECONNECT_INTERVAL=5000
VITE_WS_MAX_RECONNECT_ATTEMPTS=5

# ============================================================================
# Authentication
# ============================================================================
VITE_AUTH_TOKEN_KEY=educore_auth_token
VITE_AUTH_REFRESH_TOKEN_KEY=educore_refresh_token
VITE_AUTH_USER_KEY=educore_user
VITE_TOKEN_EXPIRY_BUFFER=300000

# ============================================================================
# Security
# ============================================================================
VITE_ENABLE_CSRF=true
VITE_ENABLE_RATE_LIMIT=true
VITE_MAX_REQUESTS_PER_MINUTE=100

# ============================================================================
# Features
# ============================================================================
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# ============================================================================
# Application
# ============================================================================
VITE_APP_NAME=EduCore Ultra
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# ============================================================================
# Upload Configuration
# ============================================================================
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# ============================================================================
# Cache Configuration
# ============================================================================
VITE_CACHE_ENABLED=true
VITE_CACHE_TTL=300000
VITE_CACHE_MAX_SIZE=100

# ============================================================================
# Debug
# ============================================================================
VITE_DEBUG=false
VITE_LOG_LEVEL=info

# ============================================================================
# External Services (Optional)
# ============================================================================
VITE_GOOGLE_OAUTH_CLIENT_ID=
VITE_SENTRY_DSN=
VITE_GA_TRACKING_ID=
```

### 2. For Production

Create `.env.production`:

```env
VITE_API_URL=https://api.educore.com
VITE_WS_URL=wss://api.educore.com
VITE_APP_ENVIRONMENT=production
VITE_DEBUG=false
VITE_LOG_LEVEL=error
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

### 3. For Staging

Create `.env.staging`:

```env
VITE_API_URL=https://staging-api.educore.com
VITE_WS_URL=wss://staging-api.educore.com
VITE_APP_ENVIRONMENT=staging
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

## Variable Descriptions

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_WS_URL` | WebSocket server URL | `ws://localhost:8000` |
| `VITE_ENABLE_CSRF` | Enable CSRF protection | `true` |
| `VITE_ENABLE_ANALYTICS` | Enable user analytics | `false` |
| `VITE_DEBUG` | Enable debug mode | `false` |

## Environment-specific Builds

```bash
# Development
npm run dev

# Production
npm run build

# Staging
VITE_APP_ENV=staging npm run build
```

## Important Notes

- ⚠️ **Never commit** `.env.local` files
- ✅ Variables must start with `VITE_`
- 🔄 Restart dev server after changing variables
- 📝 Use `.env.example` as template
