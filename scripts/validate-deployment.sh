#!/bin/bash

# EduCore Ultra Deployment Validation Script
# This script validates the production deployment

set -e

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

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Configuration
DOMAIN=${1:-"localhost"}
PROTOCOL=${2:-"http"}
BASE_URL="${PROTOCOL}://${DOMAIN}"

print_status "Starting deployment validation for: $BASE_URL"

# Function to check HTTP response
check_http_response() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3
    
    print_info "Checking: $description"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        print_status "✓ $description - Status: $response"
        return 0
    else
        print_error "✗ $description - Expected: $expected_status, Got: $response"
        return 1
    fi
}

# Function to check service health
check_service_health() {
    local service_name=$1
    local health_url=$2
    
    print_info "Checking $service_name health..."
    
    if curl -s "$health_url" | grep -q "healthy"; then
        print_status "✓ $service_name is healthy"
        return 0
    else
        print_error "✗ $service_name is not healthy"
        return 1
    fi
}

# Function to check database connectivity
check_database() {
    print_info "Checking database connectivity..."
    
    if docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U educore_user -d educore_ultra_prod; then
        print_status "✓ Database is accessible"
        return 0
    else
        print_error "✗ Database is not accessible"
        return 1
    fi
}

# Function to check Redis connectivity
check_redis() {
    print_info "Checking Redis connectivity..."
    
    if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping | grep -q "PONG"; then
        print_status "✓ Redis is accessible"
        return 0
    else
        print_error "✗ Redis is not accessible"
        return 1
    fi
}

# Function to check SSL certificate
check_ssl_certificate() {
    if [ "$PROTOCOL" = "https" ]; then
        print_info "Checking SSL certificate..."
        
        cert_info=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            print_status "✓ SSL certificate is valid"
            echo "$cert_info"
            return 0
        else
            print_error "✗ SSL certificate is invalid or not found"
            return 1
        fi
    else
        print_info "Skipping SSL check (HTTP mode)"
        return 0
    fi
}

# Function to check environment variables
check_environment() {
    print_info "Checking environment configuration..."
    
    local errors=0
    
    # Check if env.prod exists
    if [ ! -f "env.prod" ]; then
        print_error "✗ env.prod file not found"
        errors=$((errors + 1))
    else
        print_status "✓ env.prod file exists"
    fi
    
    # Check for placeholder values
    if grep -q "CHANGE_ME" env.prod; then
        print_warning "⚠ Found placeholder values in env.prod"
        errors=$((errors + 1))
    else
        print_status "✓ No placeholder values found in env.prod"
    fi
    
    return $errors
}

# Function to check Docker services
check_docker_services() {
    print_info "Checking Docker services..."
    
    local services=("db" "redis" "backend" "frontend" "nginx" "celery_worker" "celery_beat")
    local errors=0
    
    for service in "${services[@]}"; do
        if docker-compose -f docker-compose.prod.yml ps "$service" | grep -q "Up"; then
            print_status "✓ $service is running"
        else
            print_error "✗ $service is not running"
            errors=$((errors + 1))
        fi
    done
    
    return $errors
}

# Function to check file permissions
check_file_permissions() {
    print_info "Checking file permissions..."
    
    local errors=0
    
    # Check SSL certificate permissions
    if [ -f "nginx/ssl/key.pem" ]; then
        perms=$(stat -c "%a" nginx/ssl/key.pem 2>/dev/null || echo "000")
        if [ "$perms" = "600" ]; then
            print_status "✓ SSL private key has correct permissions (600)"
        else
            print_error "✗ SSL private key has incorrect permissions ($perms), should be 600"
            errors=$((errors + 1))
        fi
    fi
    
    # Check env.prod permissions
    if [ -f "env.prod" ]; then
        perms=$(stat -c "%a" env.prod 2>/dev/null || echo "000")
        if [ "$perms" = "600" ]; then
            print_status "✓ env.prod has correct permissions (600)"
        else
            print_warning "⚠ env.prod has permissions $perms, should be 600"
        fi
    fi
    
    return $errors
}

# Function to run performance tests
run_performance_tests() {
    print_info "Running performance tests..."
    
    local errors=0
    
    # Test API response time
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/health/" || echo "999")
    
    if (( $(echo "$response_time < 2.0" | bc -l) )); then
        print_status "✓ API response time: ${response_time}s"
    else
        print_warning "⚠ API response time is slow: ${response_time}s"
        errors=$((errors + 1))
    fi
    
    # Test frontend response time
    frontend_time=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/" || echo "999")
    
    if (( $(echo "$frontend_time < 3.0" | bc -l) )); then
        print_status "✓ Frontend response time: ${frontend_time}s"
    else
        print_warning "⚠ Frontend response time is slow: ${frontend_time}s"
        errors=$((errors + 1))
    fi
    
    return $errors
}

# Function to check security headers
check_security_headers() {
    print_info "Checking security headers..."
    
    local errors=0
    local headers=("X-Frame-Options" "X-Content-Type-Options" "X-XSS-Protection" "Strict-Transport-Security")
    
    for header in "${headers[@]}"; do
        if curl -s -I "$BASE_URL/" | grep -qi "$header"; then
            print_status "✓ $header is present"
        else
            print_warning "⚠ $header is missing"
            errors=$((errors + 1))
        fi
    done
    
    return $errors
}

# Main validation function
main() {
    local total_errors=0
    
    print_status "Starting comprehensive deployment validation..."
    echo
    
    # Environment checks
    print_info "=== Environment Validation ==="
    check_environment
    total_errors=$((total_errors + $?))
    echo
    
    # Docker services
    print_info "=== Docker Services Validation ==="
    check_docker_services
    total_errors=$((total_errors + $?))
    echo
    
    # Database and Redis
    print_info "=== Database & Cache Validation ==="
    check_database
    total_errors=$((total_errors + $?))
    check_redis
    total_errors=$((total_errors + $?))
    echo
    
    # HTTP endpoints
    print_info "=== HTTP Endpoints Validation ==="
    check_http_response "$BASE_URL/health" 200 "Health endpoint"
    check_http_response "$BASE_URL/api/health/" 200 "API health endpoint"
    check_http_response "$BASE_URL/" 200 "Frontend homepage"
    check_http_response "$BASE_URL/admin/" 302 "Admin interface (redirect)"
    echo
    
    # Service health
    print_info "=== Service Health Validation ==="
    check_service_health "Backend" "$BASE_URL/api/health/"
    check_service_health "Frontend" "$BASE_URL/health"
    echo
    
    # SSL certificate (if HTTPS)
    print_info "=== SSL Certificate Validation ==="
    check_ssl_certificate
    total_errors=$((total_errors + $?))
    echo
    
    # Security headers
    print_info "=== Security Headers Validation ==="
    check_security_headers
    total_errors=$((total_errors + $?))
    echo
    
    # File permissions
    print_info "=== File Permissions Validation ==="
    check_file_permissions
    total_errors=$((total_errors + $?))
    echo
    
    # Performance tests
    print_info "=== Performance Validation ==="
    run_performance_tests
    total_errors=$((total_errors + $?))
    echo
    
    # Summary
    print_info "=== Validation Summary ==="
    if [ $total_errors -eq 0 ]; then
        print_status "🎉 All validations passed! Deployment is ready for production."
        exit 0
    else
        print_error "❌ $total_errors validation(s) failed. Please fix the issues before going live."
        exit 1
    fi
}

# Parse command line arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "EduCore Ultra Deployment Validation Script"
        echo
        echo "Usage:"
        echo "  $0 [domain] [protocol]"
        echo
        echo "Examples:"
        echo "  $0 localhost http"
        echo "  $0 educore.example.com https"
        echo "  $0 192.168.1.100 http"
        echo
        echo "Default: localhost http"
        ;;
    *)
        main
        ;;
esac
