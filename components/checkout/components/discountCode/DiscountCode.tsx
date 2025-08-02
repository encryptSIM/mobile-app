import React, { useState } from 'react';
import { View } from 'react-native';
import { Card, Text, TextInput, Button } from 'react-native-paper';
import { $styles } from './styles';

interface DiscountCodeProps {
  value: string;
  onApply: (code: string) => void;
}

export const DiscountCode: React.FC<DiscountCodeProps> = ({
  value,
  onApply
}) => {
  const [code, setCode] = useState(value);

  const handleApply = () => {
    onApply(code);
  };

  return (
    <Card style={$styles.card}>
      <Card.Content style={$styles.content}>
        <Text style={$styles.title}>Apply discount / referral code</Text>
        <Text style={$styles.description}>
          You can apply discount / referral code with your purchase.
        </Text>

        <View style={$styles.inputContainer}>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Discount code"
            placeholderTextColor="#888"
            style={$styles.input}
            contentStyle={$styles.inputContent}
            outlineStyle={$styles.inputOutline}
            mode="outlined"
          />
          <Button
            mode="outlined"
            onPress={handleApply}
            style={$styles.applyButton}
            labelStyle={$styles.applyButtonText}
          >
            Apply
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};
