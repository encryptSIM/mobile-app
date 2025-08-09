import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ContinueButton,
  DiscountCode,
  PaymentMethod,
  PlanCard,
  PriceDetail
} from './components';
import { ErrorCard } from './components/errorCard';
import { useCheckout } from './hooks/useCheckout';
import { $styles } from './styles';

export function CheckoutScreen() {
  const {
    priceData,
    discountCode,
    selectedMethodId,
    local,
    plans,
    paymentState,
    checkCouponQuery,
    getContinueButtonText,
    handleDiscountClear,
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

        <PriceDetail
          lineItems={priceData.lineItems}
          adjustments={priceData.adjustments}
          totals={priceData.totals}
          subtotal={priceData.subtotal}
        />

        <PaymentMethod
          selectedMethodId={selectedMethodId}
          onMethodChange={(methodId) => setSelectedMethodId(methodId)}
          disabled={paymentState.isProcessing}
        />

        <DiscountCode
          onClear={handleDiscountClear}
          applied={!!checkCouponQuery.data?.data}
          value={discountCode}
          invalid={!!checkCouponQuery.error}
          loading={checkCouponQuery.isFetching}
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
