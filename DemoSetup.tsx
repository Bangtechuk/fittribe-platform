import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';
import { seedDatabase } from '../../utils/seedDatabase';

const DemoSetup = () => {
  const { user } = useFirebaseAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingComplete, setSeedingComplete] = useState(false);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);

  // Function to handle database seeding
  const handleSeedDatabase = async () => {
    if (!user || user.role !== 'admin') {
      setError('Only admin users can seed the database');
      return;
    }

    setIsSeeding(true);
    setLog(prev => [...prev, 'Starting database seeding...']);

    try {
      // Override console.log to capture logs
      const originalConsoleLog = console.log;
      console.log = (message) => {
        setLog(prev => [...prev, message]);
        originalConsoleLog(message);
      };

      await seedDatabase();
      
      // Restore original console.log
      console.log = originalConsoleLog;
      
      setSeedingComplete(true);
      setLog(prev => [...prev, 'Database seeding completed successfully!']);
    } catch (err) {
      setError(`Error seeding database: ${err.message}`);
      setLog(prev => [...prev, `ERROR: ${err.message}`]);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Demo Environment Setup</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Seed Database with Demo Data</h2>
        <p className="mb-4 text-gray-700">
          This will create sample users, trainers, services, and availability slots for demonstration purposes.
          The following data will be created:
        </p>
        
        <ul className="list-disc pl-6 mb-6 text-gray-700">
          <li>5 trainer profiles with services and availability</li>
          <li>3 client users</li>
          <li>1 admin user</li>
        </ul>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Demo Credentials:</h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm">
            <p className="mb-2"><strong>Admin:</strong> admin@fittribe.fitness / Admin123!</p>
            <p className="mb-2"><strong>Client:</strong> demo@example.com / Demo123!</p>
            <p><strong>Trainer:</strong> alex.fitness@example.com / Password123!</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding || seedingComplete}
            className={`px-4 py-2 rounded font-medium ${
              isSeeding || seedingComplete
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSeeding ? 'Seeding Database...' : seedingComplete ? 'Database Seeded' : 'Seed Database'}
          </button>
          
          {seedingComplete && (
            <span className="ml-3 text-green-600 flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Complete
            </span>
          )}
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
      
      {/* Log output */}
      {log.length > 0 && (
        <div className="bg-black rounded-lg shadow-md p-4">
          <h3 className="text-white font-medium mb-2">Seeding Log:</h3>
          <div className="bg-gray-900 p-4 rounded font-mono text-sm text-green-400 h-64 overflow-y-auto">
            {log.map((line, index) => (
              <div key={index} className="mb-1">
                {line.startsWith('ERROR') ? (
                  <span className="text-red-400">{line}</span>
                ) : (
                  line
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Testing instructions */}
      {seedingComplete && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">1. Test Client Experience:</h3>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Log in as demo@example.com / Demo123!</li>
              <li>Browse available trainers and view their profiles</li>
              <li>Book a session with a trainer</li>
              <li>Check your upcoming sessions in the dashboard</li>
              <li>Test the real-time notification system</li>
            </ol>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">2. Test Trainer Experience:</h3>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Log in as alex.fitness@example.com / Password123!</li>
              <li>View your trainer profile and services</li>
              <li>Manage your availability</li>
              <li>Accept or decline booking requests</li>
              <li>Check your earnings and session history</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">3. Test Admin Experience:</h3>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Log in as admin@fittribe.fitness / Admin123!</li>
              <li>View the admin dashboard with real-time analytics</li>
              <li>Manage users and trainer verifications</li>
              <li>Monitor payments and platform activity</li>
              <li>Test system-wide notifications</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoSetup;
