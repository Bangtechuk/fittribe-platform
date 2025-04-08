import { useEffect, useState } from 'react';
import { useFirestore } from '../../contexts/realtime/FirestoreContext';
import { where, orderBy, limit } from 'firebase/firestore';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';

/**
 * Hook to fetch and subscribe to real-time notifications
 * 
 * @param {number} limitCount - Limit the number of results
 * @returns {Object} - Notifications data and loading state
 */
export const useNotifications = (limitCount = 20) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useFirebaseAuth();
  const { subscribeToCollection, updateDocument } = useFirestore();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Build query constraints
    const constraints = [
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    ];
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToCollection(
      'notifications',
      constraints,
      (data) => {
        setNotifications(data);
        // Count unread notifications
        const unread = data.filter(notification => !notification.read).length;
        setUnreadCount(unread);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, limitCount, subscribeToCollection]);

  // Function to mark a notification as read
  const markAsRead = async (notificationId) => {
    if (!user) return;
    
    try {
      await updateDocument('notifications', notificationId, { read: true });
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      // Update each unread notification
      const unreadNotifications = notifications.filter(notification => !notification.read);
      const updatePromises = unreadNotifications.map(notification => 
        updateDocument('notifications', notification.id, { read: true })
      );
      
      await Promise.all(updatePromises);
    } catch (err) {
      setError(err.message);
    }
  };

  return { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    markAsRead,
    markAllAsRead
  };
};

/**
 * Hook to create and manage real-time notifications
 * 
 * @returns {Object} - Functions to create notifications
 */
export const useNotificationManager = () => {
  const { addDocument } = useFirestore();
  const [error, setError] = useState(null);

  // Function to create a new notification
  const createNotification = async (userId, data) => {
    try {
      const notificationData = {
        userId,
        ...data,
        read: false
      };
      
      return await addDocument('notifications', notificationData);
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Function to create a booking notification
  const createBookingNotification = async (userId, bookingId, type, trainerName) => {
    let title, message;
    
    switch (type) {
      case 'new':
        title = 'New Booking';
        message = `You have a new booking request from ${trainerName}`;
        break;
      case 'confirmed':
        title = 'Booking Confirmed';
        message = `Your booking with ${trainerName} has been confirmed`;
        break;
      case 'cancelled':
        title = 'Booking Cancelled';
        message = `Your booking with ${trainerName} has been cancelled`;
        break;
      case 'reminder':
        title = 'Upcoming Session';
        message = `Your session with ${trainerName} is starting soon`;
        break;
      default:
        title = 'Booking Update';
        message = `There's an update to your booking with ${trainerName}`;
    }
    
    return createNotification(userId, {
      title,
      message,
      type: 'booking',
      bookingId,
      createdAt: new Date()
    });
  };

  // Function to create a payment notification
  const createPaymentNotification = async (userId, paymentId, amount) => {
    return createNotification(userId, {
      title: 'Payment Processed',
      message: `Your payment of $${amount} has been processed successfully`,
      type: 'payment',
      paymentId,
      createdAt: new Date()
    });
  };

  // Function to create a review notification
  const createReviewNotification = async (userId, reviewId, reviewerName) => {
    return createNotification(userId, {
      title: 'New Review',
      message: `You received a new review from ${reviewerName}`,
      type: 'review',
      reviewId,
      createdAt: new Date()
    });
  };

  return {
    createNotification,
    createBookingNotification,
    createPaymentNotification,
    createReviewNotification,
    error
  };
};
