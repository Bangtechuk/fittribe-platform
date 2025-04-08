import React, { useState, useEffect } from 'react';
import { useFirestore } from '../../contexts/realtime/FirestoreContext';
import { where, orderBy, limit } from 'firebase/firestore';
import { useTrainers } from '../../hooks/realtime/useTrainers';

// Components
import TrainerCard from './TrainerCard';
import FilterSidebar from './FilterSidebar';
import LoadingSpinner from '../ui/LoadingSpinner';

const TrainerListing = () => {
  // Filter state
  const [filters, setFilters] = useState({
    specialization: '',
    minRating: 0,
    maxPrice: 500,
    location: '',
    limitCount: 20
  });

  // Use our custom hook for real-time trainer data
  const { trainers, loading, error } = useTrainers(filters);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Get unique specializations for filter options
  const [specializations, setSpecializations] = useState([]);
  const [locations, setLocations] = useState([]);
  const { getCollection } = useFirestore();

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Get all active trainer profiles
        const allTrainers = await getCollection('trainer_profiles', [
          where('isActive', '==', true)
        ]);
        
        // Extract unique specializations
        const allSpecializations = new Set();
        allTrainers.forEach(trainer => {
          if (trainer.specializations) {
            trainer.specializations.forEach(spec => allSpecializations.add(spec));
          }
        });
        
        // Extract unique locations
        const allLocations = new Set();
        allTrainers.forEach(trainer => {
          if (trainer.location) {
            allLocations.add(trainer.location);
          }
        });
        
        setSpecializations(Array.from(allSpecializations).sort());
        setLocations(Array.from(allLocations).sort());
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    
    fetchFilterOptions();
  }, [getCollection]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Find Your Perfect Fitness Trainer</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter sidebar */}
        <div className="w-full md:w-1/4">
          <FilterSidebar 
            filters={filters}
            onFilterChange={handleFilterChange}
            specializations={specializations}
            locations={locations}
          />
        </div>
        
        {/* Trainer listing */}
        <div className="w-full md:w-3/4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error loading trainers: {error}
            </div>
          ) : trainers.length === 0 ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              No trainers found matching your criteria. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map(trainer => (
                <TrainerCard key={trainer.id} trainer={trainer} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerListing;
