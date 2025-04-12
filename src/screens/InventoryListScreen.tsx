// src/screens/InventoryListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, Image } from 'react-native'; // Import Image
import { useNavigation } from '@react-navigation/native';
import { openDatabase } from '../database/databaseService';

interface InventoryItem {
  item_id: number;
  product_name: string;
  barcode: string;
  scan_timestamp: number;
  expiration_date: string | null;
  location_id: number | null;
  notes: string | null;
  quantity_in_possession: number;
  image_url: string | null; // Add image_url property
}

interface UserLocation {
  location_id: number;
  location_name: string;
}

const InventoryListScreen = () => {
  const navigation = useNavigation();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventoryItems = useCallback(async () => {
    setLoading(true);
    const db = await openDatabase();
    if (db) {
      try {
        const inventoryResults = await new Promise<SQLite.SQLResultSet>((resolve, reject) => {
          db.executeSql(
            'SELECT InventoryItems.*, ProductDefinitions.image_front_url FROM InventoryItems LEFT JOIN ProductDefinitions ON InventoryItems.barcode = ProductDefinitions.barcode',
            [],
            (resultSet) => resolve(resultSet),
            (error) => reject(error)
          );
        });

        const items: InventoryItem[] = [];
        for (let i = 0; i < inventoryResults.rows.length; i++) {
          items.push({
            ...inventoryResults.rows.item(i),
            image_url: inventoryResults.rows.item(i).image_front_url, // Add image_url to item
          });
        }
        setInventoryItems(items);

        const locationResults = await new Promise<SQLite.SQLResultSet>((resolve, reject) => {
          db.executeSql(
            'SELECT * FROM UserLocations',
            [],
            (resultSet) => resolve(resultSet),
            (error) => reject(error)
          );
        });

        const locationList: UserLocation[] = [];
        for (let i = 0; i < locationResults.rows.length; i++) {
          locationList.push(locationResults.rows.item(i));
        }
        setUserLocations(locationList);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load inventory items.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      Alert.alert('Error', 'Failed to open database.');
    }
  }, []);

  useEffect(() => {
    fetchInventoryItems();
    const unsubscribe = navigation.addListener('focus', fetchInventoryItems);

    return unsubscribe;
  }, [navigation, fetchInventoryItems]);

  const getLocationName = (locationId: number | null): string | undefined => {
    if (locationId === null) return undefined;
    const location = userLocations.find((loc) => loc.location_id === locationId);
    return location?.location_name;
  };

  const handleDeleteItem = async (itemId: number) => {
    // ... (delete item logic)
  };

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <View style={styles.item}>
      {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />}
      <Text>Product: {item.product_name}</Text>
      <Text>Quantity: {item.quantity_in_possession}</Text>
      {item.location_id !== null && <Text>Location: {getLocationName(item.location_id)}</Text>}
      <View style={styles.buttonContainer}>
        <Button title="Edit" onPress={() => navigation.navigate('EditItem', { item })} />
        <Button title="Delete" onPress={() => handleDeleteItem(item.item_id)} color="red" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory Items</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={inventoryItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.item_id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
});

export default InventoryListScreen;