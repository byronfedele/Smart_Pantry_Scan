// src/screens/AddItemScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';
import { useRoute, useNavigation, ParamListBase, RouteProp } from '@react-navigation/native';
import { openDatabase, addInventoryItem, getLocations,insertProductDefinition,updateProductDefinitionName } from '../database/databaseService';
import useOpenFoodFactsApi from '../hooks/useOpenFoodFactsApi'; // Import the hook
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import useGlobalStyles from '../styles/globalStyles';
import { useTheme } from '../context/ThemeContext';



interface RouteParams {
  barcode?: string;
}

const AddItemScreen = () => {
 const { colors } = useTheme(); // Call the hook first
  const globalStyles = useGlobalStyles(); // Call the hook
  const styles = StyleSheet.create({
         item: globalStyles.item, // Use global item style
         buttonContainer: globalStyles.buttonContainer, // Use global buttonContainer style
         image: globalStyles.image, // Use global image style
       });

  const route = useRoute<RouteProp<ParamListBase, 'AddItem'>>();
  const barcode = route.params?.barcode;
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
  const loadProductInfo = async () => {
    if (barcode) {
      setLoadingProductInfo(true);
      setErrorProductInfo(null);
      const db = await openDatabase();
      if (db) {
        try {
          console.log("What we are checking in Product Definition");
          console.log(barcode);

          const dbResult: SQLite.SQLResultSet = await new Promise((resolve, reject) => {
            db.executeSql(
              'SELECT product_name, image_front_url FROM ProductDefinitions WHERE barcode = ? LIMIT 1', // Added LIMIT 1
              [String(barcode)], // Explicit string conversion
              (resultSet) => {
                console.log('Query successful:', resultSet);
                resolve(resultSet);
              },
              (error) => {
                console.error('Query error:', error);
                reject(error);
              }
            );
          });

          console.log("Checking if barcode exists in product definition"); // Added log
          console.log("DB Result:", dbResult); // Added log

          if (dbResult && dbResult.rows && dbResult.rows.length > 0) {
            const item = dbResult.rows.item(0);
            setProductName(item.product_name);
            setImageUrl(item.image_front_url);
            console.log("IMAGE URL FROM ProductDefinitions",imageUrl); // Add this log
          } else {
            console.log('Product not found locally, calling Open Food Facts API for:', barcode);
            fetchFromOFF(barcode);
          }
        } catch (error: any) {
          console.error('Error executing SQL:', error); // Log full error object
          setErrorProductInfo(error.message || 'Failed to load local product info.');
        } finally {
          setLoadingProductInfo(false);
        }
      } else {
        console.error('Failed to open database.');
        setErrorProductInfo('Failed to open local database.');
        setLoadingProductInfo(false);
      }
    } else {
      resetOFF();
    }
  };

  loadProductInfo();
}, [barcode, fetchFromOFF, resetOFF]);

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
      console.log('PRODUCT_NAME', productName);

      const db = await openDatabase();
      console.log('DB object in handleSaveItem:', db);

      try {
          // Wait for Open Food Facts data if necessary
          if (barcode && openFoodFactsLoading) {
              console.log('Waiting for Open Food Facts data...');
              while (openFoodFactsLoading) {
                  await new Promise(resolve => setTimeout(resolve, 100));
              }
              console.log('Open Food Facts data fetch complete.');
          }

          await addInventoryItem(
              barcode,
              Date.now(),
              quantityPercentage,
              selectedLocationId,
              expirationDate,
              notes,
              productName
          );

          // Check if the product already exists in ProductDefinitions
          if (db) {
              const results: SQLite.SQLResultSet = await new Promise((resolve, reject) => {
                  db.executeSql(
                      'SELECT product_name FROM ProductDefinitions WHERE barcode = ? LIMIT 1',
                      [String(barcode)],
                      (resultSet) => {
                          console.log('ProductDefinitions SELECT success:', resultSet);
                          resolve(resultSet);
                      },
                      (error) => {
                          console.error('ProductDefinitions SELECT error:', error);
                          reject(error);
                      }
                  );
              });

              if (results && results.rows && results.rows.length > 0) {
                  // Product exists, update the product name
                  await updateProductDefinitionName(barcode, productName);
              } else if (productName && openFoodFactsData && openFoodFactsData.image_front_url) {
                  // Product doesn't exist, insert new product
                  await insertProductDefinition(
                      barcode,
                      productName,
                      openFoodFactsData.image_front_url
                  );
              }
          }

          navigation.goBack();
      } catch (error: any) {
          console.error('Error saving item:', error);
      }

  };

  return (
     <View style={[globalStyles.globalContainer, { backgroundColor: colors.background }]}>
       <Text style={[globalStyles.globalTitle, { color: colors.text }]}>Add New Item</Text>

       {loadingProductInfo && <Text style={{ color: colors.text }}>Loading product info...</Text>}
       {errorProductInfo && <Text style={[globalStyles.errorText, { color: colors.negative }]}>{errorProductInfo}</Text>}

       {imageUrl && <Image source={{ uri: imageUrl }} style={globalStyles.image} resizeMode="contain" />}

       <Text style={[globalStyles.label, { color: colors.text }]}>Product Name:</Text>
       <TextInput
         style={[globalStyles.input, { color: colors.text }]}
         value={productName}
         onChangeText={(text) => setProductName(text)}
         placeholder="Product Name"
       />

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
         <Picker.Item label="Select Location" value={null} />
         {locations.map((loc) => (
           <Picker.Item key={loc.location_id} label={loc.location_name} value={loc.location_id} />
         ))}
       </Picker>
       <Text style={[globalStyles.label, { color: colors.text }]}>Expiration Date (Optional):</Text>
       <TextInput
         style={[globalStyles.input, { color: colors.text }]}
         value={expirationDate}
         onChangeText={setExpirationDate}
         placeholder="YYYY-MM-DD"
       />

       <Text style={[globalStyles.label, { color: colors.text }]}>Notes (Optional):</Text>
       <TextInput
         style={[globalStyles.input, { color: colors.text }]}
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



 export default AddItemScreen;