# FitTribe Full-Stack Deployment Guide

This guide provides detailed instructions for deploying the complete FitTribe platform (both frontend and backend) to production environments.

## Deployment Options

There are several options for deploying the FitTribe platform:

### Option 1: Render.com (Recommended)

Render.com provides an excellent platform for deploying both the frontend and backend components of FitTribe with minimal configuration.

#### Backend Deployment on Render

1. Create a Render account at https://render.com
2. From your dashboard, click "New" and select "Web Service"
3. Connect your GitHub repository or use the "Manual Deploy" option
4. Configure the service:
   - Name: `fittribe-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Choose the appropriate plan (Starter is good for beginning)

5. Add all environment variables from your `.env` file
6. Click "Create Web Service"

#### Frontend Deployment on Render

1. From your Render dashboard, click "New" and select "Static Site"
2. Connect your GitHub repository or use the "Manual Deploy" option
3. Configure the service:
   - Name: `fittribe-frontend`
   - Build Command: `npm install && npm run build && npm run export`
   - Publish Directory: `out`

4. Add all environment variables from your `.env.local` file
5. Click "Create Static Site"

### Option 2: Vercel + MongoDB Atlas

This option uses Vercel for the frontend and a combination of Vercel Serverless Functions and MongoDB Atlas for the backend.

#### Frontend Deployment on Vercel

1. Create a Vercel account at https://vercel.com
2. Install the Vercel CLI: `npm i -g vercel`
3. Navigate to your frontend directory and run: `vercel`
4. Follow the prompts to deploy your project
5. Configure environment variables in the Vercel dashboard

#### Backend Deployment with Vercel Serverless Functions

1. Modify your backend to work with serverless functions
2. Create an `api` directory in your frontend project
3. Move your backend routes to serverless functions
4. Deploy with the frontend using Vercel

### Option 3: AWS Amplify + AWS Lambda + MongoDB Atlas

For more advanced scaling and enterprise needs:

1. Set up AWS Amplify for the frontend
2. Use AWS Lambda for backend functions
3. Connect to MongoDB Atlas for the database
4. Configure API Gateway to route requests

## Database Setup (MongoDB Atlas)

Regardless of which deployment option you choose, MongoDB Atlas is recommended for the database:

1. Create an account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is available)
3. Set up database access (username/password)
4. Configure network access (IP whitelist)
5. Get your connection string
6. Update your backend environment variables with this connection string

## Domain Configuration

To use a custom domain (e.g., fittribe.fitness):

1. Purchase a domain from a domain registrar (Namecheap, GoDaddy, etc.)
2. Configure DNS settings to point to your deployment
3. Set up SSL certificates (most platforms handle this automatically)

## Continuous Deployment

For automatic deployments when you push code:

1. Connect your GitHub repository to your deployment platform
2. Configure build settings
3. Set up branch deployments (e.g., main branch for production, develop for staging)

## Monitoring and Maintenance

Once deployed:

1. Set up monitoring tools (e.g., Sentry for error tracking)
2. Configure logging
3. Set up regular database backups
4. Implement a CI/CD pipeline for testing before deployment

## Security Considerations

Ensure your production deployment is secure:

1. Use environment variables for all secrets
2. Implement proper authentication and authorization
3. Set up rate limiting
4. Configure CORS correctly
5. Use HTTPS for all communications
6. Regularly update dependencies

## Scaling Strategies

As your user base grows:

1. Implement caching strategies
2. Consider using a CDN for static assets
3. Scale your database with sharding or replica sets
4. Implement load balancing for the backend
5. Consider containerization with Docker and Kubernetes for advanced scaling

## Deployment Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] Authentication working
- [ ] Payment processing tested
- [ ] Email notifications configured
- [ ] Error handling implemented
- [ ] Performance optimized
- [ ] Security measures in place
- [ ] Backup strategy implemented
- [ ] Monitoring set up
