// src/components/AddLocationButton.tsx
import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Modal } from 'react-native';
import { addLocation } from '../database/databaseService';

interface Props {
  onLocationAdded: () => void;
}

const AddLocationButton: React.FC<Props> = ({ onLocationAdded }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) {
      setErrorMessage('Location name cannot be empty.');
      return;
    }

    try {
      await addLocation(newLocationName);
      setModalVisible(false);
      setNewLocationName('');
      setErrorMessage(null);
      onLocationAdded(); // Call the refresh function
    } catch (error: any) {
      console.error('Error adding location:', error);
      setErrorMessage(error.message || 'Failed to add location.');
    }
  };

  return (
    <View>
      <Button title="Add New Location" onPress={() => setModalVisible(true)} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Enter New Location Name:</Text>
            <TextInput
              style={styles.input}
              onChangeText={setNewLocationName}
              value={newLocationName}
              placeholder="e.g., Warehouse C"
            />
            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Add" onPress={handleAddLocation} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default AddLocationButton;