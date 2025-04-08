// src/screens/LocationsScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LocationsScreenNavigationProp } from '../navigation/navigationTypes';
import AddLocationButton from '../components/AddLocationButton'; // Adjust path if needed

const LocationsScreen = () => {
  const navigation = useNavigation<LocationsScreenNavigationProp>();

  const goBackToHome = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Locations</Text>
      <View style={styles.buttonContainer}>
        <AddLocationButton />
        <Button title="Back to Scanner" onPress={goBackToHome} />
      </View>
      {/* We'll display the locations here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20, // Add some space between the title and the buttons
    alignItems: 'center', // Center the buttons horizontally
    gap: 10, // Add some space between the buttons
  },
});

export default LocationsScreen;