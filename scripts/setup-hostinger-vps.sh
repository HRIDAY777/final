#!/bin/bash

# EduCore Ultra - Hostinger VPS Setup Script
# This script sets up the production environment on Hostinger VPS

set -e  # Exit on any error

echo "🚀 Starting EduCore Ultra VPS Setup..."

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Update system packages
print_header "Updating System Packages"
print_status "Updating package lists..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_header "Installing Essential Packages"
print_status "Installing essential system packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    htop \
    nano \
    vim \
    ufw \
    fail2ban \
    logrotate \
    cron \
    rsync \
    build-essential \
    python3-dev \
    python3-pip \
    python3-venv \
    libpq-dev \
    libssl-dev \
    libffi-dev \
    libjpeg-dev \
    libpng-dev \
    zlib1g-dev

# Install Docker
print_header "Installing Docker"
print_status "Installing Docker and Docker Compose..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

# Install Docker Compose
print_status "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js and npm
print_header "Installing Node.js"
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL (if not using Docker)
print_header "Installing PostgreSQL"
print_status "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib postgresql-client

# Install Redis (if not using Docker)
print_header "Installing Redis"
print_status "Installing Redis..."
sudo apt install -y redis-server

# Install Nginx
print_header "Installing Nginx"
print_status "Installing Nginx..."
sudo apt install -y nginx

# Configure firewall
print_header "Configuring Firewall"
print_status "Setting up UFW firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable

# Configure fail2ban
print_header "Configuring Fail2ban"
print_status "Setting up fail2ban for security..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create application directory
print_header "Setting Up Application Directory"
APP_DIR="/var/www/educore-ultra"
print_status "Creating application directory at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Create log directory
print_status "Creating log directory..."
sudo mkdir -p /var/log/educore
sudo chown $USER:$USER /var/log/educore

# Create backup directory
print_status "Creating backup directory..."
sudo mkdir -p /var/backups/educore
sudo chown $USER:$USER /var/backups/educore

# Create SSL directory
print_status "Creating SSL directory..."
sudo mkdir -p /etc/nginx/ssl
sudo chown $USER:$USER /etc/nginx/ssl

# Configure logrotate
print_header "Configuring Log Rotation"
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/educore > /dev/null <<EOF
/var/log/educore/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# Configure systemd services
print_header "Configuring System Services"
print_status "Setting up systemd services..."

# Create systemd service for the application
sudo tee /etc/systemd/system/educore-ultra.service > /dev/null <<EOF
[Unit]
Description=EduCore Ultra Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=$USER
Group=$USER

[Install]
WantedBy=multi-user.target
EOF

# Enable and start services
sudo systemctl daemon-reload
sudo systemctl enable educore-ultra.service

# Configure PostgreSQL
print_header "Configuring PostgreSQL"
print_status "Setting up PostgreSQL database..."
sudo -u postgres psql <<EOF
CREATE DATABASE educore_ultra_prod;
CREATE USER educore_user WITH PASSWORD 'CHANGE_ME_STRONG_DATABASE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE educore_ultra_prod TO educore_user;
ALTER USER educore_user CREATEDB;
\q
EOF

# Configure Redis
print_header "Configuring Redis"
print_status "Setting up Redis..."
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Configure Nginx
print_header "Configuring Nginx"
print_status "Setting up Nginx configuration..."

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/educore-ultra > /dev/null <<'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (update paths)
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # WebSocket Support
    location /ws/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend Routes
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health Check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/educore-ultra /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Create SSL certificate script
print_header "Creating SSL Certificate Setup"
print_status "Creating SSL certificate setup script..."
sudo tee /usr/local/bin/setup-ssl.sh > /dev/null <<'EOF'
#!/bin/bash

# SSL Certificate Setup Script for EduCore Ultra

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: $0 <domain> <email>"
    echo "Example: $0 yourdomain.com admin@yourdomain.com"
    exit 1
fi

# Install Certbot
apt update
apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect

# Setup auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

echo "SSL certificate setup complete for $DOMAIN"
EOF

sudo chmod +x /usr/local/bin/setup-ssl.sh

# Create backup script
print_header "Creating Backup Script"
print_status "Setting up automated backup script..."
sudo tee /usr/local/bin/backup-educore.sh > /dev/null <<'EOF'
#!/bin/bash

# EduCore Ultra Backup Script

BACKUP_DIR="/var/backups/educore"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="educore_backup_$DATE.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
cd /var/www/educore-ultra
tar -czf $BACKUP_DIR/$BACKUP_FILE \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=dist \
    --exclude=__pycache__ \
    .

# Database backup
docker-compose exec -T db pg_dump -U educore_user educore_ultra_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -name "educore_backup_*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
EOF

sudo chmod +x /usr/local/bin/backup-educore.sh

# Setup cron job for backups
print_status "Setting up automated backups..."
echo "0 2 * * * /usr/local/bin/backup-educore.sh" | crontab -

# Create monitoring script
print_header "Creating Monitoring Script"
print_status "Setting up system monitoring..."
sudo tee /usr/local/bin/monitor-educore.sh > /dev/null <<'EOF'
#!/bin/bash

# EduCore Ultra Monitoring Script

LOG_FILE="/var/log/educore/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check if services are running
check_service() {
    local service=$1
    if systemctl is-active --quiet $service; then
        echo "[$DATE] $service: OK" >> $LOG_FILE
    else
        echo "[$DATE] $service: FAILED" >> $LOG_FILE
        systemctl restart $service
    fi
}

# Check services
check_service "nginx"
check_service "postgresql"
check_service "redis-server"
check_service "educore-ultra"

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 90 ]; then
    echo "[$DATE] WARNING: Memory usage is ${MEM_USAGE}%" >> $LOG_FILE
fi
EOF

sudo chmod +x /usr/local/bin/monitor-educore.sh

# Setup monitoring cron job
echo "*/5 * * * * /usr/local/bin/monitor-educore.sh" | crontab -

print_header "Setup Complete!"
print_status "EduCore Ultra VPS setup is complete!"
print_status "Next steps:"
echo "1. Copy your project files to $APP_DIR"
echo "2. Update the environment variables in env.production"
echo "3. Run: sudo /usr/local/bin/setup-ssl.sh yourdomain.com your@email.com"
echo "4. Start the application: sudo systemctl start educore-ultra"
echo ""
print_warning "Important: Update all passwords and secrets in env.production before deploying!"
print_warning "Make sure to configure your domain DNS to point to this server!"

echo ""
print_status "Setup completed successfully! 🎉"
