import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Modal, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SPACING, TYPOGRAPHY } from '../theme/theme';
import { Card } from './Card';
import { Button } from './Button';

interface AddHabitDialogProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export const AddHabitDialog: React.FC<AddHabitDialogProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [habitName, setHabitName] = useState('');

  const handleAdd = () => {
    if (habitName.trim()) {
      onAdd(habitName.trim());
      setHabitName('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Card variant="elevated" style={styles.container}>
          <Text style={styles.title}>Neuer Habit</Text>
          <TextInput
            style={styles.input}
            placeholder="Name des Habits"
            placeholderTextColor={COLORS.textSecondary}
            value={habitName}
            onChangeText={setHabitName}
            autoFocus
          />
          <View style={styles.buttons}>
            <Button
              title="Abbrechen"
              variant="outline"
              onPress={onClose}
              style={styles.button}
            />
            <Button
              title="Hinzufügen"
              onPress={handleAdd}
              style={styles.button}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 800,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    ...FONT.regular,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: SPACING.sm,
    minWidth: 120,
  },
}); 