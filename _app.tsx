import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Import mock providers instead of Firebase providers
import { MockAuthProvider } from '../contexts/mock/MockAuthContext';
import { MockDataProvider } from '../contexts/mock/MockDataContext';

// Wrap the entire application with necessary mock providers
const MyApp = ({ Component, pageProps }) => {
  return (
    <MockAuthProvider>
      <MockDataProvider>
        <Head>
          <title>FitTribe.fitness - Find Your Perfect Fitness Trainer</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="Connect with certified fitness trainers for personalized virtual sessions. Book, train, and achieve your fitness goals with FitTribe.fitness." />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </Head>
        
        <Component {...pageProps} />
      </MockDataProvider>
    </MockAuthProvider>
  );
};

export default MyApp;
