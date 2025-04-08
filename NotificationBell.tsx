import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';
import { useNotifications } from '../../hooks/realtime/useNotifications';

const NotificationBell = () => {
  const { user } = useFirebaseAuth();
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animate bell when new notification arrives
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [unreadCount]);
  
  // Toggle notification dropdown
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="relative">
      <button
        className="relative p-1 text-gray-600 hover:text-gray-900 focus:outline-none"
        onClick={toggleNotifications}
        aria-label="Notifications"
      >
        <svg 
          className={`w-6 h-6 ${isAnimating ? 'animate-wiggle' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                <a href="/notifications" className="text-xs text-blue-600 hover:text-blue-800">
                  View All
                </a>
              </div>
            </div>
            
            <NotificationDropdown />
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationDropdown = () => {
  const { notifications, markAsRead } = useNotifications();
  
  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    if (notification.type === 'booking' && notification.referenceId) {
      window.location.href = `/bookings/${notification.referenceId}`;
    } else if (notification.type === 'payment' && notification.referenceId) {
      window.location.href = `/payments/${notification.referenceId}`;
    } else if (notification.type === 'review' && notification.referenceId) {
      window.location.href = `/reviews/${notification.referenceId}`;
    } else if (notification.type === 'verification' && notification.referenceId) {
      window.location.href = `/admin/verifications/${notification.referenceId}`;
    }
  };
  
  return (
    <div className="max-h-72 overflow-y-auto">
      {notifications.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-gray-500">No notifications</p>
        </div>
      ) : (
        <div>
          {notifications
            .slice(0, 5)
            .map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between">
                  <p className={`text-sm font-medium ${!notification.read ? 'text-blue-600' : 'text-gray-900'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                <p className="mt-1 text-xs text-gray-600 truncate">
                  {notification.message}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
