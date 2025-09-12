import { $api, Sim } from '@/api/api';
import {
  SELECTED_PACKAGE_QTY_MAP,
  SELECTED_PACKAGES,
  SelectedPackageQtyMap
} from '@/components/packageSelection/hooks';
import { useTransferSol } from '@/components/solana/use-transfer-sol';
import { AppConfig } from '@/constants/app-config';
import { regions } from '@/constants/countries';
import { useSharedState } from '@/hooks/use-provider';
import { useSolanaPrice } from '@/hooks/useSolanaPrice';
import { useLocalSearchParams } from 'expo-router';
import { err, ok, Result } from 'neverthrow';
import { useCallback, useMemo, useRef, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { PriceDetailField } from '../components';
import { useSafeNavigation } from '@/hooks/use-safe-navigation';
import { IconType } from '@/components/Icon';
// import { useWalletAuth } from '@/components/auth/wallet-auth-provider';
import { useAuthorization } from '@/components/auth/useAuthorization';
import { useTransferSol } from '@/components/auth/account-data-access';
import { solToLamports } from '@/utils/lamports-to-sol';

export const SIMS = { key: 'SIMS', initialState: [] };

type PaymentStage = 'idle' | 'preparing' | 'transferring' | 'completing' | 'success';

export interface PaymentState {
  stage: PaymentStage;
  isProcessing: boolean;
  error: string | null;
  transactionId: string | null;
  orderId: string | null;
}

export interface PaymentError {
  code: string;
  message: string;
  stage: PaymentStage;
  transactionId?: string;
}

const initialState: PaymentState = {
  stage: 'idle',
  isProcessing: false,
  error: null,
  transactionId: null,
  orderId: null,
}

export const useCheckout = () => {
  const [selectedPackages] = useSharedState<string[]>(SELECTED_PACKAGES.key);
  const [selectedPackageQtyMap] = useSharedState<SelectedPackageQtyMap>(
    SELECTED_PACKAGE_QTY_MAP.key
  );
  const [, setSims] = useSharedState<Sim[]>(SIMS.key);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('solana');
  const [discountCode, setDiscountCode] = useState('');
  const [paymentState, setPaymentState] = useState<PaymentState>(initialState);
  const navigation = useSafeNavigation();
  const local = useLocalSearchParams();
  const { account } = useWalletAuth()
  const solanaPrice = useSolanaPrice();
  const paymentIdempotencyKey = useRef<string | null>(null);

  const checkCouponQuery = $api.useQuery('get', '/coupon/{code}', {
    params: {
      path: {
        code: discountCode
      }
    },
  }, {
    enabled: discountCode !== ""
  })

  const generateIdempotencyKey = useCallback((): string => {
    if (!paymentIdempotencyKey.current) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const accountHash = account?.address?.slice(-8) || 'unknown';
      paymentIdempotencyKey.current = `payment_${timestamp}_${accountHash}_${random}`;
    }
    return paymentIdempotencyKey.current;
  }, [account?.address]);

  const logPaymentEvent = useCallback((
    event: string,
    data?: any,
    level: 'info' | 'warn' | 'error' = 'info'
  ) => {
    const logData = {
      timestamp: new Date().toISOString(),
      event,
      idempotencyKey: paymentIdempotencyKey.current,
      accountAddress: account?.address,
      stage: paymentState.stage,
      ...data,
    };

    console.log(`[PAYMENT_${level.toUpperCase()}]`, JSON.stringify(logData, null, 2));
  }, [account?.address, paymentState.stage]);

  const updatePaymentState = useCallback((updates: Partial<PaymentState>) => {
    setPaymentState(prev => {
      const newState = { ...prev, ...updates };
      logPaymentEvent('payment_state_updated', {
        from: prev,
        to: newState
      });
      return newState;
    });
  }, [logPaymentEvent]);

  const createPaymentError = (
    code: string,
    message: string,
    stage: PaymentStage,
    transactionId?: string
  ): PaymentError => ({
    code,
    message,
    stage,
    transactionId,
  });

  const validatePaymentPreconditions = (): Result<void, PaymentError> => {
    logPaymentEvent('validating_payment_preconditions');

    if (!account?.address) {
      return err(createPaymentError(
        'WALLET_NOT_CONNECTED',
        'Please connect your wallet to continue',
        'preparing'
      ));
    }

    if (!selectedPackages?.length) {
      return err(createPaymentError(
        'NO_PACKAGES_SELECTED',
        'Please select at least one package',
        'preparing'
      ));
    }

    if (solanaPrice.isPending) {
      return err(createPaymentError(
        'PRICE_LOADING',
        'Please wait for price information to load',
        'preparing'
      ));
    }

    if (!solanaPrice.data || solanaPrice.data <= 0) {
      return err(createPaymentError(
        'INVALID_PRICE_DATA',
        'Unable to get current SOL price. Please try again.',
        'preparing'
      ));
    }

    return ok(undefined);
  };

  const completeOrder = $api.useMutation('post', '/complete-order', {
    onSuccess: (response) => {
      logPaymentEvent('order_completed_successfully', {
        response,
        simsCount: response.sims?.length || 0
      });

      updatePaymentState({
        stage: 'success',
        isProcessing: false,
        error: null
      });

      if (response.sims) {
        setSims(prev => [...prev, ...response.sims!]);
      }

      setTimeout(() => {
        navigation.replace("(tabs)");
      }, 2000);
    },
    onError: (error) => {
      logPaymentEvent('order_completion_failed', { error }, 'error');
      updatePaymentState({
        stage: 'idle',
        isProcessing: false,
        error: 'Failed to complete your order. Your payment may have been processed. Please contact support if needed.',
      });
    }
  });

  const transferSol = useTransferSol({
    address: accountPublicKey!,
    onError: (error) => {
      console.error(error)
      logPaymentEvent('sol_transfer_failed', { error }, 'error');

      let errorMessage = 'Payment failed. Please try again.';
      if (error.name === 'SolanaMobileWalletAdapterError') {
        if (error.message?.includes('CancellationException') || ('code' in error && error.code === 'EUNSPECIFIED')) {
          errorMessage = 'Transaction was cancelled. Please try again and complete the transaction in your wallet.';
        }
      }

      updatePaymentState({
        stage: 'idle',
        isProcessing: false,
        error: errorMessage,
      });
    },
    onSuccess: (signature) => {
      console.log(signature)
      logPaymentEvent('sol_transfer_successful', { transactionId: signature });

      updatePaymentState({
        stage: 'completing',
        transactionId: signature || null
      });

      const accountAddress = account?.address;
      if (!accountAddress) {
        logPaymentEvent('missing_account_address', { account }, 'error');
        updatePaymentState({
          stage: 'idle',
          isProcessing: false,
          error: 'Account information missing. Please reconnect your wallet.',
        });
        return;
      }

      const orderData = {
        id: accountAddress,
        idempotency_key: generateIdempotencyKey(),
        transaction_id: signature,
        orders: selectedPackages.map(packageId => ({
          package_id: packageId,
          package_title: selectedPackageQtyMap[packageId].pkg.title!,
          quantity: selectedPackageQtyMap[packageId].qty,
          expiration_ms: getEndOfFutureDayTimestamp(
            selectedPackageQtyMap[packageId].pkg.day!
          ),
          created_at_ms: Date.now(),
          country_code: local.countryCode ? String(local.countryCode) : undefined,
          region: local.region ? String(local.region) : undefined,
        }))
      };

      logPaymentEvent('submitting_order', { orderData });
      completeOrder.mutate({ body: orderData });
    }
  });

  const plans = useMemo(() => {
    if (!selectedPackages || !selectedPackageQtyMap) return [];

    return selectedPackages.map((packageName) => {
      const pkgQtyMap = selectedPackageQtyMap[packageName];

      const planBenefits = [
        { icon: "speed" as IconType, text: "Up to 5G speed" },
      ];

      if (pkgQtyMap?.pkg?.day) {
        planBenefits.push({
          icon: "calendar" as IconType,
          text: `${pkgQtyMap?.pkg?.day} days`,
        });
      }
      if (pkgQtyMap?.pkg?.data) {
        planBenefits.push({ icon: "wifi", text: pkgQtyMap.pkg.data });
      }
      if (pkgQtyMap?.pkg?.voice) {
        planBenefits.push({
          icon: "phone" as IconType,
          text: `${pkgQtyMap?.pkg?.voice} minutes of calls`,
        });
      }
      if (pkgQtyMap?.pkg?.text) {
        planBenefits.push({
          icon: "sms" as IconType,
          text: `${pkgQtyMap?.pkg?.text} SMS Messages`,
        });
      }

      return {
        benefits: planBenefits,
        country: String(local.title),
        countryCode: local.countryCode ? String(local.countryCode) : undefined,
        imageUri: regions.find((r) => r.slug === local.region)?.image,
        pkg: pkgQtyMap?.pkg,
        qty: pkgQtyMap?.qty,
      };
    });
  }, [selectedPackages, selectedPackageQtyMap, local, regions]);

  const validCoupon = useMemo(() => {
    const pkg = selectedPackageQtyMap[selectedPackages[0]].pkg
    if (!pkg) return false
    const coupon = checkCouponQuery.data?.data
    if (!coupon) return false
    const couponRegion = coupon.region
    const couponCountry = coupon.country
    const couponGbLimit = coupon.gbLimit
    const validityLimit = coupon.validityLimit
    const validGb = couponGbLimit ? parseToGigabytes(pkg.data) <= couponGbLimit : true
    const validDay = validityLimit ? pkg.day! <= coupon.validityLimit! : true
    const validRegion = couponRegion ? couponRegion === local.region : true
    const validCountry = couponCountry ? couponCountry === local.countryCode : true
    const validCoupon = validCountry
      && validDay
      && validGb
      && validRegion
    return validCoupon
  }, [checkCouponQuery.data?.data])

  const priceData = useMemo(() => {
    let subtotalUSD = 0;

    const lineItems: PriceDetailField[] = [];
    selectedPackages.forEach((pkgId) => {
      const { pkg, qty } = selectedPackageQtyMap[pkgId];
      const netPriceUSD = pkg?.prices?.net_price?.USD || 0;
      const packageTotal = netPriceUSD * qty * AppConfig.feePercentage;

      subtotalUSD += packageTotal;

      lineItems.push({
        label: qty > 1 ? `${pkg?.title} x${qty}` : pkg?.title!,
        value: packageTotal,
        type: 'line-item',
      });
    });

    const adjustments: PriceDetailField[] = [];

    const discount = validCoupon
      ? -1 * ((subtotalUSD) * (checkCouponQuery.data!.data!.discount / 100))
      : 0;

    if (validCoupon) {
      adjustments.push({
        label: `Coupon: ${checkCouponQuery.data!.data!.code}`,
        value: discount,
        type: 'discount',
      });
    }

    const grandTotalUSD = subtotalUSD + discount;
    const priceInSol = solanaPrice.data
      ? (1 / solanaPrice.data) * grandTotalUSD
      : 0;

    const totals: PriceDetailField[] = [
      {
        label: 'Total',
        value: grandTotalUSD,
        currency: 'USD',
        type: 'total-primary',
      },
      {
        label: 'Total',
        value: priceInSol,
        currency: 'SOL',
        type: 'total-secondary',
        formatter: () => priceInSol.toFixed(6),
        isLoadingValue: solanaPrice.isPending,
      },
    ];

    return {
      lineItems,
      adjustments,
      totals,
      subtotal: subtotalUSD,
      priceInSol,
    };
  }, [
    solanaPrice.data,
    solanaPrice.isPending,
    selectedPackages,
    selectedPackageQtyMap,
    checkCouponQuery.data
  ]);

  const solAmount = useMemo(() => {
    return priceData.priceInSol
  }, [priceData]);

  const handleDiscountApply = useCallback((code: string) => {
    setDiscountCode(code.trim());
    logPaymentEvent('discount_code_applied', { code });
  }, [logPaymentEvent]);

  const handleDiscountClear = useCallback((code: string) => {
    setDiscountCode('');
    logPaymentEvent('discount_code_cleared', { code });
  }, [logPaymentEvent]);

  const clearError = useCallback(() => {
    logPaymentEvent('error_cleared');
    updatePaymentState({
      error: null,
      stage: 'idle',
      isProcessing: false
    });
    paymentIdempotencyKey.current = null;
  }, [updatePaymentState, logPaymentEvent]);

  const handleContinuePayment = useCallback(async () => {
    if (paymentState.isProcessing) {
      logPaymentEvent('payment_already_in_progress', {}, 'warn');
      return;
    }

    logPaymentEvent('payment_initiated', {
      solAmount,
      packages: selectedPackages,
      destination: AppConfig.masterSolAccount,
    });

    updatePaymentState({
      stage: 'preparing',
      isProcessing: true,
      error: null,
      transactionId: null,
      orderId: null,
    });

    const validationResult = validatePaymentPreconditions();
    if (validationResult.isErr()) {
      const error = validationResult.error;
      logPaymentEvent('payment_validation_failed', { error }, 'error');
      updatePaymentState({
        stage: 'idle',
        isProcessing: false,
        error: error.message,
      });
      return;
    }

    try {
      updatePaymentState({ stage: 'transferring' });

      if (solAmount > 0) {
        logPaymentEvent('initiating_sol_transfer', {
          amount: solAmount,
          destination: AppConfig.masterSolAccount,
          idempotencyKey: generateIdempotencyKey(),
        });
        transferSol.mutate({
          amount: solToLamports(solAmount),
          destination: AppConfig.masterSolAccount
        });
      } else {
        logPaymentEvent('skipping_sol_transfer', {
          amount: solAmount,
          destination: AppConfig.masterSolAccount,
          idempotencyKey: generateIdempotencyKey(),
        });

        updatePaymentState({
          stage: 'completing',
          transactionId: null
        });

        const accountAddress = account?.address;
        if (!accountAddress) {
          logPaymentEvent('missing_account_address', { account }, 'error');
          updatePaymentState({
            stage: 'idle',
            isProcessing: false,
            error: 'Account information missing. Please reconnect your wallet.',
          });
          return;
        }

        const orderData = {
          id: accountAddress,
          idempotency_key: generateIdempotencyKey(),
          orders: selectedPackages.map(packageId => ({
            package_id: packageId,
            package_title: selectedPackageQtyMap[packageId].pkg.title!,
            quantity: selectedPackageQtyMap[packageId].qty,
            expiration_ms: getEndOfFutureDayTimestamp(
              selectedPackageQtyMap[packageId].pkg.day!
            ),
            created_at_ms: Date.now(),
            country_code: local.countryCode ? String(local.countryCode) : undefined,
            region: local.region ? String(local.region) : undefined,
          }))
        };

        logPaymentEvent('submitting_order', { orderData });
        completeOrder.mutate({ body: orderData });
      }
    } catch (error) {
      logPaymentEvent('payment_initiation_failed', { error }, 'error');
      updatePaymentState({
        stage: 'idle',
        isProcessing: false,
        error: 'Failed to initiate payment. Please try again.',
      });
    }
  }, [
    paymentState.isProcessing,
    solAmount,
    selectedPackages,
    transferSol,
    updatePaymentState,
    validatePaymentPreconditions,
    generateIdempotencyKey,
    logPaymentEvent,
  ]);

  return {
    priceData,
    discountCode,
    selectedPackages,
    validCoupon,
    selectedPackageQtyMap,
    selectedMethodId,
    local,
    plans,
    solanaPrice,
    paymentState,
    checkCouponQuery,
    handleDiscountClear,
    getContinueButtonText: () => getButtonText(paymentState),
    setSelectedMethodId,
    handleDiscountApply,
    handleContinuePayment,
    clearError,
  };
};

function getButtonText(state: PaymentState): string {
  if (state.error) {
    return "Try Again"
  }
  const statusMessages: Record<PaymentStage, string> = {
    'idle': 'Continue to payment',
    'preparing': 'Preparing payment...',
    'transferring': 'Processing SOL transfer...',
    'completing': 'Finalizing your order...',
    'success': 'Payment successful! Redirecting...',
  };
  return statusMessages[state.stage]
}

function getEndOfFutureDayTimestamp(days: number): number {
  if (!Number.isInteger(days) || days < 0) {
    throw new Error('Input must be a non-negative integer');
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + days + 1);

  return futureDate.getTime() - 1;
}

function parseToGigabytes(data?: string): number {
  if (!data) return 0
  if (data === "Unlimited") return 999999999999999
  const normalized = data.trim().toUpperCase();
  const match = normalized.match(/^([\d.]+)\s*(GB|MB|KB|TB)$/);

  if (!match) {
    throw new Error(`Invalid data string format: "${data}"`);
  }

  const value = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case "GB":
      return value;
    case "MB":
      return value / 1024;
    case "KB":
      return value / (1024 * 1024);
    case "TB":
      return value * 1024;
    default:
      throw new Error(`Unsupported unit: "${unit}"`);
  }
}
