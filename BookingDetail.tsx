import React, { useState, useEffect } from 'react';
import { useFirestore } from '../../contexts/realtime/FirestoreContext';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';
import { useNotificationManager } from '../../hooks/realtime/useNotifications';
import { useReviewForm } from '../../hooks/realtime/useReviews';

// UI Components
import RatingStars from '../ui/RatingStars';
import ReviewForm from '../reviews/ReviewForm';
import LoadingSpinner from '../ui/LoadingSpinner';

const BookingDetail = ({ booking, role, onClose }) => {
  const { user } = useFirebaseAuth();
  const { updateDocument } = useFirestore();
  const { createNotification } = useNotificationManager();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(booking?.showCancelModal || false);
  const [showReviewModal, setShowReviewModal] = useState(booking?.showReviewModal || false);
  const [cancellationReason, setCancellationReason] = useState('');
  
  // Get trainer and client data
  const [trainerData, setTrainerData] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        // Fetch trainer data
        if (booking.trainerId) {
          const trainerDoc = await useFirestore().getDocument('users', booking.trainerId);
          const trainerProfileDoc = await useFirestore().getDocument('trainer_profiles', booking.trainerId);
          
          if (trainerDoc && trainerProfileDoc) {
            setTrainerData({
              ...trainerDoc,
              ...trainerProfileDoc
            });
          }
        }
        
        // Fetch client data
        if (booking.clientId) {
          const clientDoc = await useFirestore().getDocument('users', booking.clientId);
          const clientProfileDoc = await useFirestore().getDocument('client_profiles', booking.clientId);
          
          if (clientDoc) {
            setClientData({
              ...clientDoc,
              ...(clientProfileDoc || {})
            });
          }
        }
        
        // Fetch service data
        if (booking.serviceId) {
          const serviceDoc = await useFirestore().getDocument('services', booking.serviceId);
          
          if (serviceDoc) {
            setServiceData(serviceDoc);
          }
        }
      } catch (err) {
        console.error('Error fetching related data:', err);
      }
    };
    
    fetchRelatedData();
  }, [booking]);
  
  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (!cancellationReason) {
      setError('Please provide a reason for cancellation');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Update booking status
      await updateDocument('bookings', booking.id, {
        status: 'cancelled',
        cancellationReason,
        updatedAt: new Date()
      });
      
      // Update availability
      if (booking.availabilityId) {
        await updateDocument('availability', booking.availabilityId, {
          isBooked: false,
          bookingId: null,
          updatedAt: new Date()
        });
      }
      
      // Create notification for the other party
      const recipientId = role === 'client' ? booking.trainerId : booking.clientId;
      const userName = user?.displayName || 'User';
      
      await createNotification(
        recipientId,
        'Booking Cancelled',
        `${userName} has cancelled the session scheduled for ${formatDate(booking.startTime)} at ${formatTime(booking.startTime)}.`,
        'booking',
        booking.id
      );
      
      setLoading(false);
      setShowCancelModal(false);
      onClose();
    } catch (err) {
      setError('Failed to cancel booking: ' + err.message);
      setLoading(false);
    }
  };
  
  // Handle booking confirmation (for trainers)
  const handleConfirmBooking = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Update booking status
      await updateDocument('bookings', booking.id, {
        status: 'confirmed',
        updatedAt: new Date()
      });
      
      // Create notification for client
      await createNotification(
        booking.clientId,
        'Booking Confirmed',
        `Your session with ${user?.displayName || 'your trainer'} on ${formatDate(booking.startTime)} at ${formatTime(booking.startTime)} has been confirmed.`,
        'booking',
        booking.id
      );
      
      setLoading(false);
      onClose();
    } catch (err) {
      setError('Failed to confirm booking: ' + err.message);
      setLoading(false);
    }
  };
  
  // Handle booking completion (for trainers)
  const handleCompleteBooking = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Update booking status
      await updateDocument('bookings', booking.id, {
        status: 'completed',
        updatedAt: new Date()
      });
      
      // Create notification for client
      await createNotification(
        booking.clientId,
        'Session Completed',
        `Your session with ${user?.displayName || 'your trainer'} has been marked as completed. Please leave a review!`,
        'booking',
        booking.id
      );
      
      setLoading(false);
      onClose();
    } catch (err) {
      setError('Failed to complete booking: ' + err.message);
      setLoading(false);
    }
  };
  
  // Check if the session is happening now (within 15 minutes of start time)
  const isSessionNow = () => {
    if (!booking.startTime) return false;
    
    const now = new Date();
    const startTime = new Date(booking.startTime.seconds * 1000);
    const endTime = new Date(booking.endTime.seconds * 1000);
    
    // Session is happening if current time is within 15 minutes before start time or before end time
    const fifteenMinutesBefore = new Date(startTime);
    fifteenMinutesBefore.setMinutes(startTime.getMinutes() - 15);
    
    return now >= fifteenMinutesBefore && now <= endTime;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Processing your request...</p>
          </div>
        ) : showCancelModal ? (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Cancel Booking</h2>
            
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <p className="mb-4 text-gray-700">
              Are you sure you want to cancel your session on {formatDate(booking.startTime)} at {formatTime(booking.startTime)}?
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Cancellation
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
                placeholder="Please provide a reason for cancellation"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        ) : showReviewModal ? (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Leave a Review</h2>
            
            <ReviewForm
              bookingId={booking.id}
              trainerId={booking.trainerId}
              onSuccess={onClose}
              onCancel={() => setShowReviewModal(false)}
            />
          </div>
        ) : (
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {/* Status */}
            <div className="mb-6">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                {booking.isOnline ? 'Online Session' : 'In-Person Session'}
              </span>
            </div>
            
            {/* Session info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h3>
                <p className="text-lg font-medium">{formatDate(booking.startTime)}</p>
                <p className="text-gray-700">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Service</h3>
                <p className="text-lg font-medium">{serviceData?.name || 'Fitness Session'}</p>
                <p className="text-gray-700">{serviceData?.duration || 60} minutes</p>
              </div>
            </div>
            
            {/* Participant info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {role === 'client' ? 'Trainer' : 'Client'}
                </h3>
                <p className="text-lg font-medium">
                  {role === 'client' ? trainerData?.displayName : clientData?.displayName}
                </p>
                {role === 'client' && trainerData?.averageRating && (
                  <div className="flex items-center mt-1">
                    <RatingStars rating={trainerData.averageRating} size="small" />
                    <span className="ml-1 text-sm text-gray-600">
                      {trainerData.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              
              {booking.isOnline && booking.status === 'confirmed' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Zoom Meeting</h3>
                  <a
                    href={booking.zoomJoinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {isSessionNow() ? 'Join Now' : 'View Meeting Link'}
                  </a>
                  {isSessionNow() && (
                    <p className="text-sm text-green-600 mt-1">
                      This session is happening now!
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Notes */}
            {booking.notes && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                <p className="text-gray-700 whitespace-pre-line">{booking.notes}</p>
              </div>
            )}
            
            {/* Cancellation reason */}
            {booking.status === 'cancelled' && booking.cancellationReason && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Cancellation Reason</h3>
                <p className="text-gray-700">{booking.cancellationReason}</p>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-3 mt-8">
              {/* Client actions */}
              {role === 'client' && (
                <>
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-50"
                    >
                      Cancel Booking
                    </button>
                  )}
                  
                  {booking.status === 'completed' && !booking.hasReviewed && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Leave Review
                    </button>
                  )}
                </>
              )}
              
              {/* Trainer actions */}
              {role === 'trainer' && (
                <>
                  {booking.status === 'pending' && (
                    <button
                      onClick={handleConfirmBooking}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Confirm Booking
                    </button>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-50"
                      >
                        Cancel Session
               
(Content truncated due to size limit. Use line ranges to read in chunks)