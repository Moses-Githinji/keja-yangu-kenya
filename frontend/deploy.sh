#!/bin/bash

# KejaYangu Frontend Deployment Script
# This script handles deployment of the frontend to production

set -e

echo "🚀 Starting KejaYangu Frontend deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOCKER_IMAGE="kejayangu/frontend:latest"

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

# Build the application
build_app() {
    print_status "Building frontend application..."

    if [[ -f "package.json" ]]; then
        npm ci
        npm run build
        print_status "Frontend build completed successfully"
    else
        print_error "package.json not found"
        exit 1
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

# Deploy to Docker
deploy_docker() {
    print_status "Deploying to Docker..."

    # Stop existing container
    docker stop kejayangu-frontend 2>/dev/null || true
    docker rm kejayangu-frontend 2>/dev/null || true

    # Run new container
    docker run -d \
        --name kejayangu-frontend \
        --restart unless-stopped \
        -p 3000:80 \
        --network kejayangu-network \
        "$DOCKER_IMAGE"

    print_status "Frontend deployed successfully"
}

# Deploy to static hosting (alternative)
deploy_static() {
    print_status "Deploying to static hosting..."

    local deploy_dir="${1:-/var/www/html}"

    if [[ -d "dist" ]]; then
        sudo cp -r dist/* "$deploy_dir/"
        print_status "Frontend deployed to $deploy_dir"
    else
        print_error "dist directory not found. Run build first."
        exit 1
    fi
}

# Health check
health_check() {
    print_status "Performing health check..."

    local max_attempts=10
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
            print_status "Health check passed"
            return 0
        fi

        print_status "Health check attempt $attempt/$max_attempts failed. Retrying in 5 seconds..."
        sleep 5
        ((attempt++))
    done

    print_error "Health check failed after $max_attempts attempts"
    return 1
}

# Rollback function
rollback() {
    print_error "Deployment failed. Initiating rollback..."

    # Stop failed container
    docker stop kejayangu-frontend 2>/dev/null || true
    docker rm kejayangu-frontend 2>/dev/null || true

    # Start previous version if available
    if docker images | grep -q "kejayangu/frontend.*<none>"; then
        local previous_image=$(docker images --format "table {{.Repository}}:{{.Tag}}" | grep "kejayangu/frontend" | sed -n '2p')
        if [[ -n "$previous_image" ]]; then
            print_status "Rolling back to previous image: $previous_image"
            docker run -d \
                --name kejayangu-frontend \
                --restart unless-stopped \
                -p 3000:80 \
                --network kejayangu-network \
                "$previous_image"
        fi
    fi

    print_error "Rollback completed. Please check the logs for more details."
    exit 1
}

# Main deployment function
main() {
    local deploy_method="${1:-docker}"

    print_status "Deployment method: $deploy_method"

    case $deploy_method in
        "docker")
            build_app
            build_image
            deploy_docker
            ;;
        "static")
            build_app
            deploy_static "$2"
            ;;
        *)
            print_error "Invalid deployment method. Use 'docker' or 'static'"
            exit 1
            ;;
    esac

    # Health check
    if health_check; then
        print_status "🎉 Frontend deployment successful!"
        print_status "Frontend is running at http://localhost:3000"
        print_status "Health check: http://localhost:3000/health"
    else
        rollback
    fi
}

# Handle command line arguments
case "${1:-docker}" in
    "docker")
        main "docker"
        ;;
    "static")
        if [[ -z "$2" ]]; then
            print_error "Static deployment requires a target directory"
            echo "Usage: $0 static /path/to/web/root"
            exit 1
        fi
        main "static" "$2"
        ;;
    "rollback")
        rollback
        ;;
    *)
        echo "Usage: $0 [docker|static <directory>|rollback]"
        echo "  docker: Deploy using Docker (default)"
        echo "  static <directory>: Deploy to static web server"
        echo "  rollback: Rollback to previous deployment"
        exit 1
        ;;
esac