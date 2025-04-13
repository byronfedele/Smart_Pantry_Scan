// src/styles/globalStyles.ts
import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import React from 'react';

const GlobalStylesComponent = ({ colors }) => {
  return StyleSheet.create({
    globalContainer: {
      flex: 1,
      padding: 10,
      backgroundColor: colors.background,
    },
    globalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      color: colors.text,
    },
    item: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
    },
    image: {
      width: 100,
      height: 100,
      marginBottom: 10,
    },
    picker: {
      marginBottom: 10,
    },
    slider: {
      marginBottom: 10,
    },
    input: {
      height: 40,
      borderColor: colors.secondary,
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 10,
      color: colors.text,
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
      color: colors.text,
    },
    percentage: {
      fontSize: 16,
      textAlign: 'center',
      marginTop: 5,
      color: colors.text,
    },
    errorText: {
      color: colors.negative,
      marginBottom: 10,
    },
    text: {
      fontSize: 16,
      color: colors.text,
    },
  });
};

const useGlobalStyles = () => {
  const { colors } = useTheme();
  const globalStyles = React.useMemo(() => GlobalStylesComponent({ colors }), [colors]);
  return globalStyles;
}

export default useGlobalStyles;