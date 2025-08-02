import React from 'react';
import { View } from 'react-native';
import { Card, Text, Divider, ActivityIndicator, Chip } from 'react-native-paper';
import { $styles } from './styles';

export interface PriceDetailField {
  label: string;
  value: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
  isLoadingValue?: boolean
  isDividerAfter?: boolean;
  currency?: string
  formatter?: () => string
}

interface PriceDetailProps {
  fields: PriceDetailField[];
}

export const PriceDetail: React.FC<PriceDetailProps> = ({ fields }) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  return (
    <Card style={$styles.card}>
      <Card.Content style={$styles.content}>
        <Text style={$styles.title}>Price detail</Text>

        {fields.map((field, index) => (
          <React.Fragment key={index}>
            <View style={$styles.row}>
              <View style={$styles.rowInner}>
                <Text
                  style={[
                    $styles.label,
                    field.isSubtotal && $styles.subtotalLabel,
                    field.isTotal && $styles.totalLabel,
                  ]}
                >
                  {field.label}
                </Text>
                {
                  field.currency && (
                    <Chip>{field.currency}</Chip>
                  )
                }
              </View>
              {
                field.isLoadingValue ? (
                  <ActivityIndicator />
                ) : (
                  <Text
                    style={[
                      $styles.price,
                      field.isSubtotal && $styles.subtotalPrice,
                      field.isTotal && $styles.totalPrice,
                    ]}
                  >
                    {field.formatter ? field.formatter() : formatPrice(field.value)}
                  </Text>
                )
              }
            </View>
            {field.isDividerAfter && <Divider style={$styles.divider} />}
          </React.Fragment>
        ))}
      </Card.Content>
    </Card>
  );
};
