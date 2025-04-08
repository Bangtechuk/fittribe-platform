import React, { useState, useEffect } from 'react';
import { useApi } from '@/contexts/ApiContext';
import Link from 'next/link';

interface Review {
  id: string;
  bookingId: string;
  rating: number;
  comment: string;
  isPublic: boolean;
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

interface ReviewListProps {
  trainerId: string;
  limit?: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ trainerId, limit }) => {
  const { fetchApi } = useApi();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [trainerId]);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchApi<{ error: boolean; data: { reviews: Review[] } }>(
        `/api/trainers/${trainerId}/reviews`
      );
      
      // Calculate average rating
      const total = response.data.reviews.reduce((sum, review) => sum + review.rating, 0);
      const avg = response.data.reviews.length > 0 ? total / response.data.reviews.length : 0;
      setAverageRating(avg);
      
      // If limit is provided, only show that many reviews
      const limitedReviews = limit ? response.data.reviews.slice(0, limit) : response.data.reviews;
      setReviews(limitedReviews);
    } catch (err) {
      setError('Failed to load reviews. Please try again.');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchReviews}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white shadow overflow-hidden sm:rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          This trainer hasn't received any reviews yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Reviews</h3>
          <div className="flex items-center mt-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-sm text-gray-600">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>
          </div>
        </div>
        {limit && reviews.length >= limit && (
          <Link
            href={`/trainers/${trainerId}/reviews`}
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            View All
          </Link>
        )}
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {reviews.map((review) => (
            <li key={review.id} className="p-4">
              <div className="flex space-x-3">
                {review.client.profileImage ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={review.client.profileImage}
                    alt={`${review.client.firstName} ${review.client.lastName}`}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {review.client.firstName.charAt(0)}
                      {review.client.lastName.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {review.client.firstName} {review.client.lastName}
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReviewList;
