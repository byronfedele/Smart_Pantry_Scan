// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../../App'; // Assuming your current App.tsx is your HomeScreen
import LocationsScreen from '../screens/LocationsScreen'; // We'll create this next

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Scanner' }} />
        <Stack.Screen name="Locations" component={LocationsScreen} options={{ title: 'Storage Locations' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;