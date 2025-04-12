// src/screens/InventoryListScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
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
}

const InventoryListScreen = () => {
  const navigation = useNavigation();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      const db = await openDatabase();
      if (db) {
        try {
          const results = await new Promise<SQLite.SQLResultSet>((resolve, reject) => {
            db.executeSql(
              'SELECT * FROM InventoryItems',
              [],
              (resultSet) => resolve(resultSet),
              (error) => reject(error)
            );
          });

          const items: InventoryItem[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            items.push(results.rows.item(i));
          }
          setInventoryItems(items);
        } catch (error) {
          console.error('Error fetching inventory items:', error);
        }
      }
    };

    fetchInventoryItems();
  }, []);

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <View style={styles.item}>
      <Text>Product: {item.product_name}</Text>
      <Text>Barcode: {item.barcode}</Text>
      <Text>Quantity: {item.quantity_in_possession}</Text>
      {item.expiration_date && <Text>Expiration: {item.expiration_date}</Text>}
      {item.notes && <Text>Notes: {item.notes}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory Items</Text>
      <FlatList
        data={inventoryItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.item_id.toString()}
      />
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
});

export default InventoryListScreen;