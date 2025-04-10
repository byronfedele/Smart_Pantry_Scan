// src/screens/AddItemScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';
import { useRoute, useNavigation, ParamListBase, RouteProp } from '@react-navigation/native';
import { openDatabase, addInventoryItem, getLocations } from '../database/databaseService';
import useOpenFoodFactsApi from '../hooks/useOpenFoodFactsApi'; // Import the hook
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';

interface RouteParams {
  barcode?: string;
}

const AddItemScreen = () => {
  const route = useRoute<RouteProp<ParamListBase, 'AddItem'>>();
  const { barcode } = route.params;
  const navigation = useNavigation();

  const [productName, setProductName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [quantityPercentage, setQuantityPercentage] = useState(1.0);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [locations, setLocations] = useState<Array<{ location_id: number; location_name: string }>>([]);
  const [loadingProductInfo, setLoadingProductInfo] = useState(false);
  const [errorProductInfo, setErrorProductInfo] = useState<string | null>(null);
  const [productNameSuggestions, setProductNameSuggestions] = useState<string[]>([]); // For future use
  const [lastFetchedBarcode, setLastFetchedBarcode] = useState<string | null>(null);

const {
    openFoodFactsData,
    openFoodFactsLoading,
    openFoodFactsError,
    fetchFromOFF,
    resetOFF,
  } = useOpenFoodFactsApi(); // Use the hook

  useEffect(() => {
    // Reset Open Food Facts data when the barcode changes or component mounts
    resetOFF();
  }, [barcode, resetOFF]);

  useEffect(() => {
    // Update local state when Open Food Facts data is fetched
    if (openFoodFactsData?.product_name) {
      setProductName(openFoodFactsData.product_name);
    }
    if (openFoodFactsData?.image_front_url) {
      setImageUrl(openFoodFactsData.image_front_url);
    }
  }, [openFoodFactsData]);

useEffect(() => {
  // Logic to load product info based on barcode (if available)
  const loadProductInfo = async () => {
    if (barcode && barcode !== lastFetchedBarcode) { // Check if barcode is new
      setLastFetchedBarcode(barcode);
      setLoadingProductInfo(true);
      setErrorProductInfo(null);
      const db = await openDatabase();
      if (db) { // Check if db object is valid
        try {
          const results = await db.executeSql(
            'SELECT product_name, image_front_url FROM ProductDefinitions WHERE barcode = ?',
            [barcode]
          );
          if (results && results.rows && results.rows.length > 0) { // Check if results and rows exist
            const item = results.rows.item(0);
            setProductName(item.product_name);
            setImageUrl(item.image_front_url);
          } else {
            console.log('Product not found locally, calling Open Food Facts API for:', barcode);
            fetchFromOFF(barcode);
          }
        } catch (error: any) {
          console.error('Error executing SQL:', error);
          setErrorProductInfo(error.message || 'Failed to load local product info.');
        } finally {
          setLoadingProductInfo(false);
        }
      } else {
        console.error('Failed to open database.');
        setErrorProductInfo('Failed to open local database.');
        setLoadingProductInfo(false);
      }
    } else if (!barcode) {
      resetOFF();
      setLastFetchedBarcode(null); // Reset last fetched barcode when barcode is null
    }
  };

  loadProductInfo();
}, [barcode, fetchFromOFF, resetOFF, lastFetchedBarcode]); // Add lastFetchedBarcode to the dependency array

 useEffect(() => {
    const fetchLocations = async () => {
      try {
        const fetchedLocations = await getLocations();
        setLocations(fetchedLocations);
        if (fetchedLocations.length > 0) {
          setSelectedLocationId(fetchedLocations[0].location_id); // Set initial selection
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        // Handle error
      }
    };

    fetchLocations();
  }, []);


  const handleSaveItem = async () => {
      console.log('Inside handleSaveItem...');
          console.log('Barcode:', barcode);
          console.log('Quantity Percentage:', quantityPercentage);
          console.log('Selected Location ID:', selectedLocationId);
          console.log('Expiration Date:', expirationDate);
          console.log('Notes:', notes);
    const db = await openDatabase();
        console.log('DB object in handleSaveItem:', db);

    try {
      await addInventoryItem(
        barcode,
        Date.now(),
        quantityPercentage,
        selectedLocationId, // Use the selected location ID
        expirationDate,
        notes
      );
      navigation.goBack(); // Go back to the previous screen
    } catch (error: any) {
      console.error('Error saving item:', error);
      // Display error to the user
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Item</Text>

      {loadingProductInfo && <Text>Loading product info...</Text>}
      {errorProductInfo && <Text style={styles.errorText}>{errorProductInfo}</Text>}

      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />}

      <Text style={styles.label}>Product Name:</Text>
      <TextInput
        style={styles.input}
        value={productName}
        onChangeText={setProductName}
        placeholder="Product Name"
      />

      <Text style={styles.label}>Quantity (%)</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        value={quantityPercentage}
        onValueChange={setQuantityPercentage}
      />
      <Text style={styles.percentage}>{Math.round(quantityPercentage * 100)}%</Text>

   <Text style={styles.label}>Location:</Text>
         <Picker
           selectedValue={selectedLocationId}
           style={styles.picker}
           onValueChange={(itemValue) => setSelectedLocationId(itemValue as number | null)}
         >
           <Picker.Item label="Select Location" value={null} />
           {locations.map((loc) => (
             <Picker.Item key={loc.location_id} label={loc.location_name} value={loc.location_id} />
           ))}
         </Picker>
      <Text style={styles.label}>Expiration Date (Optional):</Text>
      <TextInput
        style={styles.input}
        value={expirationDate}
        onChangeText={setExpirationDate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Notes (Optional):</Text>
      <TextInput
        style={styles.input}
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes"
        multiline
      />

      <Button title="Save Item" onPress={handleSaveItem} />
      <Button title="Cancel" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  slider: {
    marginBottom: 10,
  },
  percentage: {
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default AddItemScreen;