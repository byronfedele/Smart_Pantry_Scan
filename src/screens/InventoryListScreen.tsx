// src/screens/InventoryListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getInventoryItems, getLocations, deleteInventoryItem, updateInventoryItem } from '../database/databaseService';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import useGlobalStyles from '../styles/globalStyles';
import { useTheme } from '../context/ThemeContext';

interface InventoryItem {
  item_id: number;
  product_name: string;
  barcode: string;
  scan_timestamp: number;
  expiration_date: string | null;
  location_id: number | null;
  notes: string | null;
  quantity_in_possession: number;
  image_url: string | null;
  created_at: number;
  updated_at: number;
}

interface UserLocation {
  location_id: number;
  location_name: string;
}

const InventoryListScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme(); // Get theme colors
  const globalStyles = useGlobalStyles(); // Get global styles
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [createdFromDate, setCreatedFromDate] = useState<Date | null>(null);
  const [createdToDate, setCreatedToDate] = useState<Date | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [quantityMin, setQuantityMin] = useState(0);
  const [quantityMax, setQuantityMax] = useState(1);

  const [createdFromMode, setCreatedFromMode] = useState<'date' | 'time'>('date');
  const [createdToMode, setCreatedToMode] = useState<'date' | 'time'>('date');
  const [showCreatedFrom, setShowCreatedFrom] = useState(false);
  const [showCreatedTo, setShowCreatedTo] = useState(false);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  };
  const clearFilters = () => {
      setSelectedLocationId(null);
      setCreatedFromDate(null);
      setCreatedToDate(null);
      setQuantityMin(0);
      setQuantityMax(1);
      setQuantity(1);
      fetchInventoryItems();
    };

  const fetchInventoryItems = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getInventoryItems(
        selectedLocationId,
        createdFromDate ? createdFromDate.getTime() : null,
        createdToDate ? createdToDate.getTime() : null,
        quantityMin,
        quantityMax,
      );
      setInventoryItems(items);

      const locations = await getLocations();
      setUserLocations(locations);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load inventory items.');
    } finally {
      setLoading(false);
    }
  }, [selectedLocationId, createdFromDate, quantityMin, quantityMax]);

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
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
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
              await deleteInventoryItem(itemId);
              fetchInventoryItems();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleEditItem = (item: InventoryItem) => {
    navigation.navigate('EditItem', { item: item, image_url: item.image_url });
  };

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <View style={[globalStyles.item, { borderBottomColor: colors.divider }]}>
      {item.image_url && <Image source={{ uri: item.image_url }} style={globalStyles.image} resizeMode="contain" />}
      <Text style={{ color: colors.text }}>Product: {item.product_name}</Text>
      <Text style={{ color: colors.text }}>Quantity: {item.quantity_in_possession}</Text>
      {item.location_id !== null && <Text style={{ color: colors.text }}>Location: {getLocationName(item.location_id)}</Text>}
      <Text style={{ color: colors.text }}>Created: {formatTimestamp(item.created_at)}</Text>
      <Text style={{ color: colors.text }}>Updated: {formatTimestamp(item.updated_at)}</Text>
      <View style={globalStyles.buttonContainer}>
        <Button
          title="Edit"
          onPress={() => handleEditItem(item)}
        />
        <Button title="Delete" onPress={() => handleDeleteItem(item.item_id)} color="red" />
      </View>
    </View>
  );

  return (
    <View style={[globalStyles.globalContainer, { backgroundColor: colors.background }]}>
      <Text style={[globalStyles.globalTitle, { color: colors.text }]}>Inventory Items</Text>
      <Picker
        selectedValue={selectedLocationId}
        style={[globalStyles.picker, { backgroundColor: colors.background, color: colors.text }]}
        onValueChange={(itemValue) => setSelectedLocationId(itemValue as number | null)}
      >
        <Picker.Item label="All Locations" value={null} />
        {userLocations.map((loc) => (
          <Picker.Item key={loc.location_id} label={loc.location_name} value={loc.location_id} />
        ))}
      </Picker>

      <Button title="Created From" onPress={() => setShowCreatedFrom(true)} />
      {showCreatedFrom && (
        <DateTimePicker
          value={createdFromDate || new Date()}
          mode={createdFromMode}
          is24Hour={true}
          onChange={(event, selectedDate) => {
            setShowCreatedFrom(false);
            if (selectedDate) setCreatedFromDate(selectedDate);
          }}
        />
      )}

      <Button title="Created To" onPress={() => setShowCreatedTo(true)} />
      {showCreatedTo && (
        <DateTimePicker
          value={createdToDate || new Date()}
          mode={createdToMode}
          is24Hour={true}
          onChange={(event, selectedDate) => {
            setShowCreatedTo(false);
            if (selectedDate) setCreatedToDate(selectedDate);
          }}
        />
      )}

      <Slider
        style={[globalStyles.slider, { backgroundColor: colors.background }]}
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        value={quantity}
        onValueChange={(value) => setQuantity(value)}
        onSlidingComplete={(value) => {
          setQuantityMin(0);
          setQuantityMax(value);
        }}
      />

      <Button title="Apply Filters" onPress={fetchInventoryItems} />
      <Button title="Clear Filters" onPress={clearFilters} />

      {loading ? (
        <Text style={{ color: colors.text }}>Loading...</Text>
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

export default InventoryListScreen;