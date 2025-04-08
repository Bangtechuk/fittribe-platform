# FitTribe.fitness - Real-Time Fitness Trainer Marketplace

FitTribe.fitness is a comprehensive fitness trainer marketplace platform that connects clients with professional trainers for virtual and in-person sessions. The platform features real-time booking, Zoom integration, secure payments, and an intuitive admin dashboard.

## Features

- **Real-Time Trainer Profiles**: Browse and search trainers with live availability updates
- **Dynamic Booking System**: Book sessions with instant confirmation and Zoom integration
- **Secure Payments**: Process payments with Stripe, including escrow functionality
- **User Dashboards**: Personalized dashboards for clients, trainers, and administrators
- **Instant Notifications**: Real-time alerts for bookings, payments, and platform updates
- **Admin Controls**: Comprehensive admin dashboard with user management and analytics

## Tech Stack

- **Frontend**: React.js + Next.js with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (for persistent data) + Firebase Firestore (for real-time data)
- **Authentication**: Firebase Auth
- **Real-Time Updates**: Firebase Realtime Database
- **File Storage**: Firebase Storage
- **Payment Processing**: Stripe
- **Video Conferencing**: Zoom API
- **Deployment**: Vercel (frontend) + AWS (backend)

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- Firebase account
- Stripe account
- Zoom Developer account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fittribe-fitness.git
cd fittribe-fitness
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
   - Create `.env.local` in the frontend directory
   - Create `.env` in the backend directory
   - Add the required environment variables (see `.env.example` files)

4. Start the development servers:
```bash
# Start frontend
cd frontend
npm run dev

# Start backend
cd ../backend
npm run dev
```

## Demo Environment

To quickly test the platform with sample data:

1. Navigate to `/admin/demo-setup` after logging in as an admin
2. Click "Seed Database" to create sample users, trainers, and bookings
3. Use the provided demo credentials to test different user roles:
   - Admin: admin@fittribe.fitness / Admin123!
   - Client: demo@example.com / Demo123!
   - Trainer: alex.fitness@example.com / Password123!

## Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Connect your Vercel account to your GitHub repository
3. Configure environment variables in Vercel
4. Deploy with `vercel --prod`

### Backend Deployment (AWS)

1. Set up an EC2 instance
2. Install Node.js and PM2
3. Clone the repository
4. Set up environment variables
5. Start the server with PM2

## Documentation

For detailed documentation, please refer to the following:

- [API Documentation](./docs/api_endpoints.md)
- [Database Schema](./docs/database_schema.md)
- [Third-Party Integrations](./docs/third_party_integrations.md)
- [Deployment Guide](./docs/vercel_deployment_guide.md)

## Real-Time Features

The platform leverages Firebase for real-time functionality:

- **Live Trainer Availability**: See immediately when slots are booked
- **Instant Booking Confirmations**: Get immediate feedback on booking requests
- **Real-Time Notifications**: Receive alerts for important events
- **Live Dashboard Updates**: View real-time analytics and platform activity
- **Dynamic Reviews**: See new reviews appear instantly

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React.js](https://reactjs.org/)
- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Stripe](https://stripe.com/)
- [Zoom API](https://marketplace.zoom.us/docs/api-reference/introduction/)
