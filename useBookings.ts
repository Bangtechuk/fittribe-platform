import { useEffect, useState } from 'react';
import { useFirestore } from '../../contexts/realtime/FirestoreContext';
import { where, orderBy, limit } from 'firebase/firestore';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';

/**
 * Hook to fetch and subscribe to user's bookings
 * 
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by booking status
 * @param {boolean} options.upcoming - Filter for upcoming bookings only
 * @param {number} options.limitCount - Limit the number of results
 * @returns {Object} - Bookings data and loading state
 */
export const useBookings = ({
  status = null,
  upcoming = true,
  limitCount = 20
} = {}) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useFirebaseAuth();
  const { subscribeToCollection } = useFirestore();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Build query constraints
    const constraints = [];
    
    // Filter by user ID (either as client or trainer)
    constraints.push(where('clientId', '==', user.uid));
    
    // Add status filter if provided
    if (status) {
      constraints.push(where('status', '==', status));
    }
    
    // Filter for upcoming bookings if requested
    if (upcoming) {
      const now = new Date();
      constraints.push(where('startTime', '>=', now));
      constraints.push(orderBy('startTime', 'asc'));
    } else {
      // Otherwise sort by most recent first
      constraints.push(orderBy('startTime', 'desc'));
    }
    
    // Add limit
    constraints.push(limit(limitCount));
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToCollection(
      'bookings',
      constraints,
      (data) => {
        setBookings(data);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, status, upcoming, limitCount, subscribeToCollection]);

  return { bookings, loading, error };
};

/**
 * Hook to fetch and subscribe to trainer's bookings
 * 
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by booking status
 * @param {boolean} options.upcoming - Filter for upcoming bookings only
 * @param {number} options.limitCount - Limit the number of results
 * @returns {Object} - Bookings data and loading state
 */
export const useTrainerBookings = ({
  status = null,
  upcoming = true,
  limitCount = 20
} = {}) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useFirebaseAuth();
  const { subscribeToCollection } = useFirestore();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Build query constraints
    const constraints = [];
    
    // Filter by trainer ID
    constraints.push(where('trainerId', '==', user.uid));
    
    // Add status filter if provided
    if (status) {
      constraints.push(where('status', '==', status));
    }
    
    // Filter for upcoming bookings if requested
    if (upcoming) {
      const now = new Date();
      constraints.push(where('startTime', '>=', now));
      constraints.push(orderBy('startTime', 'asc'));
    } else {
      // Otherwise sort by most recent first
      constraints.push(orderBy('startTime', 'desc'));
    }
    
    // Add limit
    constraints.push(limit(limitCount));
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToCollection(
      'bookings',
      constraints,
      (data) => {
        setBookings(data);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, status, upcoming, limitCount, subscribeToCollection]);

  return { bookings, loading, error };
};

/**
 * Hook to fetch and subscribe to a single booking
 * 
 * @param {string} bookingId - The booking ID
 * @returns {Object} - Booking data and loading state
 */
export const useBooking = (bookingId) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribeToDocument } = useFirestore();

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Subscribe to real-time updates for this booking
    const unsubscribe = subscribeToDocument(
      'bookings',
      bookingId,
      (data) => {
        setBooking(data);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [bookingId, subscribeToDocument]);

  return { booking, loading, error };
};
