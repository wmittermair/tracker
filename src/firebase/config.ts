import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyBxOUbIDu5LLfxLaEZbiApNIRoAFHh1TjM",
  authDomain: "wolfgang-habit-tracker.firebaseapp.com",
  projectId: "wolfgang-habit-tracker",
  storageBucket: "wolfgang-habit-tracker.appspot.com",
  messagingSenderId: "705064687909",
  appId: "1:705064687909:web:20861ec8882e18cc9ae2cc"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);

// Auth initialisieren
const auth = getAuth(app);

// Persistenz auf "local" setzen
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase Auth Persistenz auf "local" gesetzt');
  })
  .catch((error) => {
    console.error('Fehler beim Setzen der Persistenz:', error);
  });

// Firestore initialisieren
const db = getFirestore(app);

export { db, auth };
export default app; 