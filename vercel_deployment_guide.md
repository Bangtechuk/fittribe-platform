# Vercel Deployment Configuration for FitTribe.fitness

This document outlines the steps to deploy the FitTribe.fitness platform to Vercel with a CI/CD pipeline.

## Prerequisites

- A Vercel account
- A GitHub repository for the project
- Environment variables configured in Vercel

## Frontend Deployment

1. Create a `vercel.json` file in the frontend directory with the following configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url",
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@next_public_firebase_api_key",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "@next_public_firebase_auth_domain",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "@next_public_firebase_project_id",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": "@next_public_firebase_storage_bucket",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "@next_public_firebase_messaging_sender_id",
    "NEXT_PUBLIC_FIREBASE_APP_ID": "@next_public_firebase_app_id",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@next_public_stripe_publishable_key"
  }
}
```

2. Update the `package.json` file with the following scripts:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest"
}
```

3. Create a `.env.production` file with production environment variables (this file should not be committed to the repository).

## Backend Deployment

For the backend, we'll use a separate deployment on a service like AWS, Heroku, or Digital Ocean. The frontend will communicate with the backend API through the configured API URL.

## CI/CD Pipeline

1. Create a GitHub Actions workflow file at `.github/workflows/ci-cd.yml` with the following configuration:

```yaml
name: CI/CD Pipeline

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
          cd frontend
          npm ci
      - name: Run tests
        run: |
          cd frontend
          npm test

  deploy:
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
          working-directory: ./frontend
          vercel-args: '--prod'
```

2. Configure the following secrets in your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

## Environment Variables

Configure the following environment variables in Vercel:

- `NEXT_PUBLIC_API_URL`: URL of your backend API
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase app ID
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

## Deployment Process

1. Push your code to the main branch of your GitHub repository
2. GitHub Actions will automatically run tests
3. If tests pass, the code will be deployed to Vercel
4. Vercel will build and deploy the application
5. The application will be available at your Vercel domain (e.g., fittribe-fitness.vercel.app)

## Custom Domain

To use a custom domain (fittribe.fitness):

1. Add the domain in Vercel dashboard
2. Configure DNS settings as instructed by Vercel
3. Verify domain ownership
4. Wait for DNS propagation (can take up to 48 hours)

## Monitoring and Logging

1. Use Vercel Analytics for frontend monitoring
2. Configure Firebase Performance Monitoring for real-time performance tracking
3. Set up Firebase Crashlytics for error reporting

## Rollback Procedure

If issues are detected after deployment:

1. Go to the Vercel dashboard
2. Navigate to the Deployments tab
3. Find the last stable deployment
4. Click the three dots menu and select "Promote to Production"
