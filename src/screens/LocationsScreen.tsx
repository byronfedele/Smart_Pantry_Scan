// src/screens/LocationsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LocationsScreenNavigationProp } from '../navigation/navigationTypes';
import AddLocationButton from '../components/AddLocationButton';
import { getLocations } from '../database/databaseService';

interface Location {
  location_id: number;
  location_name: string;
}

const LocationsScreen = () => {
  const navigation = useNavigation<LocationsScreenNavigationProp>();
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

  const renderItem = ({ item }: { item: Location }) => (
    <View style={styles.listItem}>
      <Text>{item.location_name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Locations</Text>
      <View style={styles.buttonContainer}>
        <AddLocationButton onLocationAdded={loadLocations} />
        <Button title="Back to Scanner" onPress={goBackToHome} />
      </View>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.location_id.toString()}
        renderItem={renderItem}
        style={styles.list}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
});

export default LocationsScreen;