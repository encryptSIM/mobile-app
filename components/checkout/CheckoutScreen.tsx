import React, { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import {
  ContinueButton,
  WalletCard,
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
    local,
    plans,
    paymentState,
    checkCouponQuery,
    validCoupon,
    getContinueButtonText,
    handleDiscountClear,
    handleDiscountApply,
    handleContinuePayment,
    clearError,
  } = useCheckout();
  const navigation = useSafeNavigation()
  const ref = useRef<ScrollView>(null)
  const throttledContinue = useThrottledCallback(handleContinuePayment, 3000)

  return (
    <View style={$styles.container}>
      <Appbar.Header style={$styles.header}>
        <Icon icon="back" onPress={navigation.goBack} colour="white" size="large" />
        <Appbar.Content title={local.title} />
      </Appbar.Header>

      <ScrollView ref={ref} fadingEdgeLength={200} style={$styles.content}>
        {plans.map((plan, index) => (
          <PlanCard key={plan?.pkg?.id ?? index} {...plan} />
        ))}

        <PriceDetail
          lineItems={priceData.lineItems}
          adjustments={priceData.adjustments}
          totals={priceData.totals}
          subtotal={priceData.subtotal}
        />

        <WalletCard
          paymentAmount={priceData.priceInSol}
          estimatedBalance={priceData.estimatedBalance}
          disabled={paymentState.isProcessing}
        />

        <DiscountCode
          onFocus={() => setTimeout(() => ref.current?.scrollToEnd(), 500)}
          onClear={handleDiscountClear}
          applied={!!checkCouponQuery.data?.data}
          value={discountCode}
          invalid={!validCoupon && !checkCouponQuery.isPending}
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
