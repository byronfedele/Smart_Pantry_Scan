// src/hooks/useOpenFoodFactsApi.ts
import { useState, useCallback } from 'react';

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

      if (data.status === 1 && data.product) {
        setOpenFoodFactsData({
          product_name: data.product.product_name || null,
          image_front_url: data.product.image_front_url || null,
          status: data.status,
        });
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