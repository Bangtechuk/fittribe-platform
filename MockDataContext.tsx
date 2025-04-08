import React, { createContext, useContext, useState } from 'react';
import mockData from '../../utils/mockData';

// Create a mock data context
const MockDataContext = createContext({
  getTrainers: () => [],
  getTrainerById: () => null,
  getReviewsForTrainer: () => [],
  getServicesForTrainer: () => [],
  getBookingsForUser: () => [],
  getNotificationsForUser: () => [],
  createBooking: async () => {},
  updateBooking: async () => {},
  createReview: async () => {}
});

// Custom hook to use the mock data context
export const useMockData = () => {
  return useContext(MockDataContext);
};

// Provider component
export const MockDataProvider = ({ children }) => {
  const [bookings, setBookings] = useState(mockData.bookings);
  const [reviews, setReviews] = useState(mockData.reviews);
  const [notifications, setNotifications] = useState(mockData.notifications);

  // Get all trainers with optional filtering
  const getTrainers = (filters = {}) => {
    let filteredTrainers = [...mockData.trainers];
    
    // Apply filters if provided
    if (filters.specialty) {
      filteredTrainers = filteredTrainers.filter(trainer => 
        trainer.specialty.toLowerCase().includes(filters.specialty.toLowerCase())
      );
    }
    
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filteredTrainers = filteredTrainers.filter(trainer => 
        trainer.hourlyRate >= min && trainer.hourlyRate <= max
      );
    }
    
    if (filters.rating) {
      filteredTrainers = filteredTrainers.filter(trainer => 
        trainer.rating >= filters.rating
      );
    }
    
    return filteredTrainers;
  };

  // Get a specific trainer by ID
  const getTrainerById = (trainerId) => {
    return mockData.trainers.find(trainer => trainer.id === trainerId) || null;
  };

  // Get reviews for a specific trainer
  const getReviewsForTrainer = (trainerId) => {
    return reviews.filter(review => review.trainerId === trainerId);
  };

  // Get services for a specific trainer
  const getServicesForTrainer = (trainerId) => {
    return mockData.services.filter(service => service.trainerId === trainerId);
  };

  // Get bookings for a specific user
  const getBookingsForUser = (userId) => {
    return bookings.filter(booking => booking.userId === userId);
  };

  // Get notifications for a specific user
  const getNotificationsForUser = (userId) => {
    return notifications.filter(notification => notification.userId === userId);
  };

  // Create a new booking
  const createBooking = async (bookingData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newBooking = {
      id: `booking${bookings.length + 1}`,
      ...bookingData,
      status: 'pending',
      zoomLink: ''
    };
    
    setBookings(prev => [...prev, newBooking]);
    
    // Create a notification for the booking
    const newNotification = {
      id: `notif${notifications.length + 1}`,
      userId: bookingData.userId,
      title: 'Booking Created',
      message: `Your booking request has been sent to the trainer for ${bookingData.date} at ${bookingData.time}.`,
      read: false,
      date: new Date().toISOString().split('T')[0]
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return newBooking;
  };

  // Update an existing booking
  const updateBooking = async (bookingId, updateData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, ...updateData } : booking
    ));
    
    // Create a notification for the booking update
    if (updateData.status === 'confirmed') {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const newNotification = {
          id: `notif${notifications.length + 1}`,
          userId: booking.userId,
          title: 'Booking Confirmed',
          message: `Your booking for ${booking.date} at ${booking.time} has been confirmed.`,
          read: false,
          date: new Date().toISOString().split('T')[0]
        };
        
        setNotifications(prev => [...prev, newNotification]);
      }
    }
    
    return true;
  };

  // Create a new review
  const createReview = async (reviewData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newReview = {
      id: `review${reviews.length + 1}`,
      ...reviewData,
      date: new Date().toISOString().split('T')[0]
    };
    
    setReviews(prev => [...prev, newReview]);
    
    return newReview;
  };

  const value = {
    getTrainers,
    getTrainerById,
    getReviewsForTrainer,
    getServicesForTrainer,
    getBookingsForUser,
    getNotificationsForUser,
    createBooking,
    updateBooking,
    createReview
  };

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
};

export default MockDataContext;
