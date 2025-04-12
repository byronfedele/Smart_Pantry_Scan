// App.tsx (at the root)
import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { openDatabase } from './src/database/databaseService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const App = () => {
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await openDatabase();
        console.log('Database initialized successfully in App.tsx (root)');
      } catch (dbError) {
        console.error('Failed to initialize database:', dbError);
      }
    };

    initializeDatabase();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
};

export default App;