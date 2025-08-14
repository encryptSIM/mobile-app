import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { $styles } from './styles';

interface ContinueButtonProps {
  onPress: () => void;
  text: string
  disabled?: boolean
  loading?: boolean;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({
  onPress,
  text,
  disabled,
  loading = false
}) => {
  return (
    <View style={$styles.container}>
      <Button
        mode="contained"
        onPress={onPress}
        loading={loading}
        disabled={disabled}
        style={$styles.button}
        labelStyle={$styles.buttonText}
        contentStyle={$styles.buttonContent}
      >
        {text}
      </Button>
    </View>
  );
};
