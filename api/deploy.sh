#!/bin/bash

# KejaYangu API Deployment Script
# This script handles deployment of the backend API to production

set -e

echo "🚀 Starting KejaYangu API deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="kejayangu-api"
DOCKER_IMAGE="kejayangu/api:latest"
DOCKER_COMPOSE_FILE="docker-compose.yml"

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

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."

    required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "DB_USER"
        "DB_PASSWORD"
    )

    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_error "Missing required environment variables:"
        printf '  %s\n' "${missing_vars[@]}"
        print_error "Please set these variables in your environment or .env file"
        exit 1
    fi

    print_status "Environment variables check passed"
}

# Backup current database
backup_database() {
    print_status "Creating database backup..."

    if command -v pg_dump &> /dev/null; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="backup_${TIMESTAMP}.sql"

        pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null || {
            print_warning "Database backup failed. Continuing with deployment..."
            return 1
        }

        print_status "Database backup created: $BACKUP_FILE"
    else
        print_warning "pg_dump not found. Skipping database backup."
    fi
}

# Build Docker image
build_image() {
    print_status "Building Docker image..."

    if [[ -f "Dockerfile" ]]; then
        docker build -t "$DOCKER_IMAGE" . --no-cache
        print_status "Docker image built successfully"
    else
        print_error "Dockerfile not found"
        exit 1
    fi
}

# Deploy with Docker Compose
deploy_with_compose() {
    print_status "Deploying with Docker Compose..."

    if [[ -f "$DOCKER_COMPOSE_FILE" ]]; then
        # Stop existing containers
        docker-compose -f "$DOCKER_COMPOSE_FILE" down || true

        # Start new containers
        docker-compose -f "$DOCKER_COMPOSE_FILE" up -d --build

        print_status "Deployment completed successfully"
    else
        print_error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        exit 1
    fi
}

# Deploy with PM2 (alternative method)
deploy_with_pm2() {
    print_status "Deploying with PM2..."

    if command -v pm2 &> /dev/null; then
        # Install dependencies if needed
        if [[ ! -d "node_modules" ]]; then
            npm ci --production
        fi

        # Generate Prisma client
        npx prisma generate

        # Run database migrations
        npx prisma migrate deploy

        # Start/restart with PM2
        if pm2 describe "$APP_NAME" &> /dev/null; then
            pm2 restart "$APP_NAME"
        else
            pm2 start ecosystem.config.js --env production
        fi

        print_status "PM2 deployment completed"
    else
        print_error "PM2 not found. Please install PM2 globally: npm install -g pm2"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."

    if [[ -f "$DOCKER_COMPOSE_FILE" ]]; then
        # Wait for database to be ready
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T db sh -c 'while ! pg_isready -U $POSTGRES_USER -d $POSTGRES_DB; do sleep 1; done'

        # Run migrations
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T api npx prisma migrate deploy
    else
        npx prisma migrate deploy
    fi

    print_status "Database migrations completed"
}

# Health check
health_check() {
    print_status "Performing health check..."

    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
            print_status "Health check passed"
            return 0
        fi

        print_status "Health check attempt $attempt/$max_attempts failed. Retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done

    print_error "Health check failed after $max_attempts attempts"
    return 1
}

# Rollback function
rollback() {
    print_error "Deployment failed. Initiating rollback..."

    if [[ -f "$DOCKER_COMPOSE_FILE" ]]; then
        docker-compose -f "$DOCKER_COMPOSE_FILE" down
        # You could implement more sophisticated rollback logic here
        # For example, restoring from backup or rolling back to previous image
    fi

    print_error "Rollback completed. Please check the logs for more details."
    exit 1
}

# Main deployment function
main() {
    local deploy_method="${1:-compose}"

    print_status "Deployment method: $deploy_method"

    # Pre-deployment checks
    check_env_vars

    # Backup
    backup_database || print_warning "Backup failed, but continuing..."

    case $deploy_method in
        "compose")
            build_image
            deploy_with_compose
            run_migrations
            ;;
        "pm2")
            deploy_with_pm2
            ;;
        *)
            print_error "Invalid deployment method. Use 'compose' or 'pm2'"
            exit 1
            ;;
    esac

    # Health check
    if health_check; then
        print_status "🎉 Deployment successful!"
        print_status "API is running at http://localhost:5000"
        print_status "Health check: http://localhost:5000/health"
    else
        rollback
    fi
}

# Handle command line arguments
case "${1:-compose}" in
    "compose"|"pm2")
        main "$1"
        ;;
    "rollback")
        rollback
        ;;
    *)
        echo "Usage: $0 [compose|pm2|rollback]"
        echo "  compose: Deploy using Docker Compose (default)"
        echo "  pm2: Deploy using PM2"
        echo "  rollback: Rollback to previous deployment"
        exit 1
        ;;
esac