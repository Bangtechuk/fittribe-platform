import React, { useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';
import { useNotifications } from '../../hooks/realtime/useNotifications';

const NotificationToast = () => {
  const { user } = useFirebaseAuth();
  const { latestNotification, clearLatestNotification } = useNotifications();
  
  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (latestNotification) {
      const timer = setTimeout(() => {
        clearLatestNotification();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [latestNotification, clearLatestNotification]);
  
  // Handle toast click
  const handleToastClick = () => {
    // Handle navigation based on notification type
    if (latestNotification.type === 'booking' && latestNotification.referenceId) {
      window.location.href = `/bookings/${latestNotification.referenceId}`;
    } else if (latestNotification.type === 'payment' && latestNotification.referenceId) {
      window.location.href = `/payments/${latestNotification.referenceId}`;
    } else if (latestNotification.type === 'review' && latestNotification.referenceId) {
      window.location.href = `/reviews/${latestNotification.referenceId}`;
    } else if (latestNotification.type === 'verification' && latestNotification.referenceId) {
      window.location.href = `/admin/verifications/${latestNotification.referenceId}`;
    }
    
    clearLatestNotification();
  };
  
  // Close toast
  const handleClose = (e) => {
    e.stopPropagation();
    clearLatestNotification();
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'payment':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'review':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };
  
  if (!latestNotification) return null;
  
  return (
    <div className="fixed bottom-5 right-5 z-50 animate-slide-up">
      <div 
        className="bg-white rounded-lg shadow-lg p-4 max-w-md cursor-pointer hover:bg-gray-50"
        onClick={handleToastClick}
      >
        <div className="flex">
          {getNotificationIcon(latestNotification.type)}
          
          <div className="ml-3 flex-1">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-gray-900">
                {latestNotification.title}
              </p>
              <button
                onClick={handleClose}
                className="ml-4 text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {latestNotification.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
