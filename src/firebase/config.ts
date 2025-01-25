import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyBxOUbIDu5LLfxLaEZbiApNIRoAFHh1TjM",
  authDomain: "wolfgang-habit-tracker.firebaseapp.com",
  projectId: "wolfgang-habit-tracker",
  storageBucket: "wolfgang-habit-tracker.firebasestorage.app",
  messagingSenderId: "705064687909",
  appId: "1:705064687909:web:20861ec8882e18cc9ae2cc"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);

// Firestore initialisieren
const db = getFirestore(app);

export { db };
export default app; 