import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { updateUserPassword } from '../firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const UpdatePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Felder aus');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Fehler', 'Die neuen Passwörter stimmen nicht überein');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Fehler', 'Das neue Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    setLoading(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      Alert.alert('Erfolg', 'Ihr Passwort wurde erfolgreich geändert', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Fehler', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Header 
        title="Passwort ändern"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Aktuelles Passwort"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Neues Passwort"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Neues Passwort bestätigen"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading ? styles.buttonDisabled : null]}
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Passwort ändern</Text>
          )}
        </TouchableOpacity>
      </View>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.background,
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 