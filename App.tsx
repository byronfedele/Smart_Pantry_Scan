import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Button, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { Camera, useCameraDevices, CameraDevice, Code, CodeScannerFrame } from 'react-native-vision-camera';
import AddLocationButton from './src/components/AddLocationButton'; // Adjust path if needed
import { openDatabase } from './src/database/databaseService'; // Adjust path if needed
import AppNavigator from './src/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
interface ProductData {
  status: number;
  product_name?: string;
  quantity?: string;
  image_front_url?: string;
}

const App = () => {
  const navigation = useNavigation();
  return <AppNavigator />;

  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device: CameraDevice | undefined = devices.find(d => d.position === 'back');

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');

      try {
        await openDatabase();
        console.log('Database initialized successfully in App.tsx');
        // You can now proceed with other database operations later in the component
      } catch (dbError) {
        console.error('Failed to initialize database:', dbError);
        setError('Failed to initialize local database.');
      }

      
    })();
  }, []);

  const handleScanButtonPress = useCallback(() => {
    setIsScanning(true);
    setBarcode(null);
    setProductData(null);
    setError(null);
  }, []);

  const handleBarcodeScanned = useCallback(async (codes: Code[], frame: CodeScannerFrame) => {
    if (isScanning && codes.length > 0) {
      const scannedBarcode = codes[0];
      if (scannedBarcode?.value) {
        setIsScanning(false);
        setBarcode(scannedBarcode.value);
        setLoading(true);
        setError(null);
        console.log(scannedBarcode.value);

        const apiUrl = `https://world.openfoodfacts.net/api/v2/product/${scannedBarcode.value}?fields=status,product_name,quantity,image_front_url`;

        try {
        
          const response = await fetch(apiUrl);
          console.log('API Response:', response); // Log the response object
          const data = await response.json();
          console.log('API Response Data:', data);
          console.log('API Status:', data.status);

          if (data.status === 1) {
            setProductData(data);
          } else {
            setError(`Product with barcode ${scannedBarcode.value} not found. Status: ${data.status}`);
            setProductData(null);
          }
        } catch (e: any) {

          console.error('Fetch Error:', e); // Log the entire error object
          console.error('Fetch Error Message:', e.message); // Log the error message
          console.error('Fetch Error Stack:', e.stack); // Log the error stack trace
          setError(`Uh-oh Failed to fetch product information for barcode: ${scannedBarcode.value}`);
          setProductData(null);
        } finally {
          setLoading(false);
        }
      }
    }
  }, [isScanning]);

  const renderHomeScreen = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Open Food Facts Scanner</Text>
      <Button title="Scan Barcode" onPress={handleScanButtonPress} />
      <View style={styles.locationButtonContainer}>
        <AddLocationButton />
        <Button
          title="View Locations"
          onPress={() => navigation.navigate('Locations')}
        />
      </View>

      {/* <View style={styles.locationButtonContainer}>
        <AddLocationButton />
      </View> */}
      {loading && <ActivityIndicator size="large" style={styles.loadingIndicator} />}

      {error && <Text style={styles.errorText}>{error}</Text>}
      {productData && console.log('Current productData Name:', productData.product.product_name)}

      {productData && productData.product.product_name && (
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{productData.product.product_name}</Text>
          {productData.product.quantity && <Text>Quantity: {productData.product.quantity}</Text>}
          {productData.product.image_front_url && (
            <Image source={{ uri: productData.product.image_front_url }} style={styles.productImage} resizeMode="contain" />
          )}
        </View>
      )}
    </View>
  );

  const renderScanner = () => {
    if (!device) {
      return (
        <View style={styles.scannerContainer}>
          <Text>No back camera available</Text>
          <Button title="Go Back" onPress={() => setIsScanning(false)} />
        </View>
      );
    }

    return (
      <View style={styles.scannerContainer}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isScanning}
          codeScanner={{
            onCodeScanned: handleBarcodeScanned,
            codeTypes: [
              'qr',
              'ean-13',
              'code-128',
              'upc-a',
              'ean-8',
              'upc-e',
              'code-39',
              'itf',
              'codabar',
            ],
          }}
        />
        <Button title="Cancel Scan" onPress={() => setIsScanning(false)} style={styles.cancelButton} />
      </View>
    );
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>Camera permission not granted</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {isScanning ? renderScanner() : renderHomeScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  errorText: {
    marginTop: 20,
    color: 'red',
  },
  productInfo: {
    marginTop: 30,
    alignItems: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  productImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  locationButtonContainer: {
    marginTop: 20, // Add some spacing above the button
  },
});

export default App;