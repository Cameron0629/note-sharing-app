// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDpWdqBSmZTl_CxbFQaUFkld35UtFLVagk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "noteshare-8d888.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "noteshare-8d888",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "noteshare-8d888.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "731832577519",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:731832577519:web:a9bdd14d2b6da04e015a1a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-2D6BFPK8KP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
