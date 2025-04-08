# FitTribe.fitness API Endpoints

## Authentication Endpoints

### `/api/auth`
- `POST /register` - Register a new user (client or trainer)
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user information
- `PUT /me` - Update current user information
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /verify-email` - Verify user email

## User Management Endpoints

### `/api/users`
- `GET /` - Admin only: List all users (with filtering)
- `GET /:id` - Get user by ID
- `PUT /:id` - Admin only: Update user
- `DELETE /:id` - Admin only: Delete user
- `POST /:id/role` - Admin only: Change user role

## Trainer Profile Endpoints

### `/api/trainers`
- `GET /` - List all trainers (with filtering and search)
- `GET /:id` - Get trainer profile by ID
- `POST /` - Create trainer profile (for trainer role)
- `PUT /:id` - Update trainer profile
- `DELETE /:id` - Delete trainer profile
- `GET /:id/reviews` - Get reviews for a trainer
- `GET /:id/availability` - Get trainer availability
- `PUT /:id/availability` - Update trainer availability
- `GET /:id/services` - Get trainer services
- `POST /:id/services` - Add trainer service
- `PUT /:id/services/:serviceId` - Update trainer service
- `DELETE /:id/services/:serviceId` - Delete trainer service
- `POST /:id/certifications` - Add certification
- `DELETE /:id/certifications/:certId` - Delete certification

## Booking Endpoints

### `/api/bookings`
- `GET /` - Get user's bookings (client: booked sessions, trainer: received bookings)
- `POST /` - Create a new booking
- `GET /:id` - Get booking details
- `PUT /:id` - Update booking details
- `DELETE /:id` - Cancel booking
- `POST /:id/confirm` - Trainer confirms booking
- `POST /:id/decline` - Trainer declines booking
- `POST /:id/reschedule` - Reschedule booking
- `POST /:id/complete` - Mark booking as completed
- `POST /:id/no-show` - Mark client as no-show

## Payment Endpoints

### `/api/payments`
- `POST /create-payment-intent` - Create Stripe payment intent
- `POST /confirm-payment` - Confirm payment
- `GET /history` - Get payment history
- `GET /:id` - Get payment details
- `POST /refund/:id` - Process refund

### `/api/payouts` (Trainer & Admin)
- `GET /` - Get payout history
- `POST /request` - Request payout
- `GET /:id` - Get payout details

## Session Endpoints

### `/api/sessions`
- `GET /` - Get upcoming sessions
- `GET /:id` - Get session details
- `POST /:id/zoom` - Create Zoom meeting for session
- `GET /:id/zoom` - Get Zoom meeting details
- `PUT /:id/notes` - Update session notes
- `GET /history` - Get past sessions

## Review Endpoints

### `/api/reviews`
- `GET /` - Get reviews (for trainer or by client)
- `POST /` - Create a review
- `GET /:id` - Get review details
- `PUT /:id` - Update review
- `DELETE /:id` - Delete review
- `POST /:id/report` - Report inappropriate review

## Admin Dashboard Endpoints

### `/api/admin`
- `GET /stats` - Get platform statistics
- `GET /users/pending` - Get pending trainer verifications
- `POST /users/:id/verify` - Verify trainer
- `GET /reports` - Get reported content
- `POST /reports/:id/resolve` - Resolve report
- `GET /transactions` - Get all transactions
- `GET /payouts/pending` - Get pending payouts
- `POST /payouts/:id/process` - Process payout
- `GET /settings` - Get platform settings
- `PUT /settings` - Update platform settings

## Incentive System Endpoints

### `/api/incentives`
- `GET /points` - Get user's loyalty points
- `GET /badges` - Get user's badges
- `POST /referral` - Create referral code
- `GET /referral` - Get user's referral statistics
- `POST /redeem` - Redeem points for rewards

## Notification Endpoints

### `/api/notifications`
- `GET /` - Get user notifications
- `PUT /:id/read` - Mark notification as read
- `PUT /read-all` - Mark all notifications as read
- `GET /settings` - Get notification settings
- `PUT /settings` - Update notification settings

## Search Endpoints

### `/api/search`
- `GET /trainers` - Search trainers with filters
- `GET /services` - Search services with filters
