import { useEffect, useState } from 'react';
import { useFirestore } from '../../contexts/realtime/FirestoreContext';
import { where, orderBy, limit } from 'firebase/firestore';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';

/**
 * Hook to fetch and subscribe to real-time reviews
 * 
 * @param {string} trainerId - The trainer ID to get reviews for
 * @param {number} limitCount - Limit the number of results
 * @returns {Object} - Reviews data and loading state
 */
export const useReviews = (trainerId, limitCount = 10) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribeToCollection } = useFirestore();

  useEffect(() => {
    if (!trainerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Build query constraints
    const constraints = [
      where('trainerId', '==', trainerId),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    ];
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToCollection(
      'reviews',
      constraints,
      (data) => {
        setReviews(data);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [trainerId, limitCount, subscribeToCollection]);

  return { reviews, loading, error };
};

/**
 * Hook to fetch and subscribe to a user's reviews
 * 
 * @returns {Object} - User's reviews data and loading state
 */
export const useUserReviews = () => {
  const [reviews, setReviews] = useState([]);
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
    const constraints = [
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    ];
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToCollection(
      'reviews',
      constraints,
      (data) => {
        setReviews(data);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, subscribeToCollection]);

  return { reviews, loading, error };
};

/**
 * Hook to calculate and subscribe to a trainer's average rating
 * 
 * @param {string} trainerId - The trainer ID
 * @returns {Object} - Average rating data and loading state
 */
export const useTrainerRating = (trainerId) => {
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribeToCollection } = useFirestore();

  useEffect(() => {
    if (!trainerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Build query constraints
    const constraints = [
      where('trainerId', '==', trainerId),
      where('isPublic', '==', true)
    ];
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToCollection(
      'reviews',
      constraints,
      (data) => {
        if (data.length === 0) {
          setAverageRating(0);
          setReviewCount(0);
        } else {
          // Calculate average rating
          const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(totalRating / data.length);
          setReviewCount(data.length);
        }
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [trainerId, subscribeToCollection]);

  return { averageRating, reviewCount, loading, error };
};
