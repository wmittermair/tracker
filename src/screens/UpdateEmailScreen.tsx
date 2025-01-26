import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { updateUserEmail } from '../firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const UpdateEmailScreen: React.FC<Props> = ({ navigation }) => {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateEmail = async () => {
    if (!newEmail || !password) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Felder aus');
      return;
    }

    setLoading(true);
    try {
      await updateUserEmail(newEmail, password);
      Alert.alert('Erfolg', 'Ihre E-Mail-Adresse wurde erfolgreich geändert', [
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
        title="E-Mail ändern"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Neue E-Mail-Adresse"
          value={newEmail}
          onChangeText={setNewEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Aktuelles Passwort"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading ? styles.buttonDisabled : null]}
          onPress={handleUpdateEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>E-Mail ändern</Text>
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