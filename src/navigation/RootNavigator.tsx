import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, getCurrentUser } from '../firebase/auth';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { User } from 'firebase/auth';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('RootNavigator: Initialisiere Auth-Status-Listener');
    
    // Setze initialen Status auf nicht angemeldet
    setUser(null);
    
    const unsubscribe = onAuthStateChanged((newUser) => {
      console.log('RootNavigator: Auth-Status geändert:', newUser ? 'angemeldet' : 'abgemeldet');
      setUser(newUser);
      setLoading(false);
    });

    return () => {
      console.log('RootNavigator: Cleanup Auth-Status-Listener');
      unsubscribe();
      // Setze User-Status beim Cleanup zurück
      setUser(null);
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen 
            name="Main" 
            component={MainNavigator}
            options={{ 
              animationTypeForReplace: 'pop',
              animation: 'fade'
            }}
          />
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{ 
              animationTypeForReplace: 'pop',
              animation: 'fade'
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 