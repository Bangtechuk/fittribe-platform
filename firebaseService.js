// Firebase data service for FitTribe.fitness
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// User Authentication
export const firebaseAuth = {
  // Register a new user
  register: async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName: displayName || '',
        photoURL: '',
        role: 'client', // Default role
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
        notificationSettings: {
          email: true,
          push: true,
          sms: false
        }
      });
      
      return {
        user: userCredential.user,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        error: error.message
      };
    }
  },
  
  // Login existing user
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: new Date()
      });
      
      return {
        user: userCredential.user,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        error: error.message
      };
    }
  },
  
  // Logout current user
  logout: async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
  
  // Update user profile
  updateProfile: async (userId, profileData) => {
    try {
      const user = auth.currentUser;
      
      if (user) {
        // Update auth profile if needed
        if (profileData.displayName || profileData.photoURL) {
          await updateProfile(user, {
            displayName: profileData.displayName,
            photoURL: profileData.photoURL
          });
        }
        
        // Update user document
        await updateDoc(doc(db, 'users', userId), {
          ...profileData,
          updatedAt: new Date()
        });
      }
      
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
  
  // Get current user data
  getCurrentUser: async () => {
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        return {
          ...userDoc.data(),
          id: userDoc.id
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }
};

// Trainer Profiles
export const trainerService = {
  // Get all trainers with filtering
  getTrainers: async (filters = {}) => {
    try {
      const { specialization, minRating, maxPrice, location, limit: limitCount = 20 } = filters;
      
      let q = collection(db, 'trainer_profiles');
      const constraints = [];
      
      // Add filters
      constraints.push(where('isActive', '==', true));
      
      if (specialization) {
        constraints.push(where('specializations', 'array-contains', specialization));
      }
      
      if (minRating) {
        constraints.push(where('averageRating', '>=', minRating));
      }
      
      if (maxPrice) {
        constraints.push(where('hourlyRate', '<=', maxPrice));
      }
      
      if (location) {
        constraints.push(where('location', '==', location));
      }
      
      // Add sorting and limit
      constraints.push(orderBy('averageRating', 'desc'));
      constraints.push(limit(limitCount));
      
      // Apply constraints
      q = query(q, ...constraints);
      
      const querySnapshot = await getDocs(q);
      const trainers = [];
      
      querySnapshot.forEach((doc) => {
        trainers.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return trainers;
    } catch (error) {
      console.error('Error getting trainers:', error);
      return [];
    }
  },
  
  // Get a single trainer by ID
  getTrainer: async (trainerId) => {
    try {
      const trainerDoc = await getDoc(doc(db, 'trainer_profiles', trainerId));
      
      if (trainerDoc.exists()) {
        return {
          id: trainerDoc.id,
          ...trainerDoc.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting trainer:', error);
      return null;
    }
  },
  
  // Create or update trainer profile
  updateTrainerProfile: async (userId, profileData) => {
    try {
      const trainerRef = doc(db, 'trainer_profiles', userId);
      const trainerDoc = await getDoc(trainerRef);
      
      if (trainerDoc.exists()) {
        // Update existing profile
        await updateDoc(trainerRef, {
          ...profileData,
          updatedAt: new Date()
        });
      } else {
        // Create new profile
        await setDoc(trainerRef, {
          userId,
          ...profileData,
          isVerified: false,
          averageRating: 0,
          reviewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Update user role to trainer
        await updateDoc(doc(db, 'users', userId), {
          role: 'trainer'
        });
      }
      
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
  
  // Get trainer availability
  getTrainerAvailability: async (trainerId) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        collection(db, 'availability'),
        where('trainerId', '==', trainerId),
        where('date', '>=', today),
        orderBy('date', 'asc'),
        limit(30) // Next 30 days
      );
      
      const querySnapshot = await getDocs(q);
      const availability = [];
      
      querySnapshot.forEach((doc) => {
        availability.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return availability;
    } catch (error) {
      console.error('Error getting availability:', error);
      return [];
    }
  },
  
  // Add availability slot
  addAvailability: async (trainerId, availabilityData) => {
    try {
      const availabilityRef = collection(db, 'availability');
      
      const newAvailability = {
        trainerId,
        isBooked: false,
        ...availabilityData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(availabilityRef, newAvailability);
      
      return {
        id: docRef.id,
        ...newAvailability
      };
    } catch (error) {
      console.error('Error adding availability:', error);
      return null;
    }
  },
  
  // Update availability slot
  updateAvailability: async (availabilityId, availabilityData) => {
    try {
      const availabilityRef = doc(db, 'availability', availabilityId);
      
      await updateDoc(availabilityRef, {
        ...availabilityData,
        updatedAt: new Date()
      });
      
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
  
  // Delete availability slot
  deleteAvailability: async (availabilityId) => {
    try {
      await deleteDoc(doc(db, 'availability', availabilityId));
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }
};

// Booking Service
export const bookingService = {
  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const bookingRef = collection(db, 'bookings');
      
      const newBooking = {
        ...bookingData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(bookingRef, newBooking);
      
      // Update availability to mark as booked
      if (bookingData.availabilityId) {
        await updateDoc(doc(db, 'availability', bookingData.availabilityId), {
          isBooked: true,
          bookingId: docRef.id,
          updatedAt: new Date()
        });
      }
      
      return {
        id: docRef.id,
        ...newBooking
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      return null;
    }
  },
  
  // Get bookings for a client
  getClientBookings: async (clientId, options = {}) => {
    try {
      const { status, upcoming = true, limit: limitCount = 20 } = options;
      
      let q = collection(db, 'bookings');
      const constraints = [where('clientId', '==', clientId)];
      
      if (status) {
        constraints.push(where('status', '==', status));
      }
      
      if (upcoming) {
        const now = new Date();
        constraints.push(where('startTime', '>=', now));
        constraints.push(orderBy('startTime', 'asc'));
      } else {
        constraints.push(orderBy('startTime', 'desc'));
      }
      
      constraints.push(limit(limitCount));
      
      q = query(q, ...constraints);
      
      const querySnapshot = await getDocs(q);
      const bookings = [];
      
      querySnapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return bookings;
    } catch (error) {
      console.error('Error getting client bookings:', error);
      return [];
    }
  },
  
  // Get bookings for a trainer
  getTrainerBookings: async (trainerId, options = {}) => {
    try {
      const { status, upcoming = true, limit: limitCount = 20 } = options;
      
      let q = collection(db, 'bookings');
      const constraints = [where('trainerId', '==', trainerId)];
      
      if (status) {
        constraints.push(where('status', '==', status));
      }
      
      if (upcoming) {
        const now = new Date();
        constraints.push(where('startTime', '>=', now));
        constraints.push(orderBy('startTime', 'asc'));
      } else {
        constraints.push(orderBy('startTime', 'desc'));
      }
      
      constraints.push(limit(limitCount));
      
      q = query(q, ...constraints);
      
      const querySnapshot = await getDocs(q);
      const bookings = [];
      
      querySnapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return bookings;
    } catch (error) {
      console.error('Error getting trainer bookings:', error);
      return [];
    }
  },
  
  // Get a single booking
  getBooking: async (bookingId) => {
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      
      if (bookingDoc.exists()) {
        return {
          id: bookingDoc.id,
          ...bookingDoc.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting booking:', error);
      return null;
    }
  },
  
  // Update booking status
  updateBookingStatus: async (bookingId, status, additionalData = {}) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      
      await updateDoc(bookingRef, {
        status,
        ...additionalData,
        updatedAt: new Date()
      });
      
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }
};

// Review Service
export const reviewService = {
  // Create a new review
  createReview: async (reviewData) => {
    try {
      const reviewRef = collection(db, 'reviews');
      
      const newReview = {
        ...reviewData,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(reviewRef, newReview);
      
      // Update trainer's average rating
      await updateTrainerRating(reviewData.trainerId);
      
      return {
        id: docRef.id,
        ...newReview
      };
    } catch (error) {
      console.error('Error creating review:', error);
      return null;
    }
  },
  
  // Get reviews for a trainer
  getTrainerReviews: async (trainerId, limitCount = 10) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('trainerId', '==', trainerId),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const reviews = [];
      
      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return reviews;
    } catch (error) {
      console.error('Error getting trainer reviews:', error);
      return [];
    }
  },
  
  // Get reviews by a client
  getClientReviews: async (clientId) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reviews = [];
      
      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return reviews;
    } catch (error) {
      console.error('Error getting client reviews:', error);
      return [];
    }
  },
  
  // Update a review
  updateReview: async (reviewId, reviewData) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      
      await updateDoc(reviewRef, {
        ...reviewData,
        updatedAt: new Date()
      });
      
      // If rating was updated, update trainer's average rating
      if (reviewData.rating) {
        const reviewDoc = await getDoc(reviewRef);
        if (reviewDoc.exists()) {
          await updateTrainerRating(reviewDoc.data().trainerId);
        }
      }
      
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }
};

// Payment Service
export const paymentService = {
  // Create a payment intent
  createPaymentIntent: async (paymentData) => {
    try {
      const paymentRef = collection(db, 'payments');
      
      const newPayment = {
        ...paymentData,
        status: 'pending',
        payoutStatus: 'pending',
        createdAt: new Date()
      };
      
      const docRef = await addDoc(paymentRef, newPayment);
      
      return {
        id: docRef.id,
        ...newPayment
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  },
  
  // Update payment status
  updatePaymentStatus: async (paymentId, status, additionalData = {}) => {
    try {
      co
(Content truncated due to size limit. Use line ranges to read in chunks)