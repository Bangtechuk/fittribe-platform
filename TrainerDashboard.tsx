import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';
import { useTrainerBookings } from '../../hooks/realtime/useBookings';
import { useTrainerEarnings } from '../../hooks/realtime/usePayments';
import { useNotifications } from '../../hooks/realtime/useNotifications';
import { useTrainerAvailability, useTrainer } from '../../hooks/realtime/useTrainers';
import { useTrainerReviews } from '../../hooks/realtime/useReviews';

// Components
import BookingList from '../bookings/BookingList';
import PaymentHistory from '../payments/PaymentHistory';
import NotificationList from '../ui/NotificationList';
import AvailabilityManager from '../trainers/AvailabilityManager';
import ServiceManager from '../trainers/ServiceManager';
import LoadingSpinner from '../ui/LoadingSpinner';

const TrainerDashboard = () => {
  const { user } = useFirebaseAuth();
  const { trainer, loading: trainerLoading } = useTrainer(user?.uid);
  const { bookings, loading: bookingsLoading } = useTrainerBookings();
  const { earnings, totalEarnings, pendingPayouts, loading: earningsLoading } = useTrainerEarnings();
  const { notifications, unreadCount, loading: notificationsLoading } = useNotifications();
  const { availability, loading: availabilityLoading } = useTrainerAvailability(user?.uid);
  const { reviews, averageRating, loading: reviewsLoading } = useTrainerReviews(user?.uid);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Stats
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    completedSessions: 0,
    cancellationRate: 0,
    totalClients: 0
  });
  
  // Calculate stats
  useEffect(() => {
    if (bookingsLoading) return;
    
    // Count upcoming sessions
    const upcomingSessions = bookings.filter(
      booking => booking.status === 'confirmed' || booking.status === 'pending'
    ).length;
    
    // Count completed sessions
    const completedSessions = bookings.filter(
      booking => booking.status === 'completed'
    ).length;
    
    // Calculate cancellation rate
    const cancelledSessions = bookings.filter(
      booking => booking.status === 'cancelled'
    ).length;
    
    const totalSessions = completedSessions + cancelledSessions;
    const cancellationRate = totalSessions > 0 ? (cancelledSessions / totalSessions) * 100 : 0;
    
    // Count unique clients
    const uniqueClients = new Set(bookings.map(booking => booking.clientId)).size;
    
    setStats({
      upcomingSessions,
      completedSessions,
      cancellationRate,
      totalClients: uniqueClients
    });
  }, [bookings, bookingsLoading]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Trainer Dashboard</h1>
      
      {/* Dashboard tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex flex-wrap space-x-8">
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'sessions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('sessions')}
          >
            Sessions
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'earnings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('earnings')}
          >
            Earnings
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'availability'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('availability')}
          >
            Availability
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'services'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('services')}
          >
            Services
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'reviews'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 relative ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>
      </div>
      
      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stats cards */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upcoming Sessions</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.upcomingSessions}</p>
              <button
                onClick={() => setActiveTab('sessions')}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                View all sessions →
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Earnings</h3>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
              <button
                onClick={() => setActiveTab('earnings')}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                View earnings →
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Rating</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {averageRating ? averageRating.toFixed(1) : 'N/A'}
                <span className="text-lg font-normal text-gray-500"> / 5</span>
              </p>
              <button
                onClick={() => setActiveTab('reviews')}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                View reviews →
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Clients</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalClients}</p>
              <p className="mt-2 text-sm text-gray-500">
                {stats.completedSessions} completed sessions
              </p>
            </div>
          </div>
          
          {/* Upcoming sessions preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Sessions</h3>
              </div>
              
              <div className="p-6">
                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You don't have any upcoming sessions</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {bookings
                      .filter(b => b.status === 'confirmed' || b.status === 'pending')
                      .slice(0, 3)
                      .map(booking => (
                        <div key={booking.id} className="py-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{booking.clientName}</p>
                              <p className="text-sm text-gray-500">{booking.serviceName}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {new Date(booking.startTime.seconds * 1000).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(booking.startTime.seconds * 1000).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length > 3 && (
                      <div className="pt-4">
                        <button
                          onClick={() => setActiveTab('sessions')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View all upcoming sessions →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Earnings</h3>
              </div>
              
              <div className="p-6">
                {earningsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : earnings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You don't have any earnings yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {earnings
                      .filter(payment => payment.status === 'completed')
                      .slice(0, 3)
                      .map(payment => (
                        <div key={payment.id} className="py-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{payment.clientName || 'Client'}</p>
                              <p className="text-sm text-gray-500">
                                {payment.metadata?.serviceName || 'Fitness Session'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-green-600">
                                {formatCurrency(payment.amount)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(payment.completedAt.seconds * 1000).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {earnings.filter(payment => payment.status === 'completed').length > 3 && (
                      <div className="pt-4">
                        <button
                          onClick={() => setActiveTab('earnings')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View all earnings →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Profile verification status */}
          {!trainerLoading && trainer && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Profile Status</h3>
                  <p className="text-gray-500">
                    {trainer.isVerified 
                      ? 'Your profile is verified and visible to clients' 
                      : 'Your profile is pending verification'}
                  </p>
                </div>
                
                <div>
                  {trainer.isVerified ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Verified
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      Pending Verification
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <a
                  href={`/trainers/${user?.uid}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View public profile →
                </a>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Sessions tab */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-lg shadow">
          <BookingList role="trainer" />
        </div>
      )}
      
      {/* Earnings tab */}
      {activeTab === 'earnings' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Earnings</h3>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
            </div>
         
(Content truncated due to size limit. Use line ranges to read in chunks)