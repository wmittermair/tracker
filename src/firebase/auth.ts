import { auth } from './config';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { useState, useEffect } from 'react';

// Registrierung
export const registerUser = async (email: string, password: string): Promise<User> => {
  try {
    if (!email || !password) {
      throw new Error('E-Mail und Passwort sind erforderlich');
    }
    
    if (password.length < 6) {
      throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein');
    }

    console.log('Versuche Registrierung mit:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Registrierung erfolgreich:', userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error('Registrierungsfehler:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Diese E-Mail-Adresse wird bereits verwendet');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Ungültige E-Mail-Adresse');
    }
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('E-Mail/Passwort-Anmeldung ist nicht aktiviert');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Das Passwort ist zu schwach');
    }
    
    throw new Error('Registrierung fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'));
  }
};

// Anmeldung
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    if (!email || !password) {
      throw new Error('E-Mail und Passwort sind erforderlich');
    }

    console.log('Versuche Anmeldung mit:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Anmeldung erfolgreich:', userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error('Anmeldefehler:', error.code, error.message);
    
    switch (error.code) {
      case 'auth/invalid-email':
        throw new Error('Ungültige E-Mail-Adresse');
      case 'auth/user-disabled':
        throw new Error('Dieser Account wurde deaktiviert');
      case 'auth/user-not-found':
        throw new Error('Kein Benutzer mit dieser E-Mail-Adresse gefunden');
      case 'auth/wrong-password':
        throw new Error('Falsches Passwort');
      case 'auth/invalid-credential':
        throw new Error('Ungültige Anmeldedaten. Bitte überprüfen Sie E-Mail und Passwort.');
      case 'auth/too-many-requests':
        throw new Error('Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.');
      case 'auth/network-request-failed':
        throw new Error('Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.');
      default:
        throw new Error('Anmeldung fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'));
    }
  }
};

// Abmeldung
export const logoutUser = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Fehler bei der Abmeldung:', error);
    throw new Error('Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
  }
};

// E-Mail ändern
export const updateUserEmail = async (newEmail: string, password: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Kein Benutzer angemeldet');

  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    await firebaseUpdateEmail(user, newEmail);
  } catch (error: any) {
    console.error('Fehler beim Ändern der E-Mail:', error);
    
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('Bitte melden Sie sich erneut an und versuchen Sie es noch einmal');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Ungültige E-Mail-Adresse');
    }
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Diese E-Mail-Adresse wird bereits verwendet');
    }
    
    throw new Error('E-Mail-Änderung fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'));
  }
};

// Passwort ändern
export const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Kein Benutzer angemeldet');

  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await firebaseUpdatePassword(user, newPassword);
  } catch (error: any) {
    console.error('Fehler beim Ändern des Passworts:', error);
    
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('Bitte melden Sie sich erneut an und versuchen Sie es noch einmal');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Das neue Passwort ist zu schwach');
    }
    
    throw new Error('Passwort-Änderung fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'));
  }
};

// Auth Hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Auth: Initialisiere Auth-Status-Listener');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth: Status geändert:', user ? 'angemeldet' : 'abgemeldet');
      setUser(user);
      setIsLoading(false);
    });

    return () => {
      console.log('Auth: Cleanup Auth-Status-Listener');
      unsubscribe();
    };
  }, []);

  return { user, isLoading };
};

// Exportiere die onAuthStateChanged-Funktion
export { onAuthStateChanged }; 