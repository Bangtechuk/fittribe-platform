import React, { useState, useEffect } from 'react';
import { useBookings } from '../../hooks/realtime/useBookings';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';
import { useNotificationManager } from '../../hooks/realtime/useNotifications';

// UI Components
import LoadingSpinner from '../ui/LoadingSpinner';
import BookingDetail from './BookingDetail';

const BookingList = ({ role = 'client' }) => {
  const { user } = useFirebaseAuth();
  const { createNotification } = useNotificationManager();
  
  // State
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Get bookings with real-time updates
  const { 
    bookings: upcomingBookings, 
    loading: upcomingLoading 
  } = useBookings({
    role,
    status: ['pending', 'confirmed'],
    upcoming: true
  });
  
  const { 
    bookings: pastBookings, 
    loading: pastLoading 
  } = useBookings({
    role,
    status: ['completed', 'cancelled'],
    upcoming: false
  });
  
  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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
  
  // Handle booking selection
  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
  };
  
  // Close booking detail
  const handleCloseDetail = () => {
    setSelectedBooking(null);
  };
  
  // Get current bookings based on active tab
  const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;
  const isLoading = activeTab === 'upcoming' ? upcomingLoading : pastLoading;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-3 text-sm font-medium ${
            activeTab === 'upcoming'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Sessions
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium ${
            activeTab === 'past'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('past')}
        >
          Past Sessions
        </button>
      </div>
      
      {/* Booking list */}
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : currentBookings.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <p className="text-gray-500">
              {activeTab === 'upcoming'
                ? 'You have no upcoming sessions'
                : 'You have no past sessions'}
            </p>
            {activeTab === 'upcoming' && role === 'client' && (
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => window.location.href = '/trainers'}
              >
                Find a Trainer
              </button>
            )}
          </div>
        ) : (
          currentBookings.map((booking) => (
            <div
              key={booking.id}
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleBookingSelect(booking)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {booking.isOnline ? 'Online' : 'In Person'}
                    </span>
                  </div>
                  
                  <h3 className="mt-1 text-lg font-medium text-gray-900">
                    {role === 'client' ? booking.trainerName : booking.clientName}
                  </h3>
                  
                  <p className="mt-1 text-sm text-gray-600">
                    {booking.serviceName || 'Fitness Session'}
                  </p>
                </div>
                
                <div className="mt-2 sm:mt-0 text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(booking.startTime)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </p>
                </div>
              </div>
              
              {/* Action buttons for upcoming sessions */}
              {activeTab === 'upcoming' && (
                <div className="mt-4 flex justify-end space-x-2">
                  {booking.status === 'confirmed' && booking.isOnline && (
                    <a
                      href={booking.zoomJoinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Join Zoom
                    </a>
                  )}
                  
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button
                      className="px-3 py-1 border border-red-300 text-red-700 text-sm rounded hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookingSelect({ ...booking, showCancelModal: true });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
              
              {/* Review button for completed sessions */}
              {activeTab === 'past' && booking.status === 'completed' && role === 'client' && !booking.hasReviewed && (
                <div className="mt-4 flex justify-end">
                  <button
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookingSelect({ ...booking, showReviewModal: true });
                    }}
                  >
                    Leave Review
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Booking detail modal */}
      {selectedBooking && (
        <BookingDetail
          booking={selectedBooking}
          role={role}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default BookingList;
