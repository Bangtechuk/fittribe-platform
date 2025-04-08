import React, { useState } from 'react';
import { useApi } from '@/contexts/ApiContext';
import { useRouter } from 'next/router';

interface PaymentFormProps {
  bookingId: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ bookingId }) => {
  const { fetchApi } = useApi();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In a real implementation, we would use Stripe Elements or similar
      // For now, we'll simulate the payment process
      
      // 1. Create payment intent
      const intentResponse = await fetchApi<{ error: boolean; data: { clientSecret: string } }>(
        '/api/payments/create-payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({ bookingId })
        }
      );
      
      const { clientSecret } = intentResponse.data;
      
      // 2. Confirm payment (in a real app, this would be handled by Stripe)
      await fetchApi('/api/payments/confirm-payment', {
        method: 'POST',
        body: JSON.stringify({ paymentIntentId: clientSecret.split('_secret_')[0] })
      });
      
      // 3. Redirect to success page
      router.push(`/bookings/${bookingId}/payment-success`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">Payment Details</h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Complete your payment to confirm your booking
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
              Card Number
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                required
                value={cardDetails.cardNumber}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700">
              Card Holder Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="cardHolder"
                name="cardHolder"
                placeholder="John Doe"
                required
                value={cardDetails.cardHolder}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  required
                  value={cardDetails.expiryDate}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                CVV
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  placeholder="123"
                  required
                  value={cardDetails.cvv}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm font-medium">$75.00</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Platform Fee</span>
              <span className="text-sm font-medium">$7.50</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-base font-medium text-gray-900">Total</span>
              <span className="text-base font-medium text-gray-900">$82.50</span>
            </div>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
