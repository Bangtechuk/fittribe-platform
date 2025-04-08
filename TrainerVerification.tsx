import React, { useState, useEffect } from 'react';
import { useApi } from '@/contexts/ApiContext';
import Link from 'next/link';

interface PendingTrainer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  created_at: string;
  bio: string;
  specializations: string[];
  years_experience: number;
  location: string;
}

const TrainerVerification: React.FC = () => {
  const { fetchApi } = useApi();
  const [pendingTrainers, setPendingTrainers] = useState<PendingTrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingTrainers();
  }, []);

  const fetchPendingTrainers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchApi<{ error: boolean; data: { pendingTrainers: PendingTrainer[] } }>(
        '/api/admin/users/pending'
      );
      setPendingTrainers(response.data.pendingTrainers);
    } catch (err) {
      setError('Failed to load pending trainer verifications. Please try again.');
      console.error('Error fetching pending trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      await fetchApi(`/api/admin/users/${id}/verify`, {
        method: 'POST'
      });
      // Remove the verified trainer from the list
      setPendingTrainers(pendingTrainers.filter(trainer => trainer.id !== id));
    } catch (err) {
      setError('Failed to verify trainer. Please try again.');
      console.error('Error verifying trainer:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          onClick={fetchPendingTrainers}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (pendingTrainers.length === 0) {
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No pending verifications</h3>
        <p className="mt-1 text-sm text-gray-500">
          All trainer profiles have been verified.
        </p>
        <div className="mt-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Trainer Verifications</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Review and verify trainer profiles before they can start offering services.
        </p>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {pendingTrainers.map((trainer) => (
            <li key={trainer.id} className="p-4 sm:p-6">
              <div className="flex items-start space-x-4 sm:space-x-6">
                {trainer.profile_image ? (
                  <img
                    className="h-16 w-16 rounded-full"
                    src={trainer.profile_image}
                    alt={`${trainer.first_name} ${trainer.last_name}`}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center">
                    <span className="text-xl font-bold">
                      {trainer.first_name.charAt(0)}
                      {trainer.last_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {trainer.first_name} {trainer.last_name}
                      </h4>
                      <p className="text-sm text-gray-500">{trainer.email}</p>
                      <p className="text-sm text-gray-500">
                        Joined: {formatDate(trainer.created_at)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleVerify(trainer.id)}
                        disabled={verifyingId === trainer.id}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {verifyingId === trainer.id ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-900">Bio</h5>
                    <p className="mt-1 text-sm text-gray-600">{trainer.bio}</p>
                  </div>
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-900">Specializations</h5>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {trainer.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">Experience</h5>
                      <p className="mt-1 text-sm text-gray-600">{trainer.years_experience} years</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">Location</h5>
                      <p className="mt-1 text-sm text-gray-600">{trainer.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrainerVerification;
