import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { useFirebaseAuth } from './FirebaseAuthContext';

// Create the Firestore context
const FirestoreContext = createContext({
  getDocument: async () => {},
  getCollection: async () => {},
  subscribeToDocument: () => () => {},
  subscribeToCollection: () => () => {},
  addDocument: async () => {},
  updateDocument: async () => {},
  deleteDocument: async () => {}
});

// Custom hook to use the Firestore context
export const useFirestore = () => {
  return useContext(FirestoreContext);
};

// Provider component
export const FirestoreProvider = ({ children }) => {
  const { user } = useFirebaseAuth();

  // Get a single document
  const getDocument = async (collectionName, documentId) => {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting document:", error);
      throw error;
    }
  };

  // Get a collection of documents
  const getCollection = async (collectionName, constraints = []) => {
    try {
      let q = collection(firestore, collectionName);
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting collection:", error);
      throw error;
    }
  };

  // Subscribe to a single document
  const subscribeToDocument = (collectionName, documentId, callback) => {
    const docRef = doc(firestore, collectionName, documentId);
    
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error("Error subscribing to document:", error);
    });
    
    return unsubscribe;
  };

  // Subscribe to a collection of documents
  const subscribeToCollection = (collectionName, callback, constraints = []) => {
    let q = collection(firestore, collectionName);
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(documents);
    }, (error) => {
      console.error("Error subscribing to collection:", error);
    });
    
    return unsubscribe;
  };

  // Add a document to a collection
  const addDocument = async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(firestore, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user?.uid || null
      });
      
      return docRef.id;
    } catch (error) {
      console.error("Error adding document:", error);
      throw error;
    }
  };

  // Update a document
  const updateDocument = async (collectionName, documentId, data) => {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || null
      });
      
      return true;
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  };

  // Delete a document
  const deleteDocument = async (collectionName, documentId) => {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      await deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  };

  const value = {
    getDocument,
    getCollection,
    subscribeToDocument,
    subscribeToCollection,
    addDocument,
    updateDocument,
    deleteDocument
  };

  return (
    <FirestoreContext.Provider value={value}>
      {children}
    </FirestoreContext.Provider>
  );
};

export { FirestoreContext };
