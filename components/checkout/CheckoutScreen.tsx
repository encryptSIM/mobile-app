import React from 'react';
import { ScrollView, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import {
  ContinueButton,
  DiscountCode,
  PlanCard,
  PriceDetail
} from './components';
import { ErrorCard } from './components/errorCard';
import { useCheckout } from './hooks/useCheckout';
import { $styles } from './styles';
import { useThrottledCallback } from '@/hooks/use-throttled-callback';
import { useSafeNavigation } from '@/hooks/use-safe-navigation';
import { Icon } from '../Icon';

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
  const navigation = useSafeNavigation()
  const throttledContinue = useThrottledCallback(handleContinuePayment, 3000)

  return (
    <View style={$styles.container}>
      <Appbar.Header style={$styles.header}>
        <Icon icon="back" onPress={navigation.goBack} colour="white" size="large" />
        <Appbar.Content title={local.title} />
      </Appbar.Header>

      <ScrollView fadingEdgeLength={200} style={$styles.content}>
        {plans.map((plan, index) => (
          <PlanCard key={plan?.pkg?.id ?? index} {...plan} />
        ))}

        <PriceDetail
          lineItems={priceData.lineItems}
          adjustments={priceData.adjustments}
          totals={priceData.totals}
          subtotal={priceData.subtotal}
        />

        {/* <PaymentMethod */}
        {/*   selectedMethodId={selectedMethodId} */}
        {/*   onMethodChange={(methodId) => setSelectedMethodId(methodId)} */}
        {/*   disabled={paymentState.isProcessing} */}
        {/* /> */}

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
          !paymentState.error && (
            <ContinueButton
              text={getContinueButtonText()}
              loading={paymentState.stage !== 'idle'}
              onPress={throttledContinue}
              disabled={paymentState.stage !== 'idle'}
            />
          )
        }
      </ScrollView>
    </View>
  );
}
