import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'trainer' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['client', 'trainer', 'admin'] 
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${router.asPath}`);
    } else if (!isLoading && isAuthenticated && user && !allowedRoles.includes(user.role)) {
      // Redirect based on role
      if (user.role === 'client') {
        router.push('/dashboard');
      } else if (user.role === 'trainer') {
        router.push('/trainer/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
