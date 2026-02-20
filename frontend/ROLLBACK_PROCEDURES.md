# KejaYangu Payment System Rollback Procedures

This document outlines the rollback procedures for the KejaYangu payment system in case of deployment failures or critical issues.

## Table of Contents

1. [Automated Rollback](#automated-rollback)
2. [Manual Rollback Procedures](#manual-rollback-procedures)
3. [Emergency Procedures](#emergency-procedures)
4. [Post-Rollback Verification](#post-rollback-verification)
5. [Best Practices](#best-practices)

## Automated Rollback

The system includes automated rollback scripts for quick recovery from deployment issues.

### Using the Rollback Script

```bash
# Navigate to the API directory
cd api

# Full rollback to latest backup
./rollback.sh full

# Rollback to specific version
./rollback.sh full 20231201_120000

# Database only rollback
./rollback.sh database

# Application only rollback
./rollback.sh application

# List available rollback points
./rollback.sh list

# Create backup of current deployment
./rollback.sh backup

# Emergency stop all services
./rollback.sh emergency-stop
```

### Rollback Script Options

- **Deployment Methods**: `docker` (default), `pm2`
- **Rollback Types**:
  - `full`: Complete rollback (application + deployment)
  - `database`: Database only
  - `application`: Application code only
  - `list`: List available rollback points
  - `backup`: Create backup
  - `emergency-stop`: Stop all services

## Manual Rollback Procedures

### Docker Deployment Rollback

1. **Stop current containers**:

   ```bash
   cd api
   docker-compose down
   ```

2. **Restore from backup**:

   ```bash
   # Find backup directory
   ls -la rollback-versions/

   # Restore application code
   cp -r rollback-versions/backup_20231201_120000/src ./src
   cp rollback-versions/backup_20231201_120000/package*.json ./

   # Reinstall dependencies
   npm ci
   ```

3. **Restore Docker image** (if available):

   ```bash
   # Check available images
   docker images kejayangu/api

   # Tag previous image as latest
   docker tag kejayangu/api:previous kejayangu/api:latest
   ```

4. **Restart services**:
   ```bash
   docker-compose up -d --build
   ```

### PM2 Deployment Rollback

1. **Stop current application**:

   ```bash
   pm2 stop kejayangu-api
   ```

2. **Rollback using PM2**:

   ```bash
   pm2 rollback kejayangu-api
   ```

3. **If PM2 rollback fails, manual restore**:

   ```bash
   # Restore source code
   cp -r rollback-versions/backup_20231201_120000/src ./src

   # Reinstall and restart
   npm ci
   pm2 restart kejayangu-api
   ```

### Database Rollback

1. **Create current backup** (if not already done):

   ```bash
   pg_dump -h localhost -U kejayangu_user -d kejayangu > emergency_backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Restore from backup**:

   ```bash
   PGPASSWORD=your_password psql -h localhost -U kejayangu_user -d kejayangu < rollback-versions/backup_20231201_120000/database_backup.sql
   ```

3. **Verify database integrity**:
   ```bash
   # Check table counts
   psql -h localhost -U kejayangu_user -d kejayangu -c "SELECT schemaname, tablename, n_tup_ins as inserts FROM pg_stat_user_tables ORDER BY n_tup_ins DESC LIMIT 10;"
   ```

## Emergency Procedures

### Critical Payment System Failure

1. **Immediate Actions**:

   - Stop accepting new payments
   - Alert all stakeholders
   - Switch to maintenance mode

2. **Emergency Stop**:

   ```bash
   cd api
   ./rollback.sh emergency-stop
   ```

3. **Assess Damage**:

   - Check logs for error patterns
   - Verify database integrity
   - Test payment endpoints manually

4. **Execute Rollback**:

   - Use automated rollback if possible
   - Follow manual procedures if automated fails

5. **Gradual Recovery**:
   - Start with read-only mode
   - Enable payment processing gradually
   - Monitor closely for 24 hours

### Data Corruption Recovery

1. **Isolate corrupted data**:

   ```sql
   -- Create backup of corrupted records
   CREATE TABLE corrupted_payments_backup AS
   SELECT * FROM payments WHERE created_at >= '2023-12-01';
   ```

2. **Restore clean backup**:

   ```bash
   ./rollback.sh database 20231201_000000
   ```

3. **Manually restore good data**:
   ```sql
   -- Restore non-corrupted records
   INSERT INTO payments (SELECT * FROM clean_payments_backup WHERE id NOT IN (SELECT id FROM corrupted_payments_backup));
   ```

## Post-Rollback Verification

### Health Checks

1. **API Health**:

   ```bash
   curl http://localhost:5000/health
   curl http://localhost:5000/health/detailed
   curl http://localhost:5000/health/payments
   ```

2. **Database Health**:

   ```bash
   # Check connection
   psql -h localhost -U kejayangu_user -d kejayangu -c "SELECT version();"

   # Verify key tables
   psql -h localhost -U kejayangu_user -d kejayangu -c "SELECT COUNT(*) FROM payments;"
   ```

3. **Payment Gateway Status**:
   - Verify M-Pesa STK Push works
   - Test Stripe payment flow
   - Check Flutterwave integration

### Functional Testing

1. **Payment Flow Testing**:

   - Create test payment
   - Verify callback processing
   - Check database updates

2. **Performance Testing**:

   - Load test payment endpoints
   - Monitor response times
   - Check memory usage

3. **Security Testing**:
   - Verify rate limiting
   - Test authentication
   - Check security headers

### Monitoring Verification

1. **Grafana Dashboards**:

   - Check payment success rates
   - Verify response time metrics
   - Monitor error rates

2. **Alert Manager**:
   - Ensure alerts are working
   - Test notification channels
   - Verify alert thresholds

## Best Practices

### Prevention

1. **Regular Backups**:

   - Automate daily database backups
   - Keep multiple rollback points
   - Test backup restoration regularly

2. **Staged Deployments**:

   - Use blue-green deployment
   - Implement canary releases
   - Test in staging environment first

3. **Monitoring**:
   - Set up comprehensive monitoring
   - Configure appropriate alert thresholds
   - Regularly review monitoring data

### During Issues

1. **Communication**:

   - Inform stakeholders immediately
   - Provide regular updates
   - Document all actions taken

2. **Decision Making**:

   - Assess impact vs. rollback cost
   - Consider partial rollbacks
   - Have rollback plan ready

3. **Documentation**:
   - Log all actions taken
   - Document root cause
   - Update procedures based on lessons learned

### After Resolution

1. **Analysis**:

   - Conduct post-mortem
   - Identify improvement areas
   - Update monitoring/alerts if needed

2. **Testing**:

   - Test rollback procedures
   - Verify monitoring works
   - Update test cases

3. **Communication**:
   - Inform stakeholders of resolution
   - Provide incident report
   - Share lessons learned

## Contact Information

- **DevOps Team**: devops@kejayangu.com
- **Security Team**: security@kejayangu.com
- **Management**: management@kejayangu.com

## Version History

- v1.0 - Initial rollback procedures
- v1.1 - Added automated rollback scripts
- v1.2 - Enhanced monitoring integration
