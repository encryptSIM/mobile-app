import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { $styles } from './styles';

interface ContinueButtonProps {
  onPress: () => void;
  loading?: boolean;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({
  onPress,
  loading = false
}) => {
  return (
    <View style={$styles.container}>
      <Button
        mode="contained"
        onPress={onPress}
        loading={loading}
        style={$styles.button}
        labelStyle={$styles.buttonText}
        contentStyle={$styles.buttonContent}
      >
        Continue to payment
      </Button>
    </View>
  );
};
