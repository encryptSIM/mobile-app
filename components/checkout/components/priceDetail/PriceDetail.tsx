import React from 'react';
import { View } from 'react-native';
import { Card, Text, Divider, ActivityIndicator, Chip } from 'react-native-paper';
import { $styles, getFieldStyle } from './styles';

export interface PriceDetailField {
  label: string;
  value: number;
  currency?: string;
  formatter?: () => string;
  isLoadingValue?: boolean;
  type: 'line-item' | 'fee' | 'discount' | 'total-primary' | 'total-secondary';
}

interface PriceDetailProps {
  lineItems: PriceDetailField[];
  adjustments: PriceDetailField[];
  totals: PriceDetailField[];
  subtotal: number;
}

export const PriceDetail: React.FC<PriceDetailProps> = ({
  lineItems,
  adjustments,
  totals,
  subtotal
}) => {
  const formatPrice = (price: number, currency?: string) => {
    if (currency === 'SOL') return price.toFixed(6);
    return `$${Math.abs(price).toFixed(2)}`;
  };

  const renderField = (field: PriceDetailField, showSign = false) => (
    <View style={$styles.row} key={`${field.label}-${field.currency || 'USD'}`}>
      <View style={$styles.labelContainer}>
        <Text style={getFieldStyle(field.type).label}>
          {field.label}
        </Text>
        {field.currency && (
          <Chip
            mode="outlined"
            compact
            style={$styles.currencyChip}
            textStyle={$styles.currencyText}
          >
            {field.currency}
          </Chip>
        )}
      </View>

      <View style={$styles.valueContainer}>
        {field.isLoadingValue ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={getFieldStyle(field.type).value}>
            {showSign && field.value < 0 ? '-' : ''}
            {field.formatter ? field.formatter() : formatPrice(field.value, field.currency)}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <Card style={$styles.card} elevation={2}>
      <Card.Content style={$styles.content}>
        <Text style={$styles.title}>Order Summary</Text>

        {/* Line Items */}
        <View style={$styles.section}>
          {lineItems.map(field => renderField(field))}
        </View>

        {/* Subtotal (only show if multiple line items) */}
        {lineItems.length > 1 && (
          <>
            <Divider style={$styles.sectionDivider} />
            <View style={$styles.section}>
              {renderField({
                label: 'Subtotal',
                value: subtotal,
                type: 'line-item'
              })}
            </View>
          </>
        )}

        {/* Adjustments (fees and discounts) */}
        {adjustments.length > 0 && (
          <>
            <Divider style={$styles.sectionDivider} />
            <View style={$styles.section}>
              {adjustments.map(field => renderField(field, true))}
            </View>
          </>
        )}

        {/* Totals */}
        <Divider style={$styles.totalDivider} />
        <View style={$styles.totalSection}>
          {totals.map(field => renderField(field))}
        </View>
      </Card.Content>
    </Card>
  );
};
