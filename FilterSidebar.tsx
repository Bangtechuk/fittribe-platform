import React, { useState } from 'react';
import { Range } from 'react-range';

const FilterSidebar = ({ filters, onFilterChange, specializations, locations }) => {
  // Local state for range sliders
  const [localRating, setLocalRating] = useState([filters.minRating]);
  const [localPrice, setLocalPrice] = useState([filters.maxPrice]);

  // Handle specialization change
  const handleSpecializationChange = (e) => {
    onFilterChange({ specialization: e.target.value });
  };

  // Handle location change
  const handleLocationChange = (e) => {
    onFilterChange({ location: e.target.value });
  };

  // Handle rating change (final)
  const handleRatingFinalChange = (values) => {
    onFilterChange({ minRating: values[0] });
  };

  // Handle price change (final)
  const handlePriceFinalChange = (values) => {
    onFilterChange({ maxPrice: values[0] });
  };

  // Reset all filters
  const handleReset = () => {
    setLocalRating([0]);
    setLocalPrice([500]);
    onFilterChange({
      specialization: '',
      minRating: 0,
      maxPrice: 500,
      location: ''
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4">Filter Trainers</h2>

      {/* Specialization Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Specialization
        </label>
        <select
          value={filters.specialization}
          onChange={handleSpecializationChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Specializations</option>
          {specializations.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <select
          value={filters.location}
          onChange={handleLocationChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Minimum Rating: {localRating[0].toFixed(1)}
        </label>
        <Range
          step={0.5}
          min={0}
          max={5}
          values={localRating}
          onChange={setLocalRating}
          onFinalChange={handleRatingFinalChange}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="w-full h-1 bg-gray-200 rounded-full"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                  (localRating[0] / 5) * 100
                }%, #E5E7EB ${(localRating[0] / 5) * 100}%, #E5E7EB 100%)`
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              className="w-4 h-4 bg-blue-600 rounded-full shadow focus:outline-none"
            />
          )}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Maximum Price: ${localPrice[0]}
        </label>
        <Range
          step={10}
          min={0}
          max={500}
          values={localPrice}
          onChange={setLocalPrice}
          onFinalChange={handlePriceFinalChange}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="w-full h-1 bg-gray-200 rounded-full"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                  (localPrice[0] / 500) * 100
                }%, #E5E7EB ${(localPrice[0] / 500) * 100}%, #E5E7EB 100%)`
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              className="w-4 h-4 bg-blue-600 rounded-full shadow focus:outline-none"
            />
          )}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>$0</span>
          <span>$100</span>
          <span>$200</span>
          <span>$300</span>
          <span>$400</span>
          <span>$500</span>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default FilterSidebar;
