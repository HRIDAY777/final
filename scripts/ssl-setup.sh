#!/bin/bash

# EduCore Ultra - SSL Certificate Setup Script
# This script sets up SSL certificates using Let's Encrypt

set -e  # Exit on any error

echo "🔒 Setting up SSL certificates for EduCore Ultra..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if domain and email are provided
if [ $# -ne 2 ]; then
    print_error "Usage: $0 <domain> <email>"
    echo "Example: $0 yourdomain.com admin@yourdomain.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

print_header "SSL Certificate Setup"
print_status "Domain: $DOMAIN"
print_status "Email: $EMAIL"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root for SSL setup"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt update

# Install Certbot and Nginx plugin
print_status "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Stop Nginx temporarily
print_status "Stopping Nginx..."
systemctl stop nginx

# Generate SSL certificate
print_status "Generating SSL certificate for $DOMAIN..."
certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN,www.$DOMAIN \
    --non-interactive

# Update Nginx configuration with SSL
print_status "Updating Nginx configuration with SSL..."

# Create SSL-enabled Nginx configuration
cat > /etc/nginx/sites-available/educore-ultra <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Client Max Body Size
    client_max_body_size 10M;
    
    # Static Files
    location /static/ {
        alias /var/www/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /media/ {
        alias /var/www/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API Routes
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # WebSocket Support
    location /ws/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Frontend Routes
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health Check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Test Nginx configuration
print_status "Testing Nginx configuration..."
nginx -t

# Start Nginx
print_status "Starting Nginx..."
systemctl start nginx
systemctl enable nginx

# Setup auto-renewal
print_status "Setting up SSL certificate auto-renewal..."
echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'" | crontab -

# Test SSL certificate
print_status "Testing SSL certificate..."
sleep 5

if curl -f https://$DOMAIN/health > /dev/null 2>&1; then
    print_status "SSL certificate is working! ✅"
else
    print_warning "SSL certificate test failed. Please check the configuration."
fi

print_header "SSL Setup Complete!"
print_status "SSL certificate has been successfully configured for $DOMAIN"
print_status "Certificate location: /etc/letsencrypt/live/$DOMAIN/"
print_status "Auto-renewal is configured to run daily at 12:00 PM"

echo ""
print_status "Your application is now accessible at:"
echo "  🔒 https://$DOMAIN"
echo "  🔒 https://www.$DOMAIN"

echo ""
print_warning "Important Notes:"
echo "  • SSL certificate will auto-renew before expiration"
echo "  • Make sure your domain DNS points to this server"
echo "  • Test your application thoroughly"
echo "  • Monitor certificate expiration with: certbot certificates"

print_status "SSL setup completed successfully! 🔒"
