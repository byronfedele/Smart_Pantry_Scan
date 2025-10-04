// src/contexts/ThemeContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Appearance } from 'react-native';
import { lightTheme, darkTheme } from '../styles/themes'; // Import theme objects


interface ThemeContextType {
  theme: 'light' | 'dark';
  colors: typeof lightTheme; // Or typeof darkTheme
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: lightTheme,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme() || 'light');
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme || 'light');
    });
    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);