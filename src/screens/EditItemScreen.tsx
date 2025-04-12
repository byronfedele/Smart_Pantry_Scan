// src/screens/EditItemScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { openDatabase, getLocations } from '../database/databaseService';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';

const EditItemScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { item } = route.params;
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
                // Handle error
            }
        };

        fetchLocations();
    }, []);

    const handleUpdate = async () => {
        const db = await openDatabase();
        if (db) {
            try {
                await db.executeSql(
                    'UPDATE InventoryItems SET quantity_in_possession = ?, location_id = ? WHERE item_id = ?',
                    [quantityPercentage, selectedLocationId, item.item_id]
                );
                navigation.goBack();
            } catch (error) {
                console.error('Error updating item:', error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Edit {item.product_name}</Text>

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
                {locations.map((loc) => (
                    <Picker.Item key={loc.location_id} label={loc.location_name} value={loc.location_id} />
                ))}
            </Picker>

            <Button title="Update" onPress={handleUpdate} />
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
    slider: {
        marginBottom: 10,
    },
    percentage: {
        marginBottom: 10,
    },
    picker: {
        marginBottom: 10,
    },
});

export default EditItemScreen;