import { useEffect, useState } from 'react';
import { useFirestore } from '../../contexts/realtime/FirestoreContext';
import { where, orderBy, limit } from 'firebase/firestore';

/**
 * Hook to fetch and subscribe to real-time trainer data
 * 
 * @param {Object} options - Query options
 * @param {string} options.specialization - Filter by specialization
 * @param {number} options.minRating - Filter by minimum rating
 * @param {number} options.maxPrice - Filter by maximum price
 * @param {string} options.location - Filter by location
 * @param {number} options.limitCount - Limit the number of results
 * @returns {Object} - Trainer data and loading state
 */
export const useTrainers = ({ 
  specialization = null,
  minRating = null,
  maxPrice = null,
  location = null,
  limitCount = 20
} = {}) => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribeToCollection } = useFirestore();

  useEffect(() => {
    setLoading(true);
    
    // Build query constraints
    const constraints = [];
    
    // Only include active trainer profiles
    constraints.push(where('isActive', '==', true));
    
    // Add filters if provided
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
    
    // Add sorting by rating (descending)
    constraints.push(orderBy('averageRating', 'desc'));
    
    // Add limit
    constraints.push(limit(limitCount));
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToCollection(
      'trainer_profiles',
      constraints,
      (data) => {
        setTrainers(data);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [specialization, minRating, maxPrice, location, limitCount, subscribeToCollection]);

  return { trainers, loading, error };
};

/**
 * Hook to fetch and subscribe to a single trainer's data
 * 
 * @param {string} trainerId - The trainer's ID
 * @returns {Object} - Trainer data and loading state
 */
export const useTrainer = (trainerId) => {
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribeToDocument } = useFirestore();

  useEffect(() => {
    if (!trainerId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Subscribe to real-time updates for this trainer
    const unsubscribe = subscribeToDocument(
      'trainer_profiles',
      trainerId,
      (data) => {
        setTrainer(data);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [trainerId, subscribeToDocument]);

  return { trainer, loading, error };
};

/**
 * Hook to fetch and subscribe to a trainer's availability
 * 
 * @param {string} trainerId - The trainer's ID
 * @returns {Object} - Availability data and loading state
 */
export const useTrainerAvailability = (trainerId) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribeToCollection } = useFirestore();

  useEffect(() => {
    if (!trainerId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Get current date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Subscribe to real-time updates for this trainer's availability
    const unsubscribe = subscribeToCollection(
      'availability',
      [
        where('trainerId', '==', trainerId),
        where('date', '>=', today),
        orderBy('date', 'asc'),
        limit(30) // Next 30 days
      ],
      (data) => {
        setAvailability(data);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [trainerId, subscribeToCollection]);

  return { availability, loading, error };
};
