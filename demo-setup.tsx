import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Components
import Layout from '../../components/layout/Layout';
import DemoSetup from '../../components/admin/DemoSetup';
import { useFirebaseAuth } from '../../contexts/realtime/FirebaseAuthContext';

const DemoSetupPage = () => {
  const router = useRouter();
  const { user, loading } = useFirebaseAuth();
  
  // Redirect to login if not authenticated or not admin
  React.useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }
  
  if (!user || user.role !== 'admin') {
    return null; // Will redirect to login
  }
  
  return (
    <Layout>
      <Head>
        <title>Demo Setup | FitTribe.fitness</title>
        <meta name="description" content="Set up demo data for FitTribe.fitness platform testing." />
      </Head>
      
      <DemoSetup />
    </Layout>
  );
};

export default DemoSetupPage;
