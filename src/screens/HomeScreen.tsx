import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, ScrollView, ActivityIndicator } from 'react-native';
import { HabitItem } from '../components/HabitItem';
import { Habit } from '../types/types';
import { addHabit, loadHabits, toggleHabit, deleteHabit, testFirestore } from '../firebase/habits';
import { useAuth } from '../firebase/auth';

export const HomeScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newHabitName, setNewHabitName] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadHabitData();
    } else {
      setHabits([]);
    }
  }, [user]);

  const loadHabitData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const loadedHabits = await loadHabits(user.uid);
      setHabits(loadedHabits);
    } catch (error) {
      console.error('Fehler beim Laden der Habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim() || !user) return;
    
    try {
      const newHabit = await addHabit(user.uid, newHabitName.trim());
      setHabits(prevHabits => [newHabit, ...prevHabits]);
      setNewHabitName('');
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Habits:', error);
    }
  };

  const handleToggleHabit = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      try {
        await toggleHabit(habit);
        await loadHabitData();
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Habits:', error);
      }
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await deleteHabit(id);
      setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
    } catch (error) {
      console.error('Fehler beim Löschen des Habits:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newHabitName}
          onChangeText={setNewHabitName}
          placeholder="Neuer Habit..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddHabit}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.habitList}>
        {habits.map(habit => (
          <HabitItem
            key={habit.id}
            habit={habit}
            onToggle={handleToggleHabit}
            onDelete={handleDeleteHabit}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    margin: 10,
    borderRadius: 4,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#4CAF50',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  habitList: {
    flex: 1,
  },
}); 