// For TypeScript
import React from 'react';
import { Button, Alert } from 'react-native';
import { addLocation } from '../database/databaseService'; // Adjust path if needed

const AddLocationButton = () => {
  const handleAddLocation = () => {
    Alert.prompt(
      'Add New Location',
      'Enter the name of the new storage location:',
      async (text) => {
        if (text) {
          try {
            await addLocation(text);
            Alert.alert('Success', `Location "${text}" added successfully!`);
            // Optionally, you might want to refresh the list of locations here
          } catch (error: any) {
            Alert.alert('Error', `Failed to add location: ${error.message}`);
          }
        }
      },
      'plain-text', // Input type
      '' // Default value
    );
  };

  return (
    <Button title="Add New Location" onPress={handleAddLocation} />
  );
};

export default AddLocationButton;