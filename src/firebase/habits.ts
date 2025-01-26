import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, query, orderBy, where } from 'firebase/firestore';
import { db } from './config';
import { Habit, HabitEntry } from '../types/types';

const COLLECTION_NAME = 'habits';

// Test-Funktion
export const testFirestore = async () => {
  try {
    const testData = {
      name: "Test Habit",
      createdAt: Timestamp.now(),
      streak: 0,
      lastCompletedDate: null,
      history: []
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), testData);
    console.log("Test-Dokument erstellt mit ID:", docRef.id);
    
    // Direkt wieder löschen
    await deleteDoc(doc(db, COLLECTION_NAME, docRef.id));
    console.log("Test-Dokument erfolgreich gelöscht");
    
    return true;
  } catch (error) {
    console.error("Firestore-Test fehlgeschlagen:", error);
    return false;
  }
};

// Habit hinzufügen
export const addHabit = async (userId: string, name: string): Promise<Habit> => {
  console.log('Füge Habit hinzu für User:', userId, 'Name:', name);
  const habitData = {
    userId,
    name,
    createdAt: Timestamp.now(),
    streak: 0,
    lastCompletedDate: null,
    history: []
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), habitData);
    console.log('Habit erfolgreich hinzugefügt mit ID:', docRef.id);
    return {
      id: docRef.id,
      ...habitData,
      history: []
    };
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Habits:', error);
    throw error;
  }
};

// Alle Habits laden
export const loadHabits = async (userId: string): Promise<Habit[]> => {
  console.log('Lade Habits für User:', userId);
  try {
    // Optimierte Abfrage mit Index
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const habits = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Habit[];
    
    console.log('Geladene Habits:', habits);
    return habits;
  } catch (error) {
    console.error('Fehler beim Laden der Habits:', error);
    throw error;
  }
};

// Habit als erledigt/nicht erledigt markieren
export const toggleHabit = async (habit: Habit): Promise<void> => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Wenn der Habit bereits heute abgeschlossen wurde
    const lastCompletedDate = habit.lastCompletedDate ? new Date(habit.lastCompletedDate) : null;
    const lastCompletedDay = lastCompletedDate?.toISOString().split('T')[0];
    
    const entry: HabitEntry = {
      date: today,
      completed: !habit.lastCompletedDate || lastCompletedDay !== today,
      timestamp: now
    };

    // Streak-Logik
    let newStreak = habit.streak;
    if (!habit.lastCompletedDate || lastCompletedDay !== today) {
      // Wenn der Habit noch nicht heute abgeschlossen wurde, erhöhe den Streak
      newStreak = habit.streak + 1;
    } else {
      // Wenn der Habit bereits heute abgeschlossen wurde, setze den Streak zurück
      newStreak = 0;
    }

    const docRef = doc(db, COLLECTION_NAME, habit.id);
    await updateDoc(docRef, {
      lastCompletedDate: !habit.lastCompletedDate || lastCompletedDay !== today ? now : null,
      streak: newStreak,
      history: [...habit.history, entry]
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Habits:', error);
    throw error;
  }
};

// Habit löschen
export const deleteHabit = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Fehler beim Löschen des Habits:', error);
    throw error;
  }
};

export const getHabits = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'habits'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Fehler beim Laden der Gewohnheiten:', error);
    throw error;
  }
}; 