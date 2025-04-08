# MongoDB Database Setup Guide for FitTribe.fitness

This guide explains how to set up and initialize the MongoDB database for the FitTribe platform.

## Prerequisites

- MongoDB installed locally or a MongoDB Atlas account
- Node.js and npm installed

## Database Configuration

The FitTribe platform uses MongoDB as its database, with Mongoose as the ODM (Object Data Modeling) library. The database connection is configured in the following files:

- `/backend/src/index.js` - Contains the main database connection logic
- `/backend/src/config/db.js` - Contains a reusable database connection function

## Environment Variables

The database connection requires the following environment variable to be set in your `.env` file:

```
MONGO_URI=mongodb://localhost:27017/fittribe
```

For production, you should use a MongoDB Atlas connection string:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/fittribe?retryWrites=true&w=majority
```

## Database Models

The FitTribe platform uses the following data models:

1. **User** - Stores user information including authentication details
2. **TrainerProfile** - Stores trainer-specific information linked to user accounts
3. **Booking** - Stores session booking information
4. **Payment** - Stores payment transaction records
5. **Review** - Stores client reviews for trainers

These models are defined in the `/backend/src/models` directory.

## Seeding the Database

To populate the database with initial test data, we've provided a seed script at `/backend/src/utils/seedData.js`. This script creates:

- Sample users (admin, clients, and trainers)
- Sample trainer profiles with specializations, certifications, and availability

### Running the Seed Script

To run the seed script:

```bash
cd /path/to/FitTribe/backend
node src/utils/seedData.js
```

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

## Database Backup and Restore

### Creating a Backup

To create a backup of your MongoDB database:

```bash
mongodump --uri="mongodb://localhost:27017/fittribe" --out=/path/to/backup/directory
```

### Restoring from Backup

To restore your MongoDB database from a backup:

```bash
mongorestore --uri="mongodb://localhost:27017/fittribe" /path/to/backup/directory
```

## Troubleshooting

If you encounter connection issues:

1. Verify MongoDB is running locally or your Atlas cluster is accessible
2. Check that your MONGO_URI environment variable is correctly set
3. Ensure network connectivity to your MongoDB instance
4. Check for any authentication issues in your connection string

For more detailed MongoDB troubleshooting, refer to the [MongoDB documentation](https://docs.mongodb.com/manual/troubleshooting/).
