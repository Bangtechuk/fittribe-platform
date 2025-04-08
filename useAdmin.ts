import { useEffect, useState } from 'react';
import { useFirestore } from '../../contexts/realtime/FirestoreContext';
import { where, orderBy, limit } from 'firebase/firestore';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';

/**
 * Hook to fetch and subscribe to real-time analytics data for admin dashboard
 * 
 * @returns {Object} - Analytics data and loading state
 */
export const useAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalTrainers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentBookings: [],
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useFirebaseAuth();
  const { subscribeToDocument, subscribeToCollection } = useFirestore();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Check if user is admin
    const checkAdminRole = async () => {
      try {
        const userDoc = await subscribeToDocument('users', user.uid, (userData) => {
          if (!userData || userData.role !== 'admin') {
            setError('Unauthorized access');
            setLoading(false);
          }
        });
        
        return userDoc;
      } catch (err) {
        setError(err.message);
        setLoading(false);
        return null;
      }
    };

    const adminCheck = checkAdminRole();
    if (!adminCheck) return;

    setLoading(true);
    
    // Subscribe to analytics document
    const analyticsUnsubscribe = subscribeToDocument(
      'analytics',
      'dashboard',
      (data) => {
        if (data) {
          setAnalytics(prevAnalytics => ({
            ...prevAnalytics,
            totalUsers: data.totalUsers || 0,
            totalTrainers: data.totalTrainers || 0,
            totalBookings: data.totalBookings || 0,
            totalRevenue: data.totalRevenue || 0
          }));
        }
      }
    );
    
    // Subscribe to recent bookings
    const bookingsUnsubscribe = subscribeToCollection(
      'bookings',
      [orderBy('createdAt', 'desc'), limit(10)],
      (data) => {
        setAnalytics(prevAnalytics => ({
          ...prevAnalytics,
          recentBookings: data
        }));
      }
    );
    
    // Subscribe to recent users
    const usersUnsubscribe = subscribeToCollection(
      'users',
      [orderBy('createdAt', 'desc'), limit(10)],
      (data) => {
        setAnalytics(prevAnalytics => ({
          ...prevAnalytics,
          recentUsers: data
        }));
        setLoading(false);
      }
    );
    
    // Cleanup subscriptions on unmount
    return () => {
      analyticsUnsubscribe();
      bookingsUnsubscribe();
      usersUnsubscribe();
    };
  }, [user, subscribeToDocument, subscribeToCollection]);

  return { analytics, loading, error };
};

/**
 * Hook to fetch and subscribe to trainer verification requests
 * 
 * @returns {Object} - Verification requests data and loading state
 */
export const useTrainerVerificationRequests = () => {
  const [verificationRequests, setVerificationRequests] = useState([]);
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
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    ];
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToCollection(
      'trainer_verifications',
      constraints,
      (data) => {
        setVerificationRequests(data);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, subscribeToCollection]);

  // Function to approve a verification request
  const approveVerification = async (requestId) => {
    if (!user) return;
    
    try {
      await updateDocument('trainer_verifications', requestId, { 
        status: 'approved',
        reviewedBy: user.uid,
        reviewedAt: new Date()
      });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Function to reject a verification request
  const rejectVerification = async (requestId, reason) => {
    if (!user) return;
    
    try {
      await updateDocument('trainer_verifications', requestId, { 
        status: 'rejected',
        rejectionReason: reason,
        reviewedBy: user.uid,
        reviewedAt: new Date()
      });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return { 
    verificationRequests, 
    loading, 
    error,
    approveVerification,
    rejectVerification
  };
};

/**
 * Hook to fetch and subscribe to payment transactions for admin
 * 
 * @returns {Object} - Payment transactions data and loading state
 */
export const usePaymentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribeToCollection, updateDocument } = useFirestore();

  useEffect(() => {
    setLoading(true);
    
    // Build query constraints
    const constraints = [
      orderBy('createdAt', 'desc'),
      limit(50)
    ];
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToCollection(
      'payments',
      constraints,
      (data) => {
        setTransactions(data);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [subscribeToCollection]);

  // Function to process a payout
  const processPayout = async (paymentId) => {
    try {
      await updateDocument('payments', paymentId, { 
        payoutStatus: 'processed',
        payoutDate: new Date()
      });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return { 
    transactions, 
    loading, 
    error,
    processPayout
  };
};
