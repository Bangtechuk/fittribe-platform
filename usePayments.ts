import { useEffect, useState } from 'react';
import { useFirestore } from '../../contexts/realtime/FirestoreContext';
import { where, orderBy, limit } from 'firebase/firestore';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';

/**
 * Hook to fetch and subscribe to real-time payment data
 * 
 * @returns {Object} - Payment data and loading state
 */
export const usePayments = () => {
  const [payments, setPayments] = useState([]);
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
      orderBy('createdAt', 'desc'),
      limit(20)
    ];
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToCollection(
      'payments',
      constraints,
      (data) => {
        setPayments(data);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, subscribeToCollection]);

  return { payments, loading, error };
};

/**
 * Hook to fetch and subscribe to trainer earnings
 * 
 * @returns {Object} - Trainer earnings data and loading state
 */
export const useTrainerEarnings = () => {
  const [earnings, setEarnings] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
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
      where('trainerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    ];
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToCollection(
      'payments',
      constraints,
      (data) => {
        setEarnings(data);
        
        // Calculate total earnings
        const total = data.reduce((sum, payment) => sum + payment.amount, 0);
        setTotalEarnings(total);
        
        // Calculate pending payouts
        const pending = data
          .filter(payment => payment.status === 'completed' && payment.payoutStatus !== 'processed')
          .reduce((sum, payment) => sum + payment.amount, 0);
        setPendingPayouts(pending);
        
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, subscribeToCollection]);

  return { 
    earnings, 
    totalEarnings,
    pendingPayouts,
    loading, 
    error 
  };
};

/**
 * Hook to create and process payments
 * 
 * @returns {Object} - Payment processing functions and state
 */
export const usePaymentProcessor = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useFirebaseAuth();
  const { addDocument, updateDocument } = useFirestore();

  // Create a payment intent
  const createPaymentIntent = async (bookingId, amount, trainerId, metadata = {}) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      // In a real implementation, this would call a serverless function
      // that creates a Stripe payment intent and returns the client secret
      
      // For now, we'll simulate by creating a payment record
      const paymentData = {
        bookingId,
        amount,
        clientId: user.uid,
        trainerId,
        status: 'pending',
        payoutStatus: 'pending',
        metadata,
        createdAt: new Date()
      };
      
      const payment = await addDocument('payments', paymentData);
      
      return {
        paymentId: payment.id,
        clientSecret: 'simulated_client_secret'
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Confirm a payment
  const confirmPayment = async (paymentId) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      // Update payment status
      await updateDocument('payments', paymentId, {
        status: 'completed',
        completedAt: new Date()
      });
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cancel a payment
  const cancelPayment = async (paymentId, reason = '') => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      // Update payment status
      await updateDocument('payments', paymentId, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date()
      });
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPaymentIntent,
    confirmPayment,
    cancelPayment,
    loading,
    error
  };
};
