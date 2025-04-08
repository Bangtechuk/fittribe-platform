const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, TrainerProfile } = require('../models');

// Sample data for users
const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@fittribe.fitness',
    password: 'password123',
    role: 'admin',
    isVerified: true
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'client',
    isVerified: true
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'trainer',
    isVerified: true
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike@example.com',
    password: 'password123',
    role: 'trainer',
    isVerified: true
  },
  {
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'client',
    isVerified: true
  }
];

// Sample data for trainer profiles
const trainerProfiles = [
  {
    bio: 'Certified personal trainer with 5+ years of experience specializing in strength training and weight loss. I help clients achieve their fitness goals through personalized workout plans and nutrition guidance.',
    specializations: ['Strength Training', 'Weight Loss', 'Nutrition'],
    experience: 5,
    hourlyRate: 50,
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '17:00' }
    ],
    certifications: [
      {
        name: 'Certified Personal Trainer',
        issuingOrganization: 'National Academy of Sports Medicine',
        issueDate: '2018-05-15'
      },
      {
        name: 'Nutrition Coach',
        issuingOrganization: 'Precision Nutrition',
        issueDate: '2019-03-10'
      }
    ],
    rating: 4.8,
    reviewCount: 24,
    isVerified: true
  },
  {
    bio: 'Yoga instructor and wellness coach with a focus on mindfulness and holistic health. I specialize in vinyasa flow, meditation, and helping clients reduce stress through movement and breathwork.',
    specializations: ['Yoga', 'Meditation', 'Stress Reduction'],
    experience: 7,
    hourlyRate: 45,
    availability: [
      { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '16:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00' }
    ],
    certifications: [
      {
        name: '200-Hour Yoga Teacher Training',
        issuingOrganization: 'Yoga Alliance',
        issueDate: '2016-08-20'
      },
      {
        name: 'Meditation Instructor',
        issuingOrganization: 'Mindful Living Institute',
        issueDate: '2017-11-05'
      }
    ],
    rating: 4.9,
    reviewCount: 31,
    isVerified: true
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fittribe', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Connect to the database
    const conn = await connectDB();
    
    // Clear existing data
    await User.deleteMany();
    await TrainerProfile.deleteMany();
    console.log('Data cleared');

    // Create users with hashed passwords
    const createdUsers = [];
    for (const user of users) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      // Create user
      const createdUser = await User.create({
        ...user,
        password: hashedPassword
      });
      
      createdUsers.push(createdUser);
      console.log(`Created user: ${createdUser.email}`);
    }

    // Create trainer profiles
    const trainers = createdUsers.filter(user => user.role === 'trainer');
    for (let i = 0; i < trainers.length && i < trainerProfiles.length; i++) {
      const trainerProfile = await TrainerProfile.create({
        ...trainerProfiles[i],
        user: trainers[i]._id
      });
      console.log(`Created trainer profile for: ${trainers[i].email}`);
    }

    console.log('Data seeded successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the seed function
seedData();
