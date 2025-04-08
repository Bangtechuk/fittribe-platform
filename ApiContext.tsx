import { createContext, useContext, useState, ReactNode } from 'react';

interface ApiContextType {
  fetchApi: <T>(endpoint: string, options?: RequestInit) => Promise<T>;
  isLoading: boolean;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchApi = async <T,>(endpoint: string, options?: RequestInit): Promise<T> => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
      
      // Get token from localStorage if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options?.headers || {})
      };

      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ApiContext.Provider
      value={{
        fetchApi,
        isLoading
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
