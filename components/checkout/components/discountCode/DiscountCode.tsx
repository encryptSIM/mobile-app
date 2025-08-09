import React, { useState } from 'react';
import { View } from 'react-native';
import { Card, Text, TextInput, Button } from 'react-native-paper';
import { $styles } from './styles';
import { brandGreen } from '@/components/app-providers';

interface DiscountCodeProps {
  value: string;
  disabled?: boolean
  loading?: boolean
  invalid: boolean
  applied: boolean
  onApply: (code: string) => void;
  onClear: (code: string) => void;
}

export const DiscountCode: React.FC<DiscountCodeProps> = ({
  value,
  loading,
  applied,
  invalid,
  onClear,
  onApply,

}) => {
  const [code, setCode] = useState(value);

  const handleClear = () => {
    onClear(code);
  };
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
            label={invalid ? 'Invalid Code' : undefined}
            placeholder="Discount code"
            disabled={applied}
            error={invalid}
            cursorColor='white'
            right={
              (invalid || loading)
                ? <TextInput.Icon color={!loading ? '#FFD480' : undefined} loading={loading} icon="alert" />
                : applied
                  ? <TextInput.Icon color={brandGreen} icon="checkbox-marked-circle-outline" />
                  : undefined
            }
            placeholderTextColor="#888"
            style={$styles.input}
            contentStyle={$styles.inputContent}
            outlineStyle={applied ? $styles.inputOutlineSuccess : $styles.inputOutline}
            mode="outlined"
          />
          {
            applied
              ? (
                <Button
                  mode="outlined"
                  onPress={handleClear}
                  style={$styles.applyButton}
                  labelStyle={$styles.applyButtonText}
                >
                  Clear
                </Button>
              )
              : (
                <Button
                  mode="outlined"
                  onPress={handleApply}
                  style={$styles.applyButton}
                  labelStyle={$styles.applyButtonText}
                >
                  Apply
                </Button>

              )

          }
        </View>
      </Card.Content>
    </Card>
  );
};
