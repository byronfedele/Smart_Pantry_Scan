// src/screens/LocationsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LocationsScreenNavigationProp } from '../navigation/navigationTypes';
import AddLocationButton from '../components/AddLocationButton';
import { getLocations, deleteLocation } from '../database/databaseService';
import useGlobalStyles from '../styles/globalStyles';
import { useTheme } from '../context/ThemeContext';

interface Location {
  location_id: number;
  location_name: string;
}

const LocationsScreen = () => {
  const navigation = useNavigation<LocationsScreenNavigationProp>();
  const { colors } = useTheme();
  const globalStyles = useGlobalStyles();
  const [locations, setLocations] = useState<Location[]>([]);

  const loadLocations = useCallback(async () => {
    try {
      const fetchedLocations = await getLocations();
      setLocations(fetchedLocations);
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  }, []);

  useEffect(() => {
    loadLocations();
    const unsubscribe = navigation.addListener('focus', loadLocations);
    return unsubscribe;
  }, [navigation, loadLocations]);

  const goBackToHome = () => {
    navigation.navigate('Home');
  };

  const handleDeleteLocation = (locationId: number) => {
    Alert.alert(
      'Delete Location',
      'Are you sure you want to delete this location?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLocation(locationId);
              loadLocations();
            } catch (error) {
              console.error('Error deleting location:', error);
              Alert.alert('Error', 'Failed to delete location.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderItem = ({ item }: { item: Location }) => (
    <View style={[styles.listItem, { borderBottomColor: colors.divider }]}>
      <Text style={{ color: colors.text }}>{item.location_name}</Text>
      <Button
        title="X"
        onPress={() => handleDeleteLocation(item.location_id)}
        color="red"
      />
    </View>
  );

  return (
    <View style={[globalStyles.globalContainer, { backgroundColor: colors.background }]}>
      <Text style={[globalStyles.globalTitle, { color: colors.text }]}>Storage Locations</Text>
      <View style={styles.buttonContainer}>
        <AddLocationButton onLocationAdded={loadLocations} />
      </View>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.location_id.toString()}
        renderItem={renderItem}
        style={styles.list}
      />
      <View style={styles.buttonContainer}>
        <Button title="BACK" onPress={goBackToHome} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    width: '100%',
  },
});

export default LocationsScreen;