import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { UpdateEmailScreen } from '../screens/UpdateEmailScreen';
import { UpdatePasswordScreen } from '../screens/UpdatePasswordScreen';
import { Ionicons } from '@expo/vector-icons';
import { CoachChatScreen } from '../screens/CoachChatScreen';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{
          title: 'Profil',
        }}
      />
      <ProfileStack.Screen 
        name="UpdateEmail" 
        component={UpdateEmailScreen}
        options={{
          title: 'E-Mail ändern',
        }}
      />
      <ProfileStack.Screen 
        name="UpdatePassword" 
        component={UpdatePasswordScreen}
        options={{
          title: 'Passwort ändern',
        }}
      />
    </ProfileStack.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'CoachChat') {
            iconName = focused ? 'chat' : 'chat-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Übersicht',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{
          title: 'Profil',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="CoachChat"
        component={CoachChatScreen}
        options={{
          tabBarLabel: 'Coach',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}; 