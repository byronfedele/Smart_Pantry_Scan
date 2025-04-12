// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Button, Image, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevices, CameraDevice, Code, CodeScannerFrame } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';

interface ProductData {
  status: number;
  product_name?: string;
  image_front_url?: string;
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
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
    })();
  }, []);

  const handleScanButtonPress = useCallback(() => {
    setIsScanning(true);
    setProductData(null);
    setError(null);
  }, []);

  const handleBarcodeScanned = useCallback(async (codes: Code[], frame: CodeScannerFrame) => {
    if (isScanning && codes.length > 0) {
      const scannedBarcode = codes[0];
      if (scannedBarcode?.value) {
        setIsScanning(false);
        console.log('Scanned Barcode:', scannedBarcode.value);
        navigation.navigate('AddItem', { barcode: scannedBarcode.value });
      }
    }
  }, [isScanning, navigation]);

  const renderHomeScreenContent = () => (
     <View style={styles.container}>
          <Text style={styles.title}>Open Food Facts Scanner</Text>
          <Button title="Scan Barcode" onPress={handleScanButtonPress} />

          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <Button
                title="Manual Entry"
                onPress={() => navigation.navigate('AddItem')}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="Locations"
                onPress={() => navigation.navigate('Locations')}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="View Inventory"
                onPress={() => navigation.navigate('InventoryList')}
              />
            </View>
          </View>

      {loading && <ActivityIndicator size="large" style={styles.loadingIndicator} />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {productData && productData.product_name && (
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{productData.product_name}</Text>
          {productData.image_front_url && (
            <Image
              source={{ uri: productData.image_front_url }}
              style={styles.productImage}
              resizeMode="contain"
            />
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
        <View style={styles.cancelButton}>
          <Button title="Cancel Scan" onPress={() => setIsScanning(false)} />
        </View>
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
      {isScanning ? renderScanner() : renderHomeScreenContent()}
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
  buttonContainer: {
    marginTop: 20,
  },
});

export default HomeScreen;