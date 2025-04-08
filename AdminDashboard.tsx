import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';
import { useAdmin } from '../../hooks/realtime/useAdmin';
import { useNotifications } from '../../hooks/realtime/useNotifications';

// Components
import LoadingSpinner from '../ui/LoadingSpinner';
import NotificationList from '../ui/NotificationList';
import TrainerVerificationList from '../admin/TrainerVerificationList';
import UserManagement from '../admin/UserManagement';
import PaymentManagement from '../admin/PaymentManagement';
import AnalyticsDashboard from '../admin/AnalyticsDashboard';

const AdminDashboard = () => {
  const { user } = useFirebaseAuth();
  const { 
    analytics, 
    verificationRequests, 
    users, 
    payments, 
    loading 
  } = useAdmin();
  const { notifications, unreadCount, loading: notificationsLoading } = useNotifications();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('overview');
  
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
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
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
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'verifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('verifications')}
          >
            Trainer Verifications
            {verificationRequests?.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {verificationRequests.length}
              </span>
            )}
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
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
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Stats cards */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-600">{analytics?.totalUsers || 0}</p>
                  <div className="mt-2 flex items-center text-sm">
                    <span className="text-gray-500 mr-2">Active:</span>
                    <span className="font-medium">{analytics?.activeUsers || 0}</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(analytics?.totalRevenue || 0)}</p>
                  <div className="mt-2 flex items-center text-sm">
                    <span className="text-gray-500 mr-2">Avg. Session:</span>
                    <span className="font-medium">{formatCurrency(analytics?.averageSessionPrice || 0)}</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Total Bookings</h3>
                  <p className="text-3xl font-bold text-purple-600">{analytics?.totalBookings || 0}</p>
                  <div className="mt-2 flex items-center text-sm">
                    <span className="text-gray-500 mr-2">Conversion Rate:</span>
                    <span className="font-medium">{(analytics?.conversionRate || 0).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Trainers</h3>
                  <p className="text-3xl font-bold text-yellow-600">{analytics?.totalTrainers || 0}</p>
                  <div className="mt-2 flex items-center text-sm">
                    <span className="text-gray-500 mr-2">Pending Verification:</span>
                    <span className="font-medium">{verificationRequests?.length || 0}</span>
                  </div>
                </div>
              </div>
              
              {/* Recent activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Registrations</h3>
                  </div>
                  
                  <div className="p-6">
                    {users && users.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {users
                          .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
                          .slice(0, 5)
                          .map(user => (
                            <div key={user.id} className="py-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{user.displayName || user.email}</p>
                                  <p className="text-sm text-gray-500">
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-500">
                                    {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent registrations</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Payments</h3>
                  </div>
                  
                  <div className="p-6">
                    {payments && payments.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {payments
                          .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
                          .slice(0, 5)
                          .map(payment => (
                            <div key={payment.id} className="py-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">
                                    {payment.clientName || 'Client'} → {payment.trainerName || 'Trainer'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-green-600">
                                    {formatCurrency(payment.amount)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(payment.createdAt.seconds * 1000).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent payments</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Verification requests preview */}
              {verificationRequests && verificationRequests.length > 0 && (
                <div className="bg-white rounded-lg shadow mb-8">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Pending Trainer Verifications</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="divide-y divide-gray-200">
                      {verificationRequests.slice(0, 3).map(request => (
                        <div key={request.id} className="py-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{request.trainerName || 'Trainer'}</p>
                              <p className="text-sm text-gray-500">
                                {request.certifications?.length || 0} certifications
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                Submitted: {new Date(request.createdAt.seconds * 1000).toLocaleDateString()}
                              </p>
                              <button
                                onClick={() => setActiveTab('verifications')}
                                className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                              >
                                Review
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {verificationRequests.length > 3 && (
                      <div className="pt-4 text-center">
                        <button
                          onClick={() => setActiveTab('verifications')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View all verification requests ({verificationRequests.length})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Daily stats chart */}
              {analytics?.dailyStats && analytics.dailyStats.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Daily Activity</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="h-64">
                      {/* Chart would go here - simplified for this implementation */}
                      <div className="flex h-full items-end space-x-2">
                        {analytics.dailyStats.slice(-14).map((day, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-blue-500 rounded-t"
                              style={{ 
                                height: `${(day.bookings / Math.max(...analytics.dailyStats.map(d => d.bookings))) * 100}%` 
                              }}
                            ></div>
                            <span className="text-xs mt-1 text-gray-500">
                              {new Date(day.date.seconds * 1000).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* User Management tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow">
              <UserManagement users={users} />
            </div>
          )}
          
          {/* Trainer Verifications tab */}
          {activeTab === 'verifications' && (
            <div className="bg-white rounded-lg shadow">
              <TrainerVerificationList verificationRequests={verificationRequests} />
            </div>
          )}
          
          {/* Payments tab */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-lg shadow">
              <PaymentManagement payments={payments} />
            </div>
          )}
          
          {/* Analytics tab */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded
(Content truncated due to size limit. Use line ranges to read in chunks)