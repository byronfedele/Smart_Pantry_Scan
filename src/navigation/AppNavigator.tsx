// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import LocationsScreen from '../screens/LocationsScreen';
import AddItemScreen from '../screens/addInventoryItem'; // Import the AddItemScreen
import { RootStackParamList } from './navigationTypes';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Scanner' }} />
        <Stack.Screen name="Locations" component={LocationsScreen} options={{ title: 'Storage Locations' }} />
        <Stack.Screen name="AddItem" component={AddItemScreen} options={{ title: 'Add Item' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;