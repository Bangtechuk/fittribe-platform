import React, { useState, useEffect } from 'react';
import { useFirestore } from '../../contexts/realtime/FirestoreContext';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';
import { useNotificationManager } from '../../hooks/realtime/useNotifications';
import { usePaymentProcessor } from '../../hooks/realtime/usePayments';

// UI Components
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import LoadingSpinner from '../ui/LoadingSpinner';

const BookingForm = ({ trainer, availability, onSuccess, onCancel }) => {
  const { user } = useFirebaseAuth();
  const { addDocument } = useFirestore();
  const { createNotification, createBookingNotification } = useNotificationManager();
  const { createPaymentIntent, confirmPayment } = usePaymentProcessor();
  
  // Form state
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [notes, setNotes] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  
  // UI state
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Select date/time, 2: Select service, 3: Confirm
  
  // Fetch trainer services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        if (!trainer?.id) return;
        
        const trainerServices = await useFirestore().getCollection('services', [
          where('trainerId', '==', trainer.id),
          where(isOnline ? 'isOnline' : 'isInPerson', '==', true)
        ]);
        
        setServices(trainerServices);
        
        // Set default service if only one is available
        if (trainerServices.length === 1) {
          setSelectedService(trainerServices[0]);
        }
      } catch (err) {
        setError('Error loading services: ' + err.message);
      }
    };
    
    fetchServices();
  }, [trainer?.id, isOnline]);
  
  // Update available time slots when date changes
  useEffect(() => {
    if (!selectedDate || !availability) return;
    
    // Filter availability for the selected date
    const selectedDateStr = selectedDate.toDateString();
    const slots = availability.filter(slot => {
      const slotDate = new Date(slot.startTime.seconds * 1000);
      return slotDate.toDateString() === selectedDateStr && !slot.isBooked;
    });
    
    // Sort by time
    slots.sort((a, b) => {
      const dateA = new Date(a.startTime.seconds * 1000);
      const dateB = new Date(b.startTime.seconds * 1000);
      return dateA - dateB;
    });
    
    setAvailableTimeSlots(slots);
    setSelectedTimeSlot(null); // Reset selected time slot
  }, [selectedDate, availability]);
  
  // Check if dates are available
  const isDateAvailable = (date) => {
    if (!availability) return false;
    
    const dateStr = date.toDateString();
    return availability.some(slot => {
      const slotDate = new Date(slot.startTime.seconds * 1000);
      return slotDate.toDateString() === dateStr && !slot.isBooked;
    });
  };
  
  // Format time slot for display
  const formatTimeSlot = (slot) => {
    if (!slot) return '';
    
    const startTime = new Date(slot.startTime.seconds * 1000);
    const endTime = new Date(slot.endTime.seconds * 1000);
    
    return `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  // Handle booking submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to book a session');
      return;
    }
    
    if (!selectedTimeSlot || !selectedService) {
      setError('Please select a time slot and service');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Create payment intent
      const paymentData = {
        amount: selectedService.price,
        clientId: user.uid,
        trainerId: trainer.id,
        metadata: {
          serviceName: selectedService.name,
          serviceId: selectedService.id,
          date: new Date(selectedTimeSlot.startTime.seconds * 1000).toISOString()
        }
      };
      
      const payment = await createPaymentIntent(paymentData);
      
      if (!payment) {
        throw new Error('Failed to create payment');
      }
      
      // 2. Create Zoom meeting
      const zoomMeeting = await createZoomMeeting(
        selectedTimeSlot, 
        trainer.displayName, 
        user.displayName,
        selectedService.name
      );
      
      // 3. Create booking
      const bookingData = {
        clientId: user.uid,
        trainerId: trainer.id,
        serviceId: selectedService.id,
        availabilityId: selectedTimeSlot.id,
        startTime: new Date(selectedTimeSlot.startTime.seconds * 1000),
        endTime: new Date(selectedTimeSlot.endTime.seconds * 1000),
        status: 'pending',
        paymentId: payment.paymentId,
        zoomMeetingId: zoomMeeting.id,
        zoomJoinUrl: zoomMeeting.join_url,
        zoomStartUrl: zoomMeeting.start_url,
        notes: notes,
        isOnline: isOnline
      };
      
      const booking = await addDocument('bookings', bookingData);
      
      // 4. Confirm payment
      await confirmPayment(payment.paymentId);
      
      // 5. Create notifications
      await createBookingNotification(
        trainer.id, 
        booking.id, 
        'new', 
        user.displayName
      );
      
      // 6. Update availability
      await useFirestore().updateDocument('availability', selectedTimeSlot.id, {
        isBooked: true,
        bookingId: booking.id
      });
      
      setLoading(false);
      onSuccess();
    } catch (err) {
      setError('Booking failed: ' + err.message);
      setLoading(false);
    }
  };
  
  // Create a Zoom meeting (simulated for now)
  const createZoomMeeting = async (timeSlot, trainerName, clientName, serviceName) => {
    // In a real implementation, this would call a serverless function
    // that creates a Zoom meeting via the Zoom API
    
    // For now, we'll simulate the response
    return {
      id: 'zoom_' + Math.random().toString(36).substring(2, 11),
      topic: `Fitness Session: ${serviceName} with ${trainerName}`,
      start_time: new Date(timeSlot.startTime.seconds * 1000).toISOString(),
      duration: 60, // minutes
      timezone: 'UTC',
      join_url: 'https://zoom.us/j/123456789',
      start_url: 'https://zoom.us/s/123456789?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0'
    };
  };
  
  // Next step
  const goToNextStep = () => {
    if (step === 1 && (!selectedDate || !selectedTimeSlot)) {
      setError('Please select a date and time slot');
      return;
    }
    
    if (step === 2 && !selectedService) {
      setError('Please select a service');
      return;
    }
    
    setError(null);
    setStep(step + 1);
  };
  
  // Previous step
  const goToPreviousStep = () => {
    setError(null);
    setStep(step - 1);
  };
  
  // Format price as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Processing your booking...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {/* Step 1: Select Date and Time */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Type
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-blue-600"
                      checked={isOnline}
                      onChange={() => setIsOnline(true)}
                    />
                    <span className="ml-2">Online (Zoom)</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-blue-600"
                      checked={!isOnline}
                      onChange={() => setIsOnline(false)}
                    />
                    <span className="ml-2">In Person</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={setSelectedDate}
                  minDate={new Date()}
                  filterDate={isDateAvailable}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholderText="Select a date"
                  dateFormat="MMMM d, yyyy"
                />
              </div>
              
              {selectedDate && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Time Slots
                  </label>
                  {availableTimeSlots.length === 0 ? (
                    <p className="text-gray-500">No available time slots for this date</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableTimeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          className={`p-2 border rounded text-center ${
                            selectedTimeSlot?.id === slot.id
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          {formatTimeSlot(slot)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={!selectedTimeSlot}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Select Service */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Service</h3>
              
              {services.length === 0 ? (
                <p className="text-gray-500 mb-4">No services available for this trainer</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 border rounded cursor-pointer ${
                        selectedService?.id === service.id
                          ? 'bg-blue-50 border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-500">{service.duration} minutes</p>
                        </div>
                        <div className="text-lg font-semibold text-blue-600">
                          {formatPrice(service.price)}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{service.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes for Trainer (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={3}
                  placeholder="Any specific goals, concerns, or questions?"
                />
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={!selectedService}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Confirm Booking */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Confirm Booking</h3>
              
              <div className="bg-gray-50 p-4 rounded mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Trainer</p>
                    <p className="font-medium">{trainer.displayName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service</p>
                    <p className="font-medium">{selectedService?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{selectedDate?.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{formatTimeSlot(selectedTimeSlot)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Session Type</p>
                    <p className="font-medium">{isOnline ? 'Online (Zoom)' : 'In Person'}</p>
                  </div>
                  <div>
                    <p className="text-sm 
(Content truncated due to size limit. Use line ranges to read in chunks)