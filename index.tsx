import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';
import { useMockAuth } from '../../contexts/mock/MockAuthContext';
import { useMockData } from '../../contexts/mock/MockDataContext';

const Dashboard = () => {
  const { user } = useMockAuth();
  const { getBookingsForUser, getNotificationsForUser } = useMockData();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      setBookings(getBookingsForUser(user.id));
      setNotifications(getNotificationsForUser(user.id));
    }
  }, [user, getBookingsForUser, getNotificationsForUser]);

  if (!user) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p>Please log in to view your dashboard.</p>
        </div>
      </Layout>
    );
  }

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    
    if (activeTab === 'upcoming') {
      return bookingDate >= today;
    } else {
      return bookingDate < today;
    }
  });

  return (
    <Layout>
      <Head>
        <title>Dashboard | FitTribe.fitness</title>
        <meta name="description" content="Manage your fitness sessions, bookings, and account settings." />
      </Head>

      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
          <p className="mt-2">Manage your fitness journey from your personal dashboard.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 mb-6 md:mb-0 md:pr-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                  <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-gray-600">{user.role === 'client' ? 'Client' : 'Trainer'}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <a href="#" className="block px-3 py-2 rounded-md bg-blue-50 text-blue-700 font-medium">
                  Dashboard
                </a>
                <a href="#" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 font-medium">
                  Profile Settings
                </a>
                <a href="#" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 font-medium">
                  Payment Methods
                </a>
                {user.role === 'trainer' && (
                  <>
                    <a href="#" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 font-medium">
                      Manage Availability
                    </a>
                    <a href="#" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 font-medium">
                      Services & Pricing
                    </a>
                  </>
                )}
              </nav>
            </div>
            
            {/* Notifications */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <h2 className="text-xl font-semibold mb-4">Notifications</h2>
              
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div key={notification.id} className={`p-3 rounded-md ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-gray-600 text-sm">{notification.message}</p>
                      <p className="text-gray-500 text-xs mt-1">{notification.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No notifications.</p>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-6 py-4 text-center w-1/2 font-medium ${
                      activeTab === 'upcoming'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Upcoming Sessions
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`px-6 py-4 text-center w-1/2 font-medium ${
                      activeTab === 'past'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Past Sessions
                  </button>
                </nav>
              </div>
              
              <div className="p-6">
                {filteredBookings.length > 0 ? (
                  <div className="space-y-6">
                    {filteredBookings.map(booking => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <div>
                            <h3 className="text-lg font-semibold">{booking.service}</h3>
                            <p className="text-gray-600">
                              {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {booking.time}
                            </p>
                          </div>
                          <div className="mt-4 md:mt-0">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          {booking.status === 'confirmed' && activeTab === 'upcoming' && booking.zoomLink && (
                            <a
                              href={booking.zoomLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                              Join Zoom Session
                            </a>
                          )}
                          
                          {activeTab === 'upcoming' && (
                            <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                              Reschedule
                            </button>
                          )}
                          
                          {activeTab === 'past' && !booking.reviewed && (
                            <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                              Leave Review
                            </button>
                          )}
                          
                          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      {activeTab === 'upcoming'
                        ? "You don't have any upcoming sessions."
                        : "You don't have any past sessions."}
                    </p>
                    {activeTab === 'upcoming' && (
                      <a
                        href="/trainers"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Find a Trainer
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional Dashboard Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {bookings.filter(b => new Date(b.date) < new Date()).length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {bookings.filter(b => new Date(b.date) >= new Date()).length}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">Different Trainers</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {new Set(bookings.map(b => b.trainerId)).size}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Recommended Trainers</h2>
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        <img 
                          src={`https://images.unsplash.com/photo-${i === 1 ? '1534438327276-14e5300c3a48' : '1594381898411-846e7d193883'}?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80`} 
                          alt="Trainer" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{i === 1 ? 'Marcus Williams' : 'David Kim'}</h3>
                        <p className="text-sm text-gray-600">{i === 1 ? 'HIIT & Cardio' : 'Mobility & Recovery'}</p>
                      </div>
                      <a
                        href={`/trainers/trainer${i + 2}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
