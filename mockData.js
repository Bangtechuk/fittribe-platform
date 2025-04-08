// Mock data for FitTribe.fitness demo
const mockData = {
  trainers: [
    {
      id: "trainer1",
      name: "Alex Johnson",
      specialty: "Strength Training",
      rating: 4.8,
      reviewCount: 124,
      hourlyRate: 45,
      bio: "Certified personal trainer with 8+ years of experience specializing in strength training and functional fitness. I help clients build strength, improve mobility, and achieve their fitness goals through personalized training programs.",
      certifications: ["NASM Certified Personal Trainer", "Strength and Conditioning Specialist"],
      profileImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
      availability: {
        monday: ["09:00", "10:00", "11:00", "15:00", "16:00"],
        tuesday: ["09:00", "10:00", "11:00", "15:00", "16:00"],
        wednesday: ["09:00", "10:00", "11:00", "15:00", "16:00"],
        thursday: ["09:00", "10:00", "11:00", "15:00", "16:00"],
        friday: ["09:00", "10:00", "11:00", "15:00", "16:00"],
      }
    },
    {
      id: "trainer2",
      name: "Sarah Chen",
      specialty: "Yoga & Pilates",
      rating: 4.9,
      reviewCount: 98,
      hourlyRate: 40,
      bio: "Experienced yoga and Pilates instructor passionate about helping clients improve flexibility, core strength, and mindfulness. My sessions focus on proper alignment, breathing techniques, and mind-body connection.",
      certifications: ["RYT-200 Yoga Alliance", "Pilates Method Alliance Certified"],
      profileImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
      availability: {
        monday: ["08:00", "09:00", "17:00", "18:00", "19:00"],
        wednesday: ["08:00", "09:00", "17:00", "18:00", "19:00"],
        friday: ["08:00", "09:00", "17:00", "18:00", "19:00"],
        saturday: ["10:00", "11:00", "12:00"],
      }
    },
    {
      id: "trainer3",
      name: "Marcus Williams",
      specialty: "HIIT & Cardio",
      rating: 4.7,
      reviewCount: 87,
      hourlyRate: 50,
      bio: "Fitness coach specializing in high-intensity interval training and cardio workouts. My sessions are designed to maximize calorie burn, improve cardiovascular health, and boost overall fitness in efficient, challenging workouts.",
      certifications: ["ACE Certified Personal Trainer", "HIIT Specialist"],
      profileImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
      availability: {
        tuesday: ["07:00", "08:00", "17:00", "18:00", "19:00"],
        thursday: ["07:00", "08:00", "17:00", "18:00", "19:00"],
        saturday: ["09:00", "10:00", "11:00", "12:00"],
        sunday: ["09:00", "10:00", "11:00"],
      }
    },
    {
      id: "trainer4",
      name: "Emma Rodriguez",
      specialty: "Nutrition & Weight Loss",
      rating: 4.9,
      reviewCount: 112,
      hourlyRate: 55,
      bio: "Certified nutritionist and personal trainer specializing in weight management and healthy lifestyle transformations. I combine nutrition guidance with effective workouts to help clients achieve sustainable results.",
      certifications: ["Precision Nutrition Level 2", "NASM Weight Loss Specialist"],
      profileImage: "https://images.unsplash.com/photo-1579047440583-43a690fe2243?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
      availability: {
        monday: ["12:00", "13:00", "14:00", "18:00", "19:00"],
        wednesday: ["12:00", "13:00", "14:00", "18:00", "19:00"],
        friday: ["12:00", "13:00", "14:00", "18:00", "19:00"],
      }
    },
    {
      id: "trainer5",
      name: "David Kim",
      specialty: "Mobility & Recovery",
      rating: 4.8,
      reviewCount: 76,
      hourlyRate: 45,
      bio: "Physical therapist and mobility coach focusing on injury prevention, recovery, and improved movement patterns. My approach combines therapeutic techniques with targeted exercises to enhance performance and reduce pain.",
      certifications: ["Doctor of Physical Therapy", "Functional Range Conditioning"],
      profileImage: "https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
      availability: {
        tuesday: ["10:00", "11:00", "12:00", "13:00", "14:00"],
        thursday: ["10:00", "11:00", "12:00", "13:00", "14:00"],
        saturday: ["13:00", "14:00", "15:00"],
      }
    }
  ],
  
  reviews: [
    {
      id: "review1",
      trainerId: "trainer1",
      userId: "user1",
      userName: "Jennifer L.",
      rating: 5,
      comment: "Alex is an amazing trainer! He really understands how to push me just the right amount and has helped me gain significant strength in just a few months.",
      date: "2025-03-15"
    },
    {
      id: "review2",
      trainerId: "trainer1",
      userId: "user2",
      userName: "Michael T.",
      rating: 4,
      comment: "Great knowledge of strength training principles. Workouts are challenging but effective. Would recommend!",
      date: "2025-03-10"
    },
    {
      id: "review3",
      trainerId: "trainer2",
      userId: "user3",
      userName: "Rebecca S.",
      rating: 5,
      comment: "Sarah's yoga sessions have transformed my practice. Her attention to alignment and breathing techniques has helped me advance significantly.",
      date: "2025-03-20"
    },
    {
      id: "review4",
      trainerId: "trainer2",
      userId: "user4",
      userName: "Thomas K.",
      rating: 5,
      comment: "As a beginner to Pilates, I was nervous, but Sarah made me feel comfortable right away. Her instructions are clear and she's very encouraging.",
      date: "2025-03-05"
    },
    {
      id: "review5",
      trainerId: "trainer3",
      userId: "user5",
      userName: "Alicia M.",
      rating: 4,
      comment: "Marcus's HIIT workouts are no joke! I've seen great results in my cardio fitness and have lost weight. Be prepared to work hard!",
      date: "2025-03-18"
    }
  ],
  
  bookings: [
    {
      id: "booking1",
      trainerId: "trainer1",
      userId: "user1",
      date: "2025-04-10",
      time: "10:00",
      status: "confirmed",
      zoomLink: "https://zoom.us/j/123456789",
      service: "1:1 Strength Training Session",
      price: 45
    },
    {
      id: "booking2",
      trainerId: "trainer2",
      userId: "user1",
      date: "2025-04-12",
      time: "09:00",
      status: "confirmed",
      zoomLink: "https://zoom.us/j/987654321",
      service: "Private Yoga Session",
      price: 40
    },
    {
      id: "booking3",
      trainerId: "trainer3",
      userId: "user1",
      date: "2025-04-15",
      time: "18:00",
      status: "pending",
      service: "HIIT Workout Session",
      price: 50
    }
  ],
  
  users: {
    "demo@example.com": {
      id: "user1",
      name: "Demo User",
      email: "demo@example.com",
      password: "Demo123!",
      role: "client",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
    },
    "alex.fitness@example.com": {
      id: "trainer1",
      name: "Alex Johnson",
      email: "alex.fitness@example.com",
      password: "Password123!",
      role: "trainer",
      profileImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
    },
    "admin@fittribe.fitness": {
      id: "admin1",
      name: "Admin User",
      email: "admin@fittribe.fitness",
      password: "Admin123!",
      role: "admin",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
    }
  },
  
  services: [
    {
      id: "service1",
      trainerId: "trainer1",
      name: "1:1 Strength Training Session",
      description: "Personalized strength training session focused on proper form, progressive overload, and achieving your specific goals.",
      duration: 60,
      price: 45
    },
    {
      id: "service2",
      trainerId: "trainer1",
      name: "Strength Program Design",
      description: "Custom strength program design with follow-up sessions to adjust and optimize your training plan.",
      duration: 90,
      price: 65
    },
    {
      id: "service3",
      trainerId: "trainer2",
      name: "Private Yoga Session",
      description: "One-on-one yoga session tailored to your experience level, goals, and any specific areas you want to work on.",
      duration: 60,
      price: 40
    },
    {
      id: "service4",
      trainerId: "trainer2",
      name: "Pilates Fundamentals",
      description: "Learn the core principles of Pilates with personalized instruction and feedback.",
      duration: 60,
      price: 40
    },
    {
      id: "service5",
      trainerId: "trainer3",
      name: "HIIT Workout Session",
      description: "High-intensity interval training session designed to maximize calorie burn and improve cardiovascular fitness.",
      duration: 45,
      price: 50
    }
  ],
  
  notifications: [
    {
      id: "notif1",
      userId: "user1",
      title: "Booking Confirmed",
      message: "Your session with Alex Johnson on April 10th at 10:00 AM has been confirmed.",
      read: false,
      date: "2025-04-01"
    },
    {
      id: "notif2",
      userId: "user1",
      title: "Booking Confirmed",
      message: "Your session with Sarah Chen on April 12th at 9:00 AM has been confirmed.",
      read: true,
      date: "2025-04-02"
    },
    {
      id: "notif3",
      userId: "user1",
      title: "New Message",
      message: "You have a new message from Alex Johnson regarding your upcoming session.",
      read: false,
      date: "2025-04-05"
    }
  ]
};

export default mockData;
