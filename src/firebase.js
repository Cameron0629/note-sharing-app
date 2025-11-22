/**
 * firebase.js - Firebase configuration and initialization
 * 
 * This file initializes Firebase services for the application:
 * - Authentication: User login, signup, password reset
 * - Firestore: Database for users, schools, courses, notes
 * - Storage: File storage for note attachments and profile pictures
 * 
 * Used throughout the application via:
 * - AuthContext: Uses 'auth' for authentication
 * - All context providers: Use 'db' for Firestore operations
 * - NotesContext: Uses 'storage' for file uploads
 * - Settings page: Uses 'storage' for profile picture uploads
 * 
 * Environment variables required (in .env file):
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 * - VITE_FIREBASE_MEASUREMENT_ID
 */

import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig); 

// Export Firebase services for use throughout the application
export const auth = getAuth(app); // Authentication service - used in AuthContext
export const db = getFirestore(app); // Firestore database - used in all context providers
export const storage = getStorage(app); // Storage service - used for file uploads

// Set authentication persistence to local storage (keeps user logged in across page refreshes)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});

export default app;
