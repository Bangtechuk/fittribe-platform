# FitTribe Deployment Guide for Render.com

This guide provides step-by-step instructions for deploying the FitTribe platform to Render.com for permanent hosting.

## Prerequisites

- A Render.com account (sign up at https://render.com)
- A MongoDB Atlas account for the production database (sign up at https://www.mongodb.com/cloud/atlas)
- Your FitTribe codebase with frontend and backend

## Step 1: Set Up MongoDB Atlas Database

1. Log in to MongoDB Atlas
2. Create a new project (if needed)
3. Build a new cluster (the free tier is sufficient for starting)
4. Once the cluster is created, click "Connect"
5. Choose "Connect your application"
6. Select Node.js as the driver and copy the connection string
7. Create a database user with read/write permissions
8. Replace `<password>` in the connection string with your database user's password
9. Save this connection string for later use

## Step 2: Deploy the Backend to Render.com

1. Log in to your Render.com account
2. Click "New" and select "Web Service"
3. Connect your GitHub repository or use the "Upload" option
4. Configure the service:
   - Name: `fittribe-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Choose the appropriate plan (Starter is good for beginning)

5. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render assigns this automatically)
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string for JWT token generation
   - `JWT_EXPIRE`: `30d`
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
   - `ZOOM_API_KEY`: Your Zoom API key
   - `ZOOM_API_SECRET`: Your Zoom API secret
   - `ZOOM_REDIRECT_URL`: `https://fittribe-frontend.onrender.com/api/zoom/callback`
   - `SENDGRID_API_KEY`: Your SendGrid API key
   - `EMAIL_FROM`: `noreply@fittribe.fitness`
   - `GOOGLE_CLIENT_ID`: Your Google Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google Client Secret
   - `GOOGLE_REDIRECT_URL`: `https://fittribe-frontend.onrender.com/api/calendar/callback`
   - `CLIENT_URL`: `https://fittribe-frontend.onrender.com`

6. Click "Create Web Service"
7. Wait for the deployment to complete (this may take a few minutes)
8. Note the URL of your backend service (e.g., `https://fittribe-backend.onrender.com`)

## Step 3: Deploy the Frontend to Render.com

1. In your Render.com dashboard, click "New" and select "Static Site"
2. Connect your GitHub repository or use the "Upload" option
3. Configure the service:
   - Name: `fittribe-frontend`
   - Build Command: `npm install && npm run build && npm run export`
   - Publish Directory: `out`

4. Add the following environment variables:
   - `NEXT_PUBLIC_API_URL`: The URL of your backend service (from Step 2)
   - `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
   - `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase app ID
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

5. Click "Create Static Site"
6. Wait for the deployment to complete
7. Note the URL of your frontend service (e.g., `https://fittribe-frontend.onrender.com`)

## Step 4: Update Frontend Configuration for Production

Before deploying, make sure to update the Next.js configuration to support static exports:

1. In your frontend directory, modify `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

2. Add an export script to `package.json`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "export": "next export",
  "start": "next start",
  "lint": "next lint"
}
```

## Step 5: Seed the Production Database

After deploying the backend, you may want to seed the production database:

1. Update the `seedData.js` script to use the production MongoDB URI
2. Run the script locally:
```bash
NODE_ENV=production MONGO_URI=your_production_mongo_uri node src/utils/seedData.js
```

## Step 6: Configure Custom Domain (Optional)

To use a custom domain (e.g., fittribe.fitness):

1. Purchase a domain from a domain registrar (e.g., Namecheap, GoDaddy)
2. In your Render.com dashboard, select your service
3. Go to the "Settings" tab
4. Scroll down to "Custom Domain"
5. Click "Add Custom Domain"
6. Follow the instructions to configure DNS settings

## Step 7: Verify Deployment

1. Visit your frontend URL (e.g., `https://fittribe-frontend.onrender.com`)
2. Test user authentication by logging in with a test account
3. Verify that the frontend can communicate with the backend
4. Test key features like trainer listings, bookings, and payments

## Troubleshooting

If you encounter issues:

1. Check Render.com logs for both services
2. Verify that all environment variables are correctly set
3. Ensure the MongoDB connection string is correct
4. Check that the frontend is correctly configured to communicate with the backend
5. Verify CORS settings in the backend to allow requests from the frontend domain

## Maintenance

- Monitor your Render.com dashboard for service health
- Set up alerts for service outages
- Regularly backup your MongoDB database
- Update dependencies periodically for security patches

## Scaling

As your user base grows:

1. Upgrade your Render.com plans for more resources
2. Scale your MongoDB Atlas cluster
3. Implement caching strategies
4. Consider adding a CDN for static assets

## Security Considerations

- Ensure all API keys and secrets are stored as environment variables
- Set up proper authentication and authorization
- Implement rate limiting to prevent abuse
- Configure proper CORS settings
- Use HTTPS for all communications
- Regularly update dependencies for security patches
