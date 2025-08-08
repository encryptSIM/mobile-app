import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, TouchableOpacity, View } from 'react-native';
import { Appbar, Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ContinueButton,
  DiscountCode,
  PaymentMethod,
  PlanCard,
  PriceDetail
} from './components';
import { useCheckout } from './hooks/useCheckout';
import { $styles } from './styles';
import { Ionicons } from '@expo/vector-icons';
import { ErrorCard } from './components/errorCard';

export function CheckoutScreen() {
  const {
    priceData,
    discountCode,
    selectedMethodId,
    local,
    plans,
    paymentState,
    getContinueButtonText,
    setSelectedMethodId,
    handleDiscountApply,
    handleContinuePayment,
    clearError,
  } = useCheckout();

  return (
    <SafeAreaView style={$styles.container}>
      <Appbar.Header style={$styles.header}>
        <Appbar.BackAction onPress={router.back} />
        <Appbar.Content title={local.title} />
      </Appbar.Header>

      <ScrollView style={$styles.content} showsVerticalScrollIndicator={false}>
        {plans.map((plan, index) => (
          <PlanCard key={plan?.pkg?.id ?? index} {...plan} />
        ))}

        <PriceDetail fields={priceData.fields} />

        <PaymentMethod
          selectedMethodId={selectedMethodId}
          onMethodChange={(methodId) => setSelectedMethodId(methodId)}
          disabled={paymentState.isProcessing}
        />

        <DiscountCode
          value={discountCode}
          onApply={handleDiscountApply}
          disabled={paymentState.isProcessing}
        />

        <ErrorCard paymentState={paymentState} clearError={clearError} />

        {
          paymentState.error ?? (
            <ContinueButton
              text={getContinueButtonText()}
              loading={paymentState.isProcessing}
              onPress={handleContinuePayment}
              disabled={paymentState.isProcessing}
            />
          )
        }
      </ScrollView>
    </SafeAreaView>
  );
}
