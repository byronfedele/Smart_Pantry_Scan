// src/screens/EditItemScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { openDatabase, getLocations, updateInventoryItem } from '../database/databaseService';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import useGlobalStyles from '../styles/globalStyles'; // Import global styles hook
import { useTheme } from '../context/ThemeContext'; // Import theme context

const EditItemScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;
  const { colors } = useTheme(); // Get theme colors
  const globalStyles = useGlobalStyles(); // Get global styles
  const [quantityPercentage, setQuantityPercentage] = useState(item.quantity_in_possession);
  const [selectedLocationId, setSelectedLocationId] = useState(item.location_id);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const fetchedLocations = await getLocations();
        setLocations(fetchedLocations);
        if (fetchedLocations.length > 0 && !selectedLocationId) {
          setSelectedLocationId(fetchedLocations[0].location_id);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  const handleUpdate = async () => {
    try {
      await updateInventoryItem(item.item_id, quantityPercentage, selectedLocationId);
      navigation.goBack();
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item.');
    }
  };

  return (
    <View style={[globalStyles.globalContainer, { backgroundColor: colors.background }]}>
      <Text style={[globalStyles.globalTitle, { color: colors.text }]}>Edit {item.product_name}</Text>

      {item.image_url && <Image source={{ uri: item.image_url }} style={globalStyles.image} resizeMode="contain" />}

      <Text style={[globalStyles.label, { color: colors.text }]}>Quantity (%)</Text>
      <Slider
        style={globalStyles.slider}
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        value={quantityPercentage}
        onValueChange={setQuantityPercentage}
      />
      <Text style={[globalStyles.percentage, { color: colors.text }]}>{Math.round(quantityPercentage * 100)}%</Text>

      <Text style={[globalStyles.label, { color: colors.text }]}>Location:</Text>
      <Picker
        selectedValue={selectedLocationId}
        style={globalStyles.picker}
        onValueChange={(itemValue) => setSelectedLocationId(itemValue as number | null)}
      >
        {locations.map((loc) => (
          <Picker.Item key={loc.location_id} label={loc.location_name} value={loc.location_id} />
        ))}
      </Picker>

      <Button title="Update" onPress={handleUpdate} />
      <Button title="Cancel" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default EditItemScreen;