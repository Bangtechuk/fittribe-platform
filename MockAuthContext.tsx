import React, { createContext, useContext, useState } from 'react';
import mockData from '../../utils/mockData';

// Create a mock auth context
const MockAuthContext = createContext({
  user: null,
  loading: false,
  signIn: async () => {},
  signUp: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {}
});

// Custom hook to use the mock auth context
export const useMockAuth = () => {
  return useContext(MockAuthContext);
};

// Provider component
export const MockAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock sign in function
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = mockData.users[email];
      if (mockUser && mockUser.password === password) {
        setUser(mockUser);
        return mockUser;
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mock sign up function
  const signUp = async (email, password, displayName, role = 'client') => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (mockData.users[email]) {
        throw new Error('Email already in use');
      }
      
      // Create new user (in a real app, this would be saved to the database)
      const newUser = {
        id: `user${Object.keys(mockData.users).length + 1}`,
        name: displayName,
        email: email,
        password: password,
        role: role,
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
      };
      
      // In a real app, we would add this user to the database
      // For the mock, we'll just set it in state
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mock logout function
  const logout = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  // Mock update profile function
  const updateUserProfile = async (displayName, photoURL) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = {
          ...user,
          name: displayName || user.name,
          profileImage: photoURL || user.profileImage
        };
        
        setUser(updatedUser);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    updateUserProfile
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};

export default MockAuthContext;
