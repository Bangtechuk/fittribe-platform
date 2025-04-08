import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';
import { useBookings } from '../../hooks/realtime/useBookings';
import { usePayments } from '../../hooks/realtime/usePayments';
import { useNotifications } from '../../hooks/realtime/useNotifications';

// Components
import BookingList from '../bookings/BookingList';
import PaymentHistory from '../payments/PaymentHistory';
import NotificationList from '../ui/NotificationList';
import LoadingSpinner from '../ui/LoadingSpinner';

const ClientDashboard = () => {
  const { user } = useFirebaseAuth();
  const { bookings, loading: bookingsLoading } = useBookings({ role: 'client', upcoming: true });
  const { payments, loading: paymentsLoading } = usePayments();
  const { notifications, unreadCount, loading: notificationsLoading } = useNotifications();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Stats
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    completedSessions: 0,
    totalSpent: 0,
    favoriteTrainers: []
  });
  
  // Calculate stats
  useEffect(() => {
    if (bookingsLoading || paymentsLoading) return;
    
    // Count upcoming sessions
    const upcomingSessions = bookings.filter(
      booking => booking.status === 'confirmed' || booking.status === 'pending'
    ).length;
    
    // Count completed sessions
    const completedSessions = bookings.filter(
      booking => booking.status === 'completed'
    ).length;
    
    // Calculate total spent
    const totalSpent = payments.reduce((sum, payment) => {
      if (payment.status === 'completed') {
        return sum + payment.amount;
      }
      return sum;
    }, 0);
    
    // Find favorite trainers (most booked)
    const trainerCounts = {};
    bookings.forEach(booking => {
      if (!trainerCounts[booking.trainerId]) {
        trainerCounts[booking.trainerId] = {
          id: booking.trainerId,
          name: booking.trainerName,
          count: 0
        };
      }
      trainerCounts[booking.trainerId].count++;
    });
    
    const favoriteTrainers = Object.values(trainerCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    setStats({
      upcomingSessions,
      completedSessions,
      totalSpent,
      favoriteTrainers
    });
  }, [bookings, payments, bookingsLoading, paymentsLoading]);
  
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
      <h1 className="text-3xl font-bold mb-8">Client Dashboard</h1>
      
      {/* Dashboard tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex space-x-8">
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
            My Sessions
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('payments')}
          >
            Payment History
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Completed Sessions</h3>
              <p className="text-3xl font-bold text-green-600">{stats.completedSessions}</p>
              <p className="mt-2 text-sm text-gray-500">
                Keep up the good work!
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Spent</h3>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.totalSpent)}</p>
              <button
                onClick={() => setActiveTab('payments')}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                View payment history →
              </button>
            </div>
          </div>
          
          {/* Upcoming sessions preview */}
          <div className="bg-white rounded-lg shadow mb-8">
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
                  <p className="text-gray-500 mb-4">You don't have any upcoming sessions</p>
                  <a
                    href="/trainers"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Find a Trainer
                  </a>
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
                            <p className="font-medium">{booking.trainerName}</p>
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
          
          {/* Favorite trainers */}
          {stats.favoriteTrainers.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Your Favorite Trainers</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.favoriteTrainers.map(trainer => (
                    <div key={trainer.id} className="border border-gray-200 rounded-lg p-4 text-center">
                      <p className="font-medium text-lg mb-1">{trainer.name}</p>
                      <p className="text-sm text-gray-500">{trainer.count} sessions</p>
                      <a
                        href={`/trainers/${trainer.id}`}
                        className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Profile
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Sessions tab */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-lg shadow">
          <BookingList role="client" />
        </div>
      )}
      
      {/* Payments tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-lg shadow">
          <PaymentHistory />
        </div>
      )}
      
      {/* Notifications tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow">
          <NotificationList notifications={notifications} loading={notificationsLoading} />
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
