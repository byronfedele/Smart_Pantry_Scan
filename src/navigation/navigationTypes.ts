// src/navigation/navigationTypes.ts
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined; // No parameters passed to the Home screen
  Locations: undefined; // No parameters passed to the Locations screen
  // Add other screen names and their parameter types here if you add more screens
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type LocationsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Locations'>;