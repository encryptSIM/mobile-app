import React from 'react';
import { View, Image } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { $styles } from './styles';
import CountryFlag from 'react-native-country-flag';

export interface PlanCardProps {
  qty: number
  countryCode?: string
  imageUri?: string
  country: string;
  benefits: Array<{
    icon: string;
    text: string;
  }>;
}

export const PlanCard: React.FC<PlanCardProps> = (props) => {
  return (
    <Card style={$styles.card}>
      <Card.Content style={$styles.content}>
        <View style={$styles.header}>
          <View style={$styles.countryInfo}>
            {props.countryCode ? (
              <CountryFlag
                style={$styles.flagImage}
                isoCode={props.countryCode}
                size={40}
              />
            ) : (
              <Image
                source={{ uri: props.imageUri }}
                style={$styles.flagImage}
              />
            )}
            <View>
              <Text style={$styles.countryName}>{props.country}</Text>
              <Text style={$styles.esimLabel}>eSIM</Text>
            </View>
          </View>
          <Image style={$styles.simCard} source={require('@/assets/sim.png')} />
        </View>

        <Text style={$styles.benefitsTitle}>Plan Benefits:</Text>
        <View style={$styles.benefits}>
          {props.benefits.map((benefit, index) => (
            <Chip
              key={index}
              icon={benefit.icon}
              style={$styles.benefitChip}
              textStyle={$styles.benefitText}
            >
              {benefit.text}
            </Chip>
          ))}
        </View>
      </Card.Content>
      {
        props.qty && (
          <View style={$styles.qtyContainer}>
            <Text style={$styles.countryName}>x{props.qty}</Text>
          </View>
        )
      }
    </Card>
  );
};
