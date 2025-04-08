import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';
import { useMockAuth } from '../../contexts/mock/MockAuthContext';

const AuthPage = () => {
  const router = useRouter();
  const { type } = router.query;
  const { signIn, signUp } = useMockAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isLogin = type === 'login';
  const pageTitle = isLogin ? 'Login' : 'Sign Up';
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
        router.push('/dashboard');
      } else {
        await signUp(email, password, name, role);
        router.push('/dashboard');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>{pageTitle} | FitTribe.fitness</title>
        <meta name="description" content={`${pageTitle} to FitTribe.fitness to connect with fitness trainers or find clients.`} />
      </Head>
      
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">{pageTitle}</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            {!isLogin && (
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  I am a:
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="client"
                      checked={role === 'client'}
                      onChange={() => setRole('client')}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Client</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="trainer"
                      checked={role === 'trainer'}
                      onChange={() => setRole('trainer')}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Trainer</span>
                  </label>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Processing...' : pageTitle}
              </button>
            </div>
          </form>
          
          <div className="text-center mt-6">
            {isLogin ? (
              <p className="text-gray-600">
                Don't have an account?{' '}
                <a
                  href="/auth/register"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Sign up
                </a>
              </p>
            ) : (
              <p className="text-gray-600">
                Already have an account?{' '}
                <a
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Login
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
