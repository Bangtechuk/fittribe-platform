import React from 'react';
import Link from 'next/link';
import { useTrainerRating } from '../../hooks/realtime/useReviews';
import { useTrainerAvailability } from '../../hooks/realtime/useTrainers';

// UI Components
import RatingStars from '../ui/RatingStars';
import AvailabilityIndicator from '../ui/AvailabilityIndicator';

const TrainerCard = ({ trainer }) => {
  // Get real-time rating data
  const { averageRating, reviewCount, loading: ratingLoading } = useTrainerRating(trainer.id);
  
  // Get real-time availability data
  const { availability, loading: availabilityLoading } = useTrainerAvailability(trainer.id);
  
  // Check if trainer has availability in the next 24 hours
  const hasImmediateAvailability = () => {
    if (availabilityLoading || !availability.length) return false;
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return availability.some(slot => {
      const slotDate = new Date(slot.startTime.seconds * 1000);
      return !slot.isBooked && slotDate >= now && slotDate <= tomorrow;
    });
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Trainer Image */}
      <div className="relative h-48 bg-gray-200">
        {trainer.photoURL ? (
          <img 
            src={trainer.photoURL} 
            alt={trainer.displayName} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-4xl text-gray-500">
              {trainer.displayName?.charAt(0) || 'T'}
            </span>
          </div>
        )}
        
        {/* Verification badge */}
        {trainer.isVerified && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Verified
          </div>
        )}
        
        {/* Real-time availability indicator */}
        <div className="absolute bottom-2 right-2">
          <AvailabilityIndicator 
            isAvailable={hasImmediateAvailability()} 
            loading={availabilityLoading}
          />
        </div>
      </div>
      
      {/* Trainer Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-800">{trainer.displayName}</h3>
          <span className="text-lg font-bold text-blue-600">{formatPrice(trainer.hourlyRate)}/hr</span>
        </div>
        
        {/* Specializations */}
        <div className="mb-2 flex flex-wrap gap-1">
          {trainer.specializations?.slice(0, 3).map((spec, index) => (
            <span 
              key={index} 
              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
            >
              {spec}
            </span>
          ))}
          {trainer.specializations?.length > 3 && (
            <span className="text-gray-500 text-xs">+{trainer.specializations.length - 3} more</span>
          )}
        </div>
        
        {/* Location */}
        {trainer.location && (
          <div className="text-sm text-gray-600 mb-2">
            <i className="fas fa-map-marker-alt mr-1"></i> {trainer.location}
          </div>
        )}
        
        {/* Real-time ratings */}
        <div className="flex items-center mb-3">
          <RatingStars 
            rating={ratingLoading ? 0 : averageRating} 
            size="small" 
          />
          <span className="ml-1 text-sm text-gray-600">
            {ratingLoading ? 'Loading...' : `${averageRating.toFixed(1)} (${reviewCount} reviews)`}
          </span>
        </div>
        
        {/* Short bio */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {trainer.bio || 'No bio available'}
        </p>
        
        {/* Action buttons */}
        <div className="flex justify-between">
          <Link 
            href={`/trainers/${trainer.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Profile
          </Link>
          <Link 
            href={`/trainers/${trainer.id}?book=true`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TrainerCard;
