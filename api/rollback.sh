#!/bin/bash

# KejaYangu Payment System Rollback Script
# This script handles rollback procedures for payment system issues

set -e

echo "🔄 Starting KejaYangu Payment System Rollback..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ROLLBACK_VERSIONS_DIR="./rollback-versions"
MAX_ROLLBACK_VERSIONS=5

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
    echo -e "${BLUE}[ROLLBACK]${NC} $1"
}

# Create rollback versions directory
setup_rollback_dir() {
    if [[ ! -d "$ROLLBACK_VERSIONS_DIR" ]]; then
        mkdir -p "$ROLLBACK_VERSIONS_DIR"
        print_status "Created rollback versions directory: $ROLLBACK_VERSIONS_DIR"
    fi
}

# Backup current deployment
backup_current_deployment() {
    print_info "Creating backup of current deployment..."

    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="$ROLLBACK_VERSIONS_DIR/backup_$timestamp"

    mkdir -p "$backup_dir"

    # Backup source code
    if [[ -d "src" ]]; then
        cp -r src "$backup_dir/"
    fi

    # Backup package files
    if [[ -f "package.json" ]]; then
        cp package*.json "$backup_dir/" 2>/dev/null || true
    fi

    # Backup environment file (without sensitive data)
    if [[ -f ".env" ]]; then
        grep -v -E "(SECRET|KEY|PASSWORD|TOKEN)" .env > "$backup_dir/.env.backup" 2>/dev/null || true
    fi

    # Backup Docker image info
    if command -v docker &> /dev/null; then
        docker images kejayangu/api --format "table {{.Repository}}:{{.Tag}} {{.ID}} {{.CreatedAt}}" > "$backup_dir/docker_images.txt" 2>/dev/null || true
    fi

    print_status "Current deployment backed up to: $backup_dir"

    # Clean old backups
    local backup_count=$(ls -1d "$ROLLBACK_VERSIONS_DIR"/backup_* 2>/dev/null | wc -l)
    if [[ $backup_count -gt $MAX_ROLLBACK_VERSIONS ]]; then
        local oldest_backup=$(ls -1d "$ROLLBACK_VERSIONS_DIR"/backup_* 2>/dev/null | head -n 1)
        rm -rf "$oldest_backup"
        print_status "Cleaned up old backup: $oldest_backup"
    fi

    echo "$backup_dir"
}

# Rollback database
rollback_database() {
    print_info "Rolling back database..."

    if [[ -z "$1" ]]; then
        print_error "No backup timestamp provided for database rollback"
        return 1
    fi

    local backup_timestamp="$1"
    local backup_file="$ROLLBACK_VERSIONS_DIR/backup_$backup_timestamp/database_backup.sql"

    if [[ ! -f "$backup_file" ]]; then
        print_error "Database backup file not found: $backup_file"
        return 1
    fi

    print_warning "This will restore the database from backup. All recent changes will be lost."
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_status "Database rollback cancelled"
        return 0
    fi

    # Restore database
    if command -v psql &> /dev/null; then
        PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d kejayangu < "$backup_file"
        print_status "Database restored from backup"
    else
        print_error "psql command not found. Please install PostgreSQL client tools."
        return 1
    fi
}

# Rollback application code
rollback_application() {
    print_info "Rolling back application code..."

    if [[ -z "$1" ]]; then
        print_error "No backup directory provided for application rollback"
        return 1
    fi

    local backup_dir="$1"

    if [[ ! -d "$backup_dir" ]]; then
        print_error "Backup directory not found: $backup_dir"
        return 1
    fi

    # Restore source code
    if [[ -d "$backup_dir/src" ]]; then
        rm -rf src
        cp -r "$backup_dir/src" .
        print_status "Application code restored"
    fi

    # Restore package files
    if [[ -f "$backup_dir/package.json" ]]; then
        cp "$backup_dir/package.json" .
        cp "$backup_dir/package-lock.json" . 2>/dev/null || true
        print_status "Package files restored"
    fi

    # Reinstall dependencies
    if [[ -f "package.json" ]]; then
        npm ci
        print_status "Dependencies reinstalled"
    fi

    # Rebuild application
    if [[ -f "package.json" ]]; then
        npm run build 2>/dev/null || true
        print_status "Application rebuilt"
    fi
}

# Rollback Docker deployment
rollback_docker() {
    print_info "Rolling back Docker deployment..."

    if [[ -z "$1" ]]; then
        print_error "No backup timestamp provided for Docker rollback"
        return 1
    fi

    local backup_timestamp="$1"
    local backup_dir="$ROLLBACK_VERSIONS_DIR/backup_$backup_timestamp"

    # Stop current containers
    docker-compose down

    # Try to find previous image
    local previous_image=""
    if [[ -f "$backup_dir/docker_images.txt" ]]; then
        previous_image=$(grep "kejayangu/api" "$backup_dir/docker_images.txt" | head -n 2 | tail -n 1 | awk '{print $1}')
    fi

    if [[ -n "$previous_image" ]] && docker image inspect "$previous_image" &>/dev/null; then
        print_status "Rolling back to previous Docker image: $previous_image"

        # Tag the previous image as latest
        docker tag "$previous_image" kejayangu/api:latest

        # Restart containers
        docker-compose up -d --build
        print_status "Docker containers rolled back and restarted"
    else
        print_warning "No previous Docker image found. Rebuilding from source..."

        # Rebuild from source
        docker-compose build --no-cache
        docker-compose up -d
        print_status "Docker containers rebuilt and restarted"
    fi
}

# Rollback PM2 deployment
rollback_pm2() {
    print_info "Rolling back PM2 deployment..."

    if command -v pm2 &> /dev/null; then
        # Stop current application
        pm2 stop kejayangu-api || true

        # Try to rollback to previous version
        pm2 rollback kejayangu-api || {
            print_warning "PM2 rollback failed. Please check PM2 logs."
            return 1
        }

        print_status "PM2 application rolled back"
    else
        print_error "PM2 not found"
        return 1
    fi
}

# Health check after rollback
health_check_after_rollback() {
    print_info "Performing health check after rollback..."

    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
            print_status "Health check passed after rollback"
            return 0
        fi

        print_status "Health check attempt $attempt/$max_attempts failed. Waiting..."
        sleep 10
        ((attempt++))
    done

    print_error "Health check failed after rollback. Manual intervention required."
    return 1
}

# Emergency stop
emergency_stop() {
    print_error "Emergency stop initiated!"

    # Stop all services
    docker-compose down 2>/dev/null || true
    pm2 stop all 2>/dev/null || true

    print_error "All services stopped. Manual restart required."
}

# List available rollback points
list_rollback_points() {
    print_info "Available rollback points:"

    if [[ ! -d "$ROLLBACK_VERSIONS_DIR" ]]; then
        print_warning "No rollback points found"
        return
    fi

    local count=0
    for backup_dir in "$ROLLBACK_VERSIONS_DIR"/backup_*; do
        if [[ -d "$backup_dir" ]]; then
            local timestamp=$(basename "$backup_dir" | sed 's/backup_//')
            echo "  $timestamp - $backup_dir"
            ((count++))
        fi
    done

    if [[ $count -eq 0 ]]; then
        print_warning "No rollback points found"
    fi
}

# Main rollback function
main() {
    local rollback_type="${1:-full}"
    local target_version="$2"
    local deployment_method="${3:-docker}"

    print_info "Rollback type: $rollback_type"
    print_info "Target version: ${target_version:-latest}"
    print_info "Deployment method: $deployment_method"

    setup_rollback_dir

    case $rollback_type in
        "list")
            list_rollback_points
            exit 0
            ;;
        "backup")
            backup_current_deployment > /dev/null
            print_status "Backup completed"
            exit 0
            ;;
        "emergency-stop")
            emergency_stop
            exit 0
            ;;
    esac

    # Determine rollback target
    if [[ -z "$target_version" ]]; then
        # Find latest backup
        local latest_backup=$(ls -1d "$ROLLBACK_VERSIONS_DIR"/backup_* 2>/dev/null | sort | tail -n 1)
        if [[ -z "$latest_backup" ]]; then
            print_error "No rollback points available"
            exit 1
        fi
        target_version=$(basename "$latest_backup" | sed 's/backup_//')
        print_info "Using latest backup: $target_version"
    fi

    local backup_dir="$ROLLBACK_VERSIONS_DIR/backup_$target_version"

    if [[ ! -d "$backup_dir" ]]; then
        print_error "Rollback point not found: $backup_dir"
        exit 1
    fi

    print_warning "This will rollback the system to version: $target_version"
    print_warning "All changes made after this point will be lost."
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_status "Rollback cancelled"
        exit 0
    fi

    case $rollback_type in
        "full")
            case $deployment_method in
                "docker")
                    rollback_docker "$target_version"
                    ;;
                "pm2")
                    rollback_pm2
                    ;;
                *)
                    print_error "Invalid deployment method. Use 'docker' or 'pm2'"
                    exit 1
                    ;;
            esac
            rollback_application "$backup_dir"
            ;;
        "database")
            rollback_database "$target_version"
            ;;
        "application")
            rollback_application "$backup_dir"
            case $deployment_method in
                "docker")
                    rollback_docker "$target_version"
                    ;;
                "pm2")
                    rollback_pm2
                    ;;
            esac
            ;;
        *)
            print_error "Invalid rollback type. Use 'full', 'database', 'application', 'list', 'backup', or 'emergency-stop'"
            exit 1
            ;;
    esac

    # Health check
    if health_check_after_rollback; then
        print_status "🎉 Rollback completed successfully!"
        print_status "System is running at http://localhost:5000"
    else
        print_error "Rollback completed but health check failed. Please check the system manually."
    fi
}

# Handle command line arguments
case "${1:-help}" in
    "full"|"database"|"application"|"list"|"backup"|"emergency-stop")
        main "$@"
        ;;
    *)
        echo "Usage: $0 <rollback-type> [target-version] [deployment-method]"
        echo ""
        echo "Rollback Types:"
        echo "  full           - Complete rollback (application + deployment)"
        echo "  database       - Database only rollback"
        echo "  application    - Application code only rollback"
        echo "  list           - List available rollback points"
        echo "  backup         - Create backup of current deployment"
        echo "  emergency-stop - Emergency stop all services"
        echo ""
        echo "Deployment Methods:"
        echo "  docker - Docker Compose deployment (default)"
        echo "  pm2    - PM2 deployment"
        echo ""
        echo "Examples:"
        echo "  $0 full                    # Full rollback to latest backup"
        echo "  $0 full 20231201_120000   # Full rollback to specific version"
        echo "  $0 database               # Database rollback only"
        echo "  $0 application pm2        # Application rollback for PM2 deployment"
        echo "  $0 list                   # List available rollback points"
        exit 1
        ;;
esac