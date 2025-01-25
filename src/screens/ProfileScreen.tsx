import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { getCurrentUser, logoutUser } from '../firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { LogoutDialog } from '../components/LogoutDialog';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const user = getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    
    setLoading(true);
    console.log('ProfileScreen: Starte Abmeldung');
    
    try {
      await logoutUser();
      console.log('ProfileScreen: Abmeldung erfolgreich');
      
      // Navigiere zum Auth-Screen und lösche den Navigation-Stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'Auth' }
          ]
        })
      );
    } catch (error: any) {
      console.error('ProfileScreen: Abmeldefehler:', error);
      setShowLogoutDialog(false);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    console.log('ProfileScreen: Kein Benutzer gefunden');
    return null;
  }

  return (
    <View style={styles.container}>
      <LogoutDialog
        visible={showLogoutDialog}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />

      <View style={styles.profileHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {user.email?.[0].toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.emailText}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Konto</Text>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('UpdateEmail')}
          disabled={loading}
        >
          <Text style={[styles.menuItemText, loading && styles.textDisabled]}>
            E-Mail ändern
          </Text>
          <Ionicons name="chevron-forward" size={20} color={loading ? '#ccc' : '#999'} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('UpdatePassword')}
          disabled={loading}
        >
          <Text style={[styles.menuItemText, loading && styles.textDisabled]}>
            Passwort ändern
          </Text>
          <Ionicons name="chevron-forward" size={20} color={loading ? '#ccc' : '#999'} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, loading && styles.buttonDisabled]}
        onPress={() => setShowLogoutDialog(true)}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.logoutButtonText}>Abmelden</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  emailText: {
    fontSize: 16,
    color: '#333',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  textDisabled: {
    color: '#ccc',
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: '#ffaa99',
  },
  logoutButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 