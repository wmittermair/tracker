import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HabitItemProps } from '../types/types';

export const HabitItem: React.FC<HabitItemProps> = ({ habit, onToggle, onDelete }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.habitContainer} 
        onPress={() => onToggle(habit.id)}
      >
        <View style={[styles.checkbox, habit.lastCompletedDate ? styles.checked : styles.unchecked]} />
        <View style={styles.textContainer}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.streakText}>🔥 {habit.streak} Tage</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(habit.id)}
      >
        <Text style={styles.deleteText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  habitContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
  },
  checked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  unchecked: {
    backgroundColor: 'transparent',
    borderColor: '#757575',
  },
  habitName: {
    fontSize: 16,
    color: '#333',
  },
  streakText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 24,
    color: '#FF5252',
    fontWeight: 'bold',
  },
}); 