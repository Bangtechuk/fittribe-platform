# FitTribe Platform Setup and Deployment Guide

This guide provides comprehensive instructions for setting up, running, and deploying the FitTribe fitness trainer marketplace platform.

## Project Overview

FitTribe is a full-stack application that connects clients with fitness trainers. The platform includes:

- User authentication and authorization
- Trainer profiles and discovery
- Booking and scheduling system
- Payment processing with Stripe
- Video sessions via Zoom integration
- Reviews and ratings
- Admin dashboard

## Project Structure

- `/frontend` - Next.js frontend application with TypeScript and Tailwind CSS
- `/backend` - Node.js/Express backend API
- `/docs` - Project documentation
- `/static_demo` - Static HTML demo version

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- MongoDB (local installation or MongoDB Atlas account)
- Git (optional, for version control)

### Backend Setup

1. Install backend dependencies:
```bash
cd /path/to/FitTribe/backend
npm install
```

2. Configure environment variables:
```bash
# Copy the example .env file
cp .env.example .env
# Edit .env with your configuration
```

3. Start the backend server:
```bash
npm run dev
```

The backend server will run on http://localhost:5000.

### Frontend Setup

1. Install frontend dependencies:
```bash
cd /path/to/FitTribe/frontend
npm install
```

2. Configure environment variables:
```bash
# Copy the example .env.local file
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000.

### Database Setup

1. Ensure MongoDB is running locally or you have a MongoDB Atlas connection string
2. Update the MONGO_URI in your backend .env file
3. Seed the database with initial data:
```bash
cd /path/to/FitTribe/backend
node src/utils/seedData.js
```

## Testing the Platform

### Default Test Accounts

The seed script creates the following test accounts:

1. **Admin User**
   - Email: admin@fittribe.fitness
   - Password: password123

2. **Client Users**
   - Email: john@example.com
   - Password: password123
   - Email: sarah@example.com
   - Password: password123

3. **Trainer Users**
   - Email: jane@example.com
   - Password: password123
   - Email: mike@example.com
   - Password: password123

### Key Features to Test

1. **Authentication**
   - Register a new account
   - Log in with existing credentials
   - Access protected routes

2. **Trainer Discovery**
   - Browse trainer listings
   - Filter trainers by specialization
   - View trainer profiles

3. **Booking System**
   - Book a session with a trainer
   - View upcoming and past bookings
   - Cancel a booking

4. **Payments**
   - Process a payment for a booking
   - View payment history

5. **Reviews**
   - Leave a review for a trainer
   - View trainer reviews

6. **Admin Dashboard**
   - Verify trainers
   - Manage users and bookings

## Deployment Options

### Static Demo Deployment

For the static HTML demo version:

1. **GitHub Pages**
   - Create a GitHub repository
   - Push the static_demo directory contents
   - Enable GitHub Pages in repository settings

2. **Netlify**
   - Create a Netlify account
   - Drag and drop the static_demo directory
   - Configure custom domain (optional)

3. **Vercel**
   - Create a Vercel account
   - Import the project from GitHub
   - Configure deployment settings

### Full Platform Deployment

For the complete React/Node.js application:

1. **Backend Deployment (Heroku)**
   - Create a Heroku account
   - Create a new Heroku app
   - Connect to GitHub repository
   - Configure environment variables
   - Deploy the backend

2. **Frontend Deployment (Vercel)**
   - Create a Vercel account
   - Import the frontend directory
   - Configure environment variables
   - Deploy the frontend

3. **Database Deployment (MongoDB Atlas)**
   - Create a MongoDB Atlas account
   - Set up a new cluster
   - Configure database access
   - Connect your application

## Additional Resources

- [Environment Variables Guide](./docs/environment_variables_guide.md)
- [Database Setup Guide](./docs/database_setup_guide.md)
- [Git Initialization Guide](./git_initialization_guide.md)
- [Deployment Guide](./deployment_guide.md)

## Troubleshooting

If you encounter issues:

1. Check that all environment variables are correctly set
2. Ensure MongoDB is running and accessible
3. Verify that all dependencies are installed
4. Check server logs for specific error messages
5. Make sure both frontend and backend servers are running

## Next Steps for Development

1. Implement real third-party integrations (Stripe, Zoom)
2. Add comprehensive testing
3. Enhance security features
4. Optimize for performance
5. Add mobile responsiveness improvements

## Support

For additional help or questions, please refer to the documentation in the `/docs` directory or create an issue in the GitHub repository.
