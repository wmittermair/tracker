import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { GeminiMessage } from '../services/gemini';

const CHATS_COLLECTION = 'chats';

export const saveMessage = async (userId: string, message: GeminiMessage) => {
  try {
    console.log('Speichere Nachricht für User:', userId, message);
    const messageData = {
      userId,
      role: message.role,
      content: message.content,
      timestamp: Timestamp.fromMillis(message.timestamp)
    };
    
    const docRef = await addDoc(collection(db, CHATS_COLLECTION), messageData);
    console.log('Nachricht erfolgreich gespeichert mit ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Fehler beim Speichern der Nachricht:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Keine Berechtigung zum Speichern der Nachricht');
    }
    throw error;
  }
};

export const getChatHistory = async (userId: string): Promise<GeminiMessage[]> => {
  try {
    console.log('Lade Chat-Verlauf für User:', userId);
    
    // Erstelle die Abfrage mit Index
    const q = query(
      collection(db, CHATS_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    console.log('Rohe Nachrichten geladen:', querySnapshot.size);

    const messages = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        role: data.role as 'user' | 'assistant',
        content: data.content,
        timestamp: data.timestamp.toMillis()
      };
    });
    
    console.log('Verarbeitete Nachrichten:', messages.length);
    return messages;
  } catch (error: any) {
    console.error('Fehler beim Laden des Chat-Verlaufs:', error);
    
    // Wenn der Index fehlt, geben Sie eine hilfreiche Fehlermeldung aus
    if (error.code === 'failed-precondition' || error.message?.includes('requires an index')) {
      console.error('Index fehlt. Bitte erstellen Sie den Index in der Firebase Console.');
      throw new Error('Datenbank-Index fehlt. Bitte kontaktieren Sie den Administrator.');
    }
    
    throw error;
  }
}; 