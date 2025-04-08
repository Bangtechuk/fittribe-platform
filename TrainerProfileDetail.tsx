import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTrainer } from '../../hooks/realtime/useTrainers';
import { useTrainerAvailability } from '../../hooks/realtime/useTrainers';
import { useReviews } from '../../hooks/realtime/useReviews';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';

// Components
import RatingStars from '../ui/RatingStars';
import ReviewList from '../reviews/ReviewList';
import BookingForm from '../bookings/BookingForm';
import AvailabilityCalendar from '../bookings/AvailabilityCalendar';
import LoadingSpinner from '../ui/LoadingSpinner';

const TrainerProfileDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useFirebaseAuth();
  
  // State for booking modal
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Get trainer data with real-time updates
  const { trainer, loading: trainerLoading, error: trainerError } = useTrainer(id);
  
  // Get trainer availability with real-time updates
  const { availability, loading: availabilityLoading } = useTrainerAvailability(id);
  
  // Get trainer reviews with real-time updates
  const { reviews, loading: reviewsLoading } = useReviews(id);
  
  // Check if the URL has a book=true parameter
  useEffect(() => {
    if (router.query.book === 'true') {
      setShowBookingForm(true);
    }
  }, [router.query]);
  
  // Format price as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  if (trainerLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (trainerError || !trainer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading trainer profile. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header section with cover image */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {trainer.coverPhotoURL && (
            <img 
              src={trainer.coverPhotoURL} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Profile image */}
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
              {trainer.photoURL ? (
                <img 
                  src={trainer.photoURL} 
                  alt={trainer.displayName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-4xl text-gray-500">
                    {trainer.displayName?.charAt(0) || 'T'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Verification badge */}
          {trainer.isVerified && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Verified Trainer
            </div>
          )}
        </div>
        
        {/* Profile info section */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{trainer.displayName}</h1>
              
              <div className="flex items-center mt-2">
                <RatingStars rating={trainer.averageRating || 0} size="medium" />
                <span className="ml-2 text-gray-600">
                  {trainer.averageRating?.toFixed(1) || '0.0'} ({trainer.reviewCount || 0} reviews)
                </span>
              </div>
              
              <div className="mt-2 text-gray-600">
                <i className="fas fa-map-marker-alt mr-1"></i> {trainer.location || 'Location not specified'}
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {formatPrice(trainer.hourlyRate || 0)}<span className="text-gray-500 text-lg font-normal">/hour</span>
              </div>
              
              <button 
                onClick={() => setShowBookingForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg w-full"
              >
                Book a Session
              </button>
            </div>
          </div>
          
          {/* Specializations */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Specializations</h2>
            <div className="flex flex-wrap gap-2">
              {trainer.specializations?.map((spec, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {spec}
                </span>
              ))}
              {(!trainer.specializations || trainer.specializations.length === 0) && (
                <span className="text-gray-500">No specializations listed</span>
              )}
            </div>
          </div>
          
          {/* Bio */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {trainer.bio || 'No bio available'}
            </p>
          </div>
          
          {/* Experience and Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">Experience</h2>
              <p className="text-gray-700">
                {trainer.experience ? `${trainer.experience} years of experience` : 'Experience not specified'}
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Certifications</h2>
              {trainer.certifications && trainer.certifications.length > 0 ? (
                <ul className="list-disc list-inside text-gray-700">
                  {trainer.certifications.map((cert, index) => (
                    <li key={index}>{cert}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700">No certifications listed</p>
              )}
            </div>
          </div>
          
          {/* Availability Calendar */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Availability</h2>
            {availabilityLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner />
              </div>
            ) : availability.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                No availability slots found. Please contact the trainer directly.
              </div>
            ) : (
              <AvailabilityCalendar 
                availability={availability} 
                onSlotSelect={() => setShowBookingForm(true)}
              />
            )}
          </div>
          
          {/* Reviews */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            {reviewsLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner />
              </div>
            ) : (
              <ReviewList reviews={reviews} trainerId={id} />
            )}
          </div>
        </div>
      </div>
      
      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Book a Session with {trainer.displayName}</h2>
                <button 
                  onClick={() => setShowBookingForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <BookingForm 
                trainer={trainer} 
                availability={availability}
                onSuccess={() => setShowBookingForm(false)}
                onCancel={() => setShowBookingForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerProfileDetail;
