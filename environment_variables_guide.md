# Environment Variables Guide for FitTribe.fitness

This document provides instructions on how to set up the environment variables for both the backend and frontend of the FitTribe platform.

## Backend Environment Variables (.env)

The backend requires the following environment variables to be set in the `/backend/.env` file:

### Core Configuration
- `PORT`: The port on which the backend server will run (default: 5000)
- `NODE_ENV`: The environment mode (development, production, test)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRE`: JWT token expiration time

### Stripe Configuration
- `STRIPE_SECRET_KEY`: Your Stripe secret key for payment processing
- `STRIPE_WEBHOOK_SECRET`: Secret for verifying Stripe webhook events

### Zoom API Configuration
- `ZOOM_API_KEY`: Your Zoom API key for video session integration
- `ZOOM_API_SECRET`: Your Zoom API secret
- `ZOOM_REDIRECT_URL`: Redirect URL for Zoom OAuth

### Email Configuration (SendGrid)
- `SENDGRID_API_KEY`: Your SendGrid API key for email notifications
- `EMAIL_FROM`: The email address from which notifications will be sent

### Google Calendar API
- `GOOGLE_CLIENT_ID`: Your Google Client ID for calendar integration
- `GOOGLE_CLIENT_SECRET`: Your Google Client Secret
- `GOOGLE_REDIRECT_URL`: Redirect URL for Google OAuth

### CORS Configuration
- `CLIENT_URL`: The URL of your frontend application for CORS

## Frontend Environment Variables (.env.local)

The frontend requires the following environment variables to be set in the `/frontend/.env.local` file:

### API Configuration
- `NEXT_PUBLIC_API_URL`: The URL of your backend API

### Firebase Configuration
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase app ID

### Stripe Configuration
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

### Google Maps API
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key for location services

## How to Obtain API Keys

### Stripe
1. Create an account at [stripe.com](https://stripe.com)
2. Navigate to the Developers > API keys section
3. Use the publishable key for the frontend and the secret key for the backend

### Zoom
1. Create a developer account at [marketplace.zoom.us](https://marketplace.zoom.us)
2. Create a new OAuth app
3. Configure the app and obtain the API key and secret

### SendGrid
1. Create an account at [sendgrid.com](https://sendgrid.com)
2. Navigate to Settings > API Keys
3. Create a new API key with appropriate permissions

### Google (Calendar & Maps)
1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Google Calendar API and Google Maps API
4. Create OAuth credentials for Calendar
5. Create API key for Maps

### Firebase
1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Add a web app to your project
4. Copy the configuration values provided

## Development vs Production

For development:
- Use localhost URLs for redirects
- Use test mode for Stripe
- Use development credentials for Firebase

For production:
- Update all URLs to your production domain
- Use production API keys
- Ensure all secrets are securely stored and not committed to version control

## Security Notes

- Never commit your .env or .env.local files to version control
- Use environment variables in production deployment platforms
- Rotate API keys periodically for enhanced security
