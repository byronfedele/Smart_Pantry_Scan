// src/hooks/useOpenFoodFactsApi.ts
import { useState, useCallback } from 'react';
//import { insertProductDefinition } from '../database/databaseService'; // ADD THIS LINE

interface OpenFoodFactsData {
  product_name?: string | null;
  image_front_url?: string | null;
  status?: number;
}

interface UseOpenFoodFactsApiResult {
  openFoodFactsData: OpenFoodFactsData;
  openFoodFactsLoading: boolean;
  openFoodFactsError: string | null;
  fetchFromOFF: (barcode: string) => Promise<void>;
  resetOFF: () => void;
}

const useOpenFoodFactsApi = (): UseOpenFoodFactsApiResult => {
  const [openFoodFactsData, setOpenFoodFactsData] = useState<OpenFoodFactsData>({});
  const [openFoodFactsLoading, setOpenFoodFactsLoading] = useState(false);
  const [openFoodFactsError, setOpenFoodFactsError] = useState<string | null>(null);

 const fetchFromOFF = useCallback(async (barcode: string) => {
   if (!barcode) {
     setOpenFoodFactsData({});
     setOpenFoodFactsError(null);
     setOpenFoodFactsLoading(false);
     return;
   }

   setOpenFoodFactsLoading(true);
   setOpenFoodFactsError(null);

   const apiUrl = `https://world.openfoodfacts.net/api/v2/product/${barcode}?fields=status,product_name,image_front_url`;

   try {
     const response = await fetch(apiUrl);
     const data = await response.json();
       console.log("Here is the result of API call");
       console.log(data);
     if (data.status === 1 && data.product) {
       const productName = data.product.product_name || null;
       const imageUrl = data.product.image_front_url || null;

       setOpenFoodFactsData({
         product_name: productName,
         image_front_url: imageUrl,
         status: data.status,
       });

       // Insert the fetched product info into the local database
//        if (productName || imageUrl) {
//          console.log('Before insertProductDefinition:', { barcode, productName, imageUrl }); // ADDED LOG
//          try {
//            await insertProductDefinition(barcode, productName, imageUrl);
//            console.log('After insertProductDefinition: Success'); // ADDED LOG
//          } catch (dbError: any) {
//            console.error('Error in insertProductDefinition:', dbError);
//            setOpenFoodFactsError(`Error saving product info: ${dbError.message || 'Unknown database error'}`);
//          }
//        }
     } else {
       setOpenFoodFactsError(`Product with barcode ${barcode} not found on Open Food Facts.`);
       setOpenFoodFactsData({});
     }
   } catch (e: any) {
     setOpenFoodFactsError(`Failed to fetch product information for barcode: ${barcode}`);
     setOpenFoodFactsData({});
   } finally {
     setOpenFoodFactsLoading(false);
   }
 }, []);


  const resetOFF = useCallback(() => {
    setOpenFoodFactsData({});
    setOpenFoodFactsLoading(false);
    setOpenFoodFactsError(null);
  }, []);

  return { openFoodFactsData, openFoodFactsLoading, openFoodFactsError, fetchFromOFF, resetOFF };
};

export default useOpenFoodFactsApi;