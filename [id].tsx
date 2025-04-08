import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';
import { useMockData } from '../../contexts/mock/MockDataContext';
import { useMockAuth } from '../../contexts/mock/MockAuthContext';

const TrainerProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getTrainerById, getReviewsForTrainer, getServicesForTrainer, createBooking } = useMockData();
  const { user } = useMockAuth();
  
  const [trainer, setTrainer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [bookingStep, setBookingStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch trainer data when ID is available
  useEffect(() => {
    if (id) {
      const trainerData = getTrainerById(id);
      if (trainerData) {
        setTrainer(trainerData);
        setReviews(getReviewsForTrainer(id));
        setServices(getServicesForTrainer(id));
      }
    }
  }, [id, getTrainerById, getReviewsForTrainer, getServicesForTrainer]);

  // Get available dates (next 7 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Format as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      
      // Get day name
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Check if trainer has availability on this day
      const hasAvailability = trainer && trainer.availability && trainer.availability[dayName] && trainer.availability[dayName].length > 0;
      
      if (hasAvailability) {
        dates.push({
          date: formattedDate,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: date.getDate()
        });
      }
    }
    
    return dates;
  };

  // Get available times for selected date
  const getAvailableTimes = () => {
    if (!selectedDate || !trainer || !trainer.availability) return [];
    
    const date = new Date(selectedDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    return trainer.availability[dayName] || [];
  };

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    if (!selectedDate || !selectedTime || !selectedService) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const service = services.find(s => s.id === selectedService);
      
      await createBooking({
        trainerId: trainer.id,
        userId: user.id,
        date: selectedDate,
        time: selectedTime,
        service: service.name,
        price: service.price
      });
      
      setBookingSuccess(true);
      setBookingStep(3);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!trainer) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p>Loading trainer profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{trainer.name} | FitTribe.fitness</title>
        <meta name="description" content={`Book a session with ${trainer.name}, specializing in ${trainer.specialty}. View availability, services, and reviews.`} />
      </Head>

      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6">
              <img 
                src={trainer.profileImage} 
                alt={trainer.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{trainer.name}</h1>
              <p className="text-xl mt-1">{trainer.specialty}</p>
              <div className="flex items-center mt-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < Math.floor(trainer.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-white ml-2">{trainer.rating} ({trainer.reviewCount} reviews)</span>
              </div>
              <p className="mt-2">${trainer.hourlyRate}/hour</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row">
          {/* Left Column - Trainer Info */}
          <div className="w-full lg:w-2/3 lg:pr-8">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-semibold mb-4">About Me</h2>
              <p className="text-gray-700">{trainer.bio}</p>
              
              <h3 className="text-xl font-semibold mt-6 mb-2">Certifications</h3>
              <ul className="list-disc list-inside text-gray-700">
                {trainer.certifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-semibold mb-4">Services</h2>
              <div className="space-y-4">
                {services.map(service => (
                  <div key={service.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{service.name}</h3>
                        <p className="text-gray-600">{service.duration} minutes</p>
                      </div>
                      <p className="text-lg font-semibold">${service.price}</p>
                    </div>
                    <p className="text-gray-700 mt-2">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Reviews</h2>
                <span className="text-gray-600">{reviews.length} reviews</span>
              </div>
              
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{review.userName}</p>
                          <div className="flex text-yellow-400 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm">{review.date}</p>
                      </div>
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet.</p>
              )}
            </div>
          </div>
          
          {/* Right Column - Booking */}
          <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
              <h2 className="text-2xl font-semibold mb-4">Book a Session</h2>
              
              {bookingStep === 1 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">1. Select a date</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-6">
                    {getAvailableDates().map(date => (
                      <button
                        key={date.date}
                        onClick={() => setSelectedDate(date.date)}
                        className={`p-2 rounded-md text-center ${
                          selectedDate === date.date
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <div className="text-sm">{date.dayName}</div>
                        <div className="font-semibold">{date.dayNumber}</div>
                      </button>
                    ))}
                  </div>
                  
                  {selectedDate && (
                    <>
                      <h3 className="text-lg font-medium mb-3">2. Select a time</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-6">
                        {getAvailableTimes().map(time => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-2 rounded-md text-center ${
                              selectedTime === time
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  
                  <button
                    onClick={() => selectedDate && selectedTime && setBookingStep(2)}
                    disabled={!selectedDate || !selectedTime}
                    className={`w-full py-3 px-4 rounded-lg font-medium ${
                      selectedDate && selectedTime
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 cursor-not-allowed text-gray-500'
                    }`}
                  >
                    Continue
                  </button>
                </div>
              )}
              
              {bookingStep === 2 && (
                <div>
                  <button
                    onClick={() => setBookingStep(1)}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to date & time
                  </button>
                  
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">Selected date & time:</p>
                    <p className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
                    </p>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-3">Select a service</h3>
                  <div className="space-y-3 mb-6">
                    {services.map(service => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`p-3 rounded-md cursor-pointer border ${
                          selectedService === service.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex justify-between">
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="font-semibold">${service.price}</p>
                        </div>
                        <p className="text-sm text-gray-600">{service.duration} minutes</p>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleBookingSubmit}
                    disabled={!selectedService || isLoading}
                    className={`w-full py-3 px-4 rounded-lg font-medium ${
                      selectedService && !isLoading
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 cursor-not-allowed text-gray-500'
                    }`}
                  >
                    {isLoading ? 'Processing...' : 'Book Session'}
                  </button>
                </div>
              )}
              
              {bookingStep === 3 && bookingSuccess && (
                <div className="text-center py-4">
                  <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">Booking Successful!</h3>
                  <p className="text-gray-600 mb-4">Your session has been booked and is pending confirmation from the trainer.</p>
                  <div className="mb-4 p-3 bg-gray-50 rounded-md text-left">
                    <p className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
                    </p>
                    <p className="text-gray-700">
                      {services.find(s => s.id === selectedService)?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounde
(Content truncated due to size limit. Use line ranges to read in chunks)