import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sample trainer data
const trainers = [
  {
    email: 'alex.fitness@example.com',
    password: 'Password123!',
    displayName: 'Alex Johnson',
    role: 'trainer',
    profile: {
      bio: 'Certified personal trainer with 8+ years of experience specializing in HIIT and strength training. My approach focuses on functional movements that improve everyday life.',
      specialties: ['HIIT', 'Strength Training', 'Weight Loss'],
      certifications: ['NASM Certified Personal Trainer', 'ACE Fitness Nutrition Specialist'],
      experience: 8,
      isVerified: true,
      averageRating: 4.8,
      reviewCount: 24,
      profileImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    services: [
      {
        name: '1:1 Personal Training',
        description: 'Personalized training sessions tailored to your specific goals and fitness level.',
        duration: 60,
        price: 85,
        isOnline: true
      },
      {
        name: 'Strength Fundamentals',
        description: 'Learn proper form and technique for all major compound lifts.',
        duration: 45,
        price: 65,
        isOnline: true
      },
      {
        name: 'HIIT Cardio Blast',
        description: 'High-intensity interval training to maximize calorie burn and improve cardiovascular health.',
        duration: 30,
        price: 45,
        isOnline: true
      }
    ],
    availability: [
      // Generate availability for the next 14 days
      // Morning slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(9, 0, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      }),
      // Afternoon slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(14, 0, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      }),
      // Evening slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(18, 0, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      })
    ]
  },
  {
    email: 'sarah.yoga@example.com',
    password: 'Password123!',
    displayName: 'Sarah Chen',
    role: 'trainer',
    profile: {
      bio: 'Yoga instructor with a focus on mindfulness and alignment. I believe yoga is for everybody and every body. My classes are inclusive and adaptable to all levels.',
      specialties: ['Vinyasa Yoga', 'Meditation', 'Flexibility'],
      certifications: ['200-Hour RYT', 'Yin Yoga Certification'],
      experience: 5,
      isVerified: true,
      averageRating: 4.9,
      reviewCount: 32,
      profileImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    services: [
      {
        name: 'Vinyasa Flow',
        description: 'Dynamic yoga sequence linking breath with movement for strength and flexibility.',
        duration: 60,
        price: 75,
        isOnline: true
      },
      {
        name: 'Meditation & Mindfulness',
        description: 'Guided meditation practices to reduce stress and improve mental clarity.',
        duration: 30,
        price: 45,
        isOnline: true
      },
      {
        name: 'Yoga for Beginners',
        description: 'Introduction to basic yoga poses with proper alignment and modifications.',
        duration: 45,
        price: 60,
        isOnline: true
      }
    ],
    availability: [
      // Generate availability for the next 14 days
      // Morning slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(7, 0, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      }),
      // Afternoon slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(12, 0, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      }),
      // Evening slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(17, 0, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      })
    ]
  },
  {
    email: 'marcus.nutrition@example.com',
    password: 'Password123!',
    displayName: 'Marcus Williams',
    role: 'trainer',
    profile: {
      bio: 'Nutritionist and fitness coach specializing in sustainable weight management and sports nutrition. I help clients develop healthy relationships with food while achieving their fitness goals.',
      specialties: ['Nutrition Planning', 'Weight Management', 'Sports Nutrition'],
      certifications: ['Precision Nutrition Level 2', 'ISSA Nutritionist'],
      experience: 6,
      isVerified: true,
      averageRating: 4.7,
      reviewCount: 18,
      profileImage: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    services: [
      {
        name: 'Nutrition Consultation',
        description: 'Comprehensive assessment of your current diet and personalized nutrition recommendations.',
        duration: 60,
        price: 90,
        isOnline: true
      },
      {
        name: 'Meal Planning Session',
        description: 'Customized meal plans based on your preferences, lifestyle, and nutritional needs.',
        duration: 45,
        price: 70,
        isOnline: true
      },
      {
        name: 'Weight Management Coaching',
        description: 'Ongoing support and accountability for sustainable weight loss or gain.',
        duration: 30,
        price: 50,
        isOnline: true
      }
    ],
    availability: [
      // Generate availability for the next 14 days
      // Morning slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(10, 0, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      }),
      // Afternoon slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(13, 0, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      }),
      // Evening slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(16, 0, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      })
    ]
  },
  {
    email: 'elena.pilates@example.com',
    password: 'Password123!',
    displayName: 'Elena Rodriguez',
    role: 'trainer',
    profile: {
      bio: 'Pilates and mobility specialist with a background in physical therapy. My sessions focus on core strength, posture improvement, and injury prevention.',
      specialties: ['Pilates', 'Mobility', 'Rehabilitation'],
      certifications: ['Comprehensive Pilates Certification', 'Functional Range Conditioning'],
      experience: 7,
      isVerified: true,
      averageRating: 4.9,
      reviewCount: 27,
      profileImage: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    services: [
      {
        name: 'Mat Pilates',
        description: 'Core-focused Pilates exercises performed on a mat to improve strength and flexibility.',
        duration: 60,
        price: 80,
        isOnline: true
      },
      {
        name: 'Mobility Assessment',
        description: 'Comprehensive assessment of joint mobility with personalized exercise recommendations.',
        duration: 45,
        price: 70,
        isOnline: true
      },
      {
        name: 'Posture Correction',
        description: 'Targeted exercises to improve posture and alleviate pain from desk work.',
        duration: 30,
        price: 55,
        isOnline: true
      }
    ],
    availability: [
      // Generate availability for the next 14 days
      // Morning slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(8, 0, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      }),
      // Afternoon slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(15, 0, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      }),
      // Evening slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(19, 0, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      })
    ]
  },
  {
    email: 'david.crossfit@example.com',
    password: 'Password123!',
    displayName: 'David Patel',
    role: 'trainer',
    profile: {
      bio: 'CrossFit coach and functional fitness expert. I specialize in high-intensity workouts that build strength, endurance, and mental toughness.',
      specialties: ['CrossFit', 'Functional Training', 'Olympic Lifting'],
      certifications: ['CrossFit Level 2 Trainer', 'USA Weightlifting Level 1'],
      experience: 5,
      isVerified: true,
      averageRating: 4.6,
      reviewCount: 15,
      profileImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    services: [
      {
        name: 'CrossFit Fundamentals',
        description: 'Learn the basic movements and techniques of CrossFit in a safe, structured environment.',
        duration: 60,
        price: 85,
        isOnline: true
      },
      {
        name: 'Olympic Lifting Technique',
        description: 'Technical coaching for snatch and clean & jerk with video analysis.',
        duration: 45,
        price: 75,
        isOnline: true
      },
      {
        name: 'HIIT Workout',
        description: 'High-intensity interval training to improve conditioning and burn calories.',
        duration: 30,
        price: 50,
        isOnline: true
      }
    ],
    availability: [
      // Generate availability for the next 14 days
      // Morning slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(6, 0, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      }),
      // Afternoon slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(16, 30, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      }),
      // Evening slots
      ...Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(20, 0, 0, 0);
        return {
          startTime: Timestamp.fromDate(date),
          endTime: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
          isBooked: false
        };
      })
    ]
  }
];

// Sample client data
const clients = [
  {
    email: 'user1@example.com',
    password: 'Password123!',
    displayName: 'Jamie Smith',
    role: 'client'
  },
  {
    email: 'user2@example.com',
    password: 'Password123!',
    displayName: 'Taylor Brown',
    role: 'client'
  },
  {
    email: 'demo@example.com',
    password: 'Demo123!',
    displayName: 'Demo User',
    role: 'client'
  }
];

// Sample admin data
const admin = {
  email: 'admin@fittribe.fitness',
  password: 'Admin123!',
  displayName: 'Admin User',
  role: 'admin'
};

// Function to seed the database
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Create admin user
    console.log('Creating admin user...');
    const adminUserCredential = await createUserWithEmailAndPassword(auth, admin.email, admin.password);
    await updateProfile(adminUserCredential.user, { displayName: admin.displayName });
    
    await addDoc(collection(db, 'users'), {
      uid: adminUserCredential.user.uid,
      email: admin.email,
      displayName: admin.displayName,
      role: admin.role,
      createdAt: Timestamp.now()
    });
    
    console.log('Admin user created successfully');
    
    // Create client users
    console.log('Creating client users...');
    for (const client of clients) {
      const userCredential = await createUserWithEmailAndPassword(auth, client.email, client.password);
      await updateProfile(userCredential.user, { displayName: client.displayName });
      
      await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        email: client.email,
        displayName: client.displayName,
        role: client.role,
        createdAt: Timestamp.now()
      });
      
      await addDoc(collection(db, 'client_profiles'), {
        userId: userCredential.user.uid,
        fitnessGoals: ['Weight Loss', 'Strength', 'Flexibility'],
        fitnessLevel: 'Intermediate',
        createdAt: Timestamp.now()
      });
      
      console.log(`Client user ${client.displayName} created successfully`);
    }
    
    // Create trainer users
    console.log('Creating trainer users...');
    for (const trainer of trainers) {
      c
(Content truncated due to size limit. Use line ranges to read in chunks)