# Firebase Firestore Schema for FitTribe.fitness

This document outlines the Firestore collections and document structure for the real-time functionality of FitTribe.fitness.

## Collections

### users
Stores user account information.

```
users/{userId}
{
  uid: string,                // Firebase Auth UID
  email: string,              // User email
  displayName: string,        // User display name
  photoURL: string,           // Profile photo URL
  role: string,               // 'client', 'trainer', or 'admin'
  createdAt: timestamp,       // Account creation date
  lastLogin: timestamp,       // Last login date
  isActive: boolean,          // Account status
  stripeCustomerId: string,   // Stripe customer ID for payments
  notificationSettings: {     // Notification preferences
    email: boolean,
    push: boolean,
    sms: boolean
  }
}
```

### client_profiles
Extended information for client users.

```
client_profiles/{userId}
{
  userId: string,             // Reference to users collection
  bio: string,                // Short biography
  fitnessGoals: array,        // List of fitness goals
  preferredTrainingTypes: array, // Preferred training types
  location: string,           // General location
  timezone: string,           // User's timezone
  createdAt: timestamp,       // Profile creation date
  updatedAt: timestamp        // Profile update date
}
```

### trainer_profiles
Extended information for trainer users.

```
trainer_profiles/{userId}
{
  userId: string,             // Reference to users collection
  bio: string,                // Professional biography
  specializations: array,     // Areas of expertise
  certifications: array,      // Professional certifications
  experience: number,         // Years of experience
  hourlyRate: number,         // Base hourly rate
  location: string,           // Service location
  timezone: string,           // Trainer's timezone
  isVerified: boolean,        // Verification status
  averageRating: number,      // Average rating (1-5)
  reviewCount: number,        // Number of reviews
  isAvailableOnline: boolean, // Available for online sessions
  isAvailableInPerson: boolean, // Available for in-person sessions
  createdAt: timestamp,       // Profile creation date
  updatedAt: timestamp        // Profile update date
}
```

### availability
Stores trainer availability slots.

```
availability/{availabilityId}
{
  trainerId: string,          // Reference to trainer
  date: timestamp,            // Date of availability
  startTime: timestamp,       // Start time of slot
  endTime: timestamp,         // End time of slot
  isBooked: boolean,          // Whether slot is booked
  bookingId: string,          // Reference to booking if booked
  createdAt: timestamp,       // When availability was added
  updatedAt: timestamp        // When availability was updated
}
```

### bookings
Stores session bookings.

```
bookings/{bookingId}
{
  clientId: string,           // Reference to client
  trainerId: string,          // Reference to trainer
  serviceId: string,          // Reference to service type
  startTime: timestamp,       // Session start time
  endTime: timestamp,         // Session end time
  status: string,             // 'pending', 'confirmed', 'completed', 'cancelled'
  paymentId: string,          // Reference to payment
  zoomMeetingId: string,      // Zoom meeting ID
  zoomJoinUrl: string,        // Zoom join URL
  zoomStartUrl: string,       // Zoom start URL (for trainer)
  notes: string,              // Session notes
  cancellationReason: string, // Reason if cancelled
  createdAt: timestamp,       // Booking creation date
  updatedAt: timestamp        // Booking update date
}
```

### services
Stores trainer service offerings.

```
services/{serviceId}
{
  trainerId: string,          // Reference to trainer
  name: string,               // Service name
  description: string,        // Service description
  duration: number,           // Duration in minutes
  price: number,              // Price in cents
  isOnline: boolean,          // Available online
  isInPerson: boolean,        // Available in person
  maxParticipants: number,    // Max participants (1 for 1:1)
  createdAt: timestamp,       // Service creation date
  updatedAt: timestamp        // Service update date
}
```

### packages
Stores trainer package offerings.

```
packages/{packageId}
{
  trainerId: string,          // Reference to trainer
  name: string,               // Package name
  description: string,        // Package description
  sessionCount: number,       // Number of sessions
  serviceId: string,          // Reference to service type
  price: number,              // Package price in cents
  discountPercentage: number, // Discount compared to individual sessions
  validityDays: number,       // Validity period in days
  createdAt: timestamp,       // Package creation date
  updatedAt: timestamp        // Package update date
}
```

### client_packages
Stores client purchased packages.

```
client_packages/{clientPackageId}
{
  clientId: string,           // Reference to client
  trainerId: string,          // Reference to trainer
  packageId: string,          // Reference to package
  sessionsTotal: number,      // Total sessions in package
  sessionsRemaining: number,  // Remaining sessions
  expiryDate: timestamp,      // Expiry date
  paymentId: string,          // Reference to payment
  createdAt: timestamp,       // Purchase date
  updatedAt: timestamp        // Last update date
}
```

### payments
Stores payment information.

```
payments/{paymentId}
{
  clientId: string,           // Reference to client
  trainerId: string,          // Reference to trainer
  bookingId: string,          // Reference to booking (optional)
  packageId: string,          // Reference to package (optional)
  amount: number,             // Amount in cents
  currency: string,           // Currency code
  status: string,             // 'pending', 'completed', 'failed', 'refunded', 'cancelled'
  paymentMethod: string,      // Payment method used
  stripePaymentIntentId: string, // Stripe payment intent ID
  payoutStatus: string,       // 'pending', 'processed'
  payoutDate: timestamp,      // When payout was processed
  metadata: object,           // Additional payment data
  createdAt: timestamp,       // Payment creation date
  completedAt: timestamp,     // Payment completion date
  refundedAt: timestamp       // Refund date if applicable
}
```

### reviews
Stores client reviews of trainers.

```
reviews/{reviewId}
{
  clientId: string,           // Reference to client
  trainerId: string,          // Reference to trainer
  bookingId: string,          // Reference to booking
  rating: number,             // Rating (1-5)
  comment: string,            // Review text
  isPublic: boolean,          // Whether review is public
  trainerResponse: string,    // Trainer's response
  createdAt: timestamp,       // Review creation date
  updatedAt: timestamp        // Review update date
}
```

### notifications
Stores user notifications.

```
notifications/{notificationId}
{
  userId: string,             // Reference to user
  title: string,              // Notification title
  message: string,            // Notification message
  type: string,               // 'booking', 'payment', 'review', 'system'
  read: boolean,              // Whether notification is read
  bookingId: string,          // Reference to booking (optional)
  paymentId: string,          // Reference to payment (optional)
  reviewId: string,           // Reference to review (optional)
  createdAt: timestamp        // Notification creation date
}
```

### trainer_verifications
Stores trainer verification requests.

```
trainer_verifications/{verificationId}
{
  trainerId: string,          // Reference to trainer
  documents: array,           // Array of document URLs
  certifications: array,      // Array of certification details
  status: string,             // 'pending', 'approved', 'rejected'
  rejectionReason: string,    // Reason if rejected
  reviewedBy: string,         // Admin who reviewed
  reviewedAt: timestamp,      // Review date
  createdAt: timestamp,       // Request creation date
  updatedAt: timestamp        // Request update date
}
```

### analytics
Stores aggregated analytics data.

```
analytics/dashboard
{
  totalUsers: number,         // Total user count
  totalTrainers: number,      // Total trainer count
  totalClients: number,       // Total client count
  totalBookings: number,      // Total booking count
  totalRevenue: number,       // Total revenue
  activeUsers: number,        // Active users in last 30 days
  conversionRate: number,     // Registration to booking conversion
  averageSessionPrice: number, // Average session price
  dailyStats: array,          // Daily statistics
  updatedAt: timestamp        // Last update time
}
```

## Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isTrainer() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'trainer';
    }
    
    function isClient() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'client';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    match /client_profiles/{userId} {
      allow read: if isAuthenticated();
      allow create, update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    match /trainer_profiles/{userId} {
      allow read: if isAuthenticated();
      allow create, update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Availability
    match /availability/{availabilityId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isTrainer() && 
        resource.data.trainerId == request.auth.uid || isAdmin();
    }
    
    // Bookings
    match /bookings/{bookingId} {
      allow read: if isAuthenticated() && 
        (resource.data.clientId == request.auth.uid || 
         resource.data.trainerId == request.auth.uid || 
         isAdmin());
      allow create: if isClient();
      allow update: if isAuthenticated() && 
        (resource.data.clientId == request.auth.uid || 
         resource.data.trainerId == request.auth.uid || 
         isAdmin());
      allow delete: if isAdmin();
    }
    
    // Services and packages
    match /services/{serviceId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isTrainer() && 
        resource.data.trainerId == request.auth.uid || isAdmin();
    }
    
    match /packages/{packageId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isTrainer() && 
        resource.data.trainerId == request.auth.uid || isAdmin();
    }
    
    match /client_packages/{clientPackageId} {
      allow read: if isAuthenticated() && 
        (resource.data.clientId == request.auth.uid || 
         resource.data.trainerId == request.auth.uid || 
         isAdmin());
      allow create: if isClient();
      allow update: if isTrainer() && 
        resource.data.trainerId == request.auth.uid || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Payments
    match /payments/{paymentId} {
      allow read: if isAuthenticated() && 
        (resource.data.clientId == request.auth.uid || 
         resource.data.trainerId == request.auth.uid || 
         isAdmin());
      allow create: if isClient();
      allow update: if isAdmin();
      allow delete: if false; // Payments should never be deleted
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if isAuthenticated();
      allow create: if isClient() && 
        request.resource.data.clientId == request.auth.uid;
      allow update: if isAuthenticated() && 
        ((isClient() && resource.data.clientId == request.auth.uid) || 
         (isTrainer() && resource.data.trainerId == request.auth.uid && 
          request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['trainerResponse'])) || 
         isAdmin());
      allow delete: if isAdmin();
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Trainer verifications
    match /trainer_verifications/{verificationId} {
      allow read: if isAuthenticated() && 
        (resource.data.trainerId == request.auth.uid || isAdmin());
      allow create: if isTrainer() && 
        request.resource.data.trainerId == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Analytics
    match /analytics/{document=**} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

## Indexes

The following composite indexes will be needed:

1. `trainer_profiles` collection:
   - Fields: `isActive` (ascending), `specializations` (array-contains), `averageRating` (descending)
   - Purpose: Filtering active trainers by specialization and sorting by rating

2. `availability` collection:
   - Fields: `trainerId` (ascending), `date` (ascending), `isBooked` (ascending)
   - Purpose: Finding available slots for a specific trainer

3. `bookings` collection:
   - Fields: `clientId` (ascending), `startTime` (ascending)
   - Purpose: Finding upcoming bookings for a client
   
4. `bookings` collection:
   - Fields: `trainerId` (ascending), `startTime` (ascending)
   - Purpose: Finding upcoming bookings for a trainer

5. `payments` collection:
   - Fields: `trainerId` (ascending), `status` (ascending), `payoutStatus` (ascending)
   - Purpose: Finding completed payments pending payout for a trainer

6. `reviews` collection:
   - Fields: `trainerId` (ascending), `isPublic` (ascending), `createdAt` (descending)
   - Purpose: Finding public reviews for a trainer sorted by date
