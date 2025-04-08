# FitTribe.fitness Deployment Configuration

## 1. Deployment Architecture

### Frontend (Next.js)
- Hosting: Vercel
- Domain: fittribe.fitness
- Environment Variables:
  - NEXT_PUBLIC_API_URL
  - NEXT_PUBLIC_STRIPE_PUBLIC_KEY
  - NEXT_PUBLIC_ZOOM_SDK_KEY

### Backend (Node.js/Express)
- Hosting: AWS EC2
- Load Balancer: AWS ELB
- Environment Variables:
  - NODE_ENV=production
  - PORT=8080
  - DATABASE_URL
  - JWT_SECRET
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - ZOOM_API_KEY
  - ZOOM_API_SECRET
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - EMAIL_SERVICE
  - EMAIL_USER
  - EMAIL_PASSWORD

### Database
- PostgreSQL: AWS RDS
- Backup Schedule: Daily
- Retention Period: 30 days

## 2. CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: FitTribe CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16.x'
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      - name: Run tests
        run: |
          cd backend
          npm test

  deploy-backend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USERNAME }}
          key: ${{ secrets.EC2_PRIVATE_KEY }}
          script: |
            cd /var/www/fittribe
            git pull
            cd backend
            npm ci
            pm2 restart fittribe-api

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 3. Production Server Setup

### EC2 Instance Configuration
- Instance Type: t3.medium
- OS: Ubuntu 20.04 LTS
- Security Groups:
  - Allow HTTP (80)
  - Allow HTTPS (443)
  - Allow SSH (22) from specific IPs

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.fittribe.fitness;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL Configuration
- Provider: Let's Encrypt
- Auto-renewal: Yes
- Redirect HTTP to HTTPS: Yes

### Process Management
- Tool: PM2
- Startup Script: pm2 start src/server.js --name fittribe-api
- Auto-restart: Yes
- Logs: /var/log/fittribe

## 4. Monitoring and Logging

### Application Monitoring
- Service: AWS CloudWatch
- Metrics:
  - CPU Usage
  - Memory Usage
  - Request Count
  - Error Rate
  - Response Time

### Error Tracking
- Service: Sentry
- Alert Thresholds:
  - Critical: Immediate notification
  - Error: Daily digest
  - Warning: Weekly summary

### Performance Monitoring
- Service: New Relic
- Transaction Tracing: Enabled
- Slow Query Detection: Enabled

## 5. Backup Strategy

### Database Backups
- Automated RDS Snapshots: Daily
- Manual Backups: Weekly
- Backup Testing: Monthly

### Application Backups
- Code Repository: GitHub
- Environment Variables: AWS Secrets Manager
- User Uploads: S3 with versioning enabled

## 6. Scaling Strategy

### Horizontal Scaling
- Auto Scaling Group for EC2 instances
- Min Instances: 2
- Max Instances: 10
- Scale Up: CPU > 70% for 5 minutes
- Scale Down: CPU < 30% for 10 minutes

### Database Scaling
- Read Replicas: 1 (initially)
- Connection Pooling: Enabled
- Max Connections: 200

## 7. Disaster Recovery

### Recovery Point Objective (RPO)
- Database: 24 hours
- User Data: 1 hour

### Recovery Time Objective (RTO)
- Critical Services: 1 hour
- Non-critical Services: 4 hours

### Failover Strategy
- Multi-AZ Deployment for RDS
- Backup Region: us-west-2 (if primary is us-east-1)
