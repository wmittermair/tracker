import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, AuthError, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged as firebaseAuthStateChanged } from 'firebase/auth';
import { auth } from './config';

// Registrierung
export const registerUser = async (email: string, password: string): Promise<User> => {
  try {
    if (!email || !password) {
      throw new Error('E-Mail und Passwort sind erforderlich');
    }
    
    if (password.length < 6) {
      throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    // Firebase Auth Fehlercodes übersetzen
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
    
    // Fallback für unbekannte Fehler
    throw new Error(error.message || 'Registrierung fehlgeschlagen');
  }
};

// Anmeldung
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    if (!email || !password) {
      throw new Error('E-Mail und Passwort sind erforderlich');
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    if (error.code === 'auth/invalid-email') {
      throw new Error('Ungültige E-Mail-Adresse');
    }
    if (error.code === 'auth/user-disabled') {
      throw new Error('Dieser Account wurde deaktiviert');
    }
    if (error.code === 'auth/user-not-found') {
      throw new Error('Kein Benutzer mit dieser E-Mail-Adresse gefunden');
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error('Falsches Passwort');
    }
    throw new Error('Anmeldung fehlgeschlagen');
  }
};

// Abmeldung
export const logoutUser = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starte Abmeldung...');
      
      // Prüfe, ob ein Benutzer angemeldet ist
      if (!auth.currentUser) {
        console.log('Kein Benutzer angemeldet');
        resolve();
        return;
      }

      // Registriere einen einmaligen Listener für den Abmeldestatus
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (!user) {
          console.log('Abmeldung erfolgreich bestätigt');
          unsubscribe(); // Entferne den Listener
          resolve();
        }
      });

      // Führe die Abmeldung durch
      signOut(auth).catch((error) => {
        console.error('Fehler bei der Abmeldung:', error);
        unsubscribe(); // Entferne den Listener
        reject(new Error('Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'));
      });
    } catch (error) {
      console.error('Unerwarteter Fehler bei der Abmeldung:', error);
      reject(new Error('Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'));
    }
  });
};

// Aktueller Benutzer
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Auth Status Listener
export const onAuthStateChanged = (callback: (user: User | null) => void): (() => void) => {
  console.log('Registriere Auth-Status-Listener');
  return firebaseAuthStateChanged(auth, (user) => {
    console.log('Auth-Status geändert:', user ? 'Benutzer angemeldet' : 'Benutzer abgemeldet');
    callback(user);
  });
};

// E-Mail ändern
export const updateUserEmail = async (newEmail: string, password: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Kein Benutzer angemeldet');

  try {
    // Reauthorisierung
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    // E-Mail aktualisieren
    await updateEmail(user, newEmail);
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('Bitte melden Sie sich erneut an und versuchen Sie es noch einmal');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Ungültige E-Mail-Adresse');
    }
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Diese E-Mail-Adresse wird bereits verwendet');
    }
    throw new Error(error.message);
  }
};

// Passwort ändern
export const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Kein Benutzer angemeldet');

  try {
    // Reauthorisierung
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Passwort aktualisieren
    await updatePassword(user, newPassword);
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('Bitte melden Sie sich erneut an und versuchen Sie es noch einmal');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Das neue Passwort ist zu schwach');
    }
    throw new Error(error.message);
  }
}; 