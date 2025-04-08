import React, { useState, useEffect } from 'react';
import { useBookings } from '../../hooks/realtime/useBookings';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';

// UI Components
import LoadingSpinner from '../ui/LoadingSpinner';

const AvailabilityCalendar = ({ availability, onSlotSelect }) => {
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  
  // Generate calendar days for the next 14 days
  useEffect(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Check if this date has any availability
      const hasAvailability = availability.some(slot => {
        const slotDate = new Date(slot.startTime.seconds * 1000);
        return slotDate.toDateString() === date.toDateString() && !slot.isBooked;
      });
      
      days.push({
        date,
        dayOfMonth: date.getDate(),
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hasAvailability
      });
    }
    
    setCalendarDays(days);
    
    // Auto-select first date with availability
    const firstAvailableDay = days.find(day => day.hasAvailability);
    if (firstAvailableDay) {
      setSelectedDate(firstAvailableDay.date);
    }
  }, [availability]);
  
  // Update time slots when selected date changes
  useEffect(() => {
    if (!selectedDate) return;
    
    const slots = availability
      .filter(slot => {
        const slotDate = new Date(slot.startTime.seconds * 1000);
        return slotDate.toDateString() === selectedDate.toDateString() && !slot.isBooked;
      })
      .sort((a, b) => {
        const dateA = new Date(a.startTime.seconds * 1000);
        const dateB = new Date(b.startTime.seconds * 1000);
        return dateA - dateB;
      });
    
    setTimeSlots(slots);
  }, [selectedDate, availability]);
  
  // Format time for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (slot) => {
    onSlotSelect(slot);
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Date selector */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => day.hasAvailability && handleDateSelect(day.date)}
              disabled={!day.hasAvailability}
              className={`flex flex-col items-center justify-center w-16 h-20 rounded-lg border ${
                selectedDate && day.date.toDateString() === selectedDate.toDateString()
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : day.hasAvailability
                  ? 'border-gray-300 hover:bg-gray-50'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="text-xs font-medium">{day.dayOfWeek}</span>
              <span className="text-lg font-bold">{day.dayOfMonth}</span>
              {day.hasAvailability ? (
                <span className="text-xs text-green-600">Available</span>
              ) : (
                <span className="text-xs text-gray-400">Unavailable</span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Time slots */}
      {selectedDate && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Available Times for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h4>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => handleTimeSlotSelect(slot)}
                className="py-2 px-3 border border-gray-300 rounded-md text-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formatTime(slot.startTime)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
