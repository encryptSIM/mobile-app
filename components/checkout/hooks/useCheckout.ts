import { SELECTED_PACKAGE_QTY_MAP, SELECTED_PACKAGES, SelectedPackageQtyMap } from '@/components/packageSelection/hooks';
import { useTransferSol } from '@/components/solana/use-transfer-sol';
import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { AppConfig } from '@/constants/app-config';
import { regions } from '@/constants/countries';
import { useSharedState } from '@/hooks/use-provider';
import { useSolanaPrice } from '@/hooks/useSolanaPrice';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { PriceDetailField } from '../components';

export const useCheckout = () => {
  const [selectedPackages] = useSharedState<string[]>(SELECTED_PACKAGES.key);
  const [selectedPackageQtyMap] = useSharedState<SelectedPackageQtyMap>(SELECTED_PACKAGE_QTY_MAP.key)
  const [selectedMethodId, setSelectedMethodId] = useState<string>('solana')
  const [discountCode, setDiscountCode] = useState('');
  const local = useLocalSearchParams();
  const { account } = useWalletUi()
  const solanaPrice = useSolanaPrice()
  const transferSol = useTransferSol({
    address: account?.publicKey!,
    onSuccess: () => router.replace("/(tabs)")
  })
  const plans = useMemo(() => {
    if (!selectedPackages) return []
    if (!selectedPackageQtyMap) return []
    return selectedPackages.map((packageName) => {
      const pkgQtyMap = selectedPackageQtyMap[packageName];

      const planBenefits = [
        { icon: "shield-off", text: "No share data" },
        { icon: "speedometer", text: "Up to 5G speed" },
      ];

      if (pkgQtyMap?.pkg?.day) {
        planBenefits.push({
          icon: "calendar-month",
          text: `${pkgQtyMap?.pkg?.day} days`,
        });
      }
      if (pkgQtyMap?.pkg?.data) {
        planBenefits.push({ icon: "wifi", text: pkgQtyMap.pkg.data });
      }
      if (pkgQtyMap?.pkg?.voice) {
        planBenefits.push({
          icon: "phone",
          text: `${pkgQtyMap?.pkg?.voice} minutes of calls`,
        });
      }
      if (pkgQtyMap?.pkg?.text) {
        planBenefits.push({
          icon: "phone",
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

  const priceData = useMemo(() => {
    const feePercentage = 0.4;
    let totalPriceUSD = 0;
    const fields: PriceDetailField[] = [];

    selectedPackages.forEach((pkgId) => {
      const { pkg, qty } = selectedPackageQtyMap[pkgId];
      const netPriceUSD = pkg?.prices?.net_price?.USD || 0;
      const packageTotal = netPriceUSD * qty;

      totalPriceUSD += packageTotal;

      fields.push({
        label: qty > 1 ? `${pkg?.title} x${qty}` : pkg?.title!,
        value: totalPriceUSD,
        isSubtotal: false,
        isTotal: false,
        isDividerAfter: false,
      });
    });

    const serviceFeeUSD = totalPriceUSD * feePercentage;
    const grandTotalUSD = totalPriceUSD + serviceFeeUSD;

    fields.push(
      {
        label: "Service fee",
        value: serviceFeeUSD,
        isSubtotal: false,
        isTotal: false,
        isDividerAfter: true,
      },
      {
        label: "Total",
        currency: "(USD)",
        value: grandTotalUSD,
        isSubtotal: false,
        isTotal: true,
        isDividerAfter: false,
      }
    );

    const priceInSol = (1 / solanaPrice.data) * grandTotalUSD;

    fields.push({
      label: "Total",
      currency: "(SOL)",
      value: priceInSol,
      isSubtotal: false,
      formatter: () => priceInSol.toFixed(6),
      isLoadingValue: solanaPrice.isPending,
      isTotal: true,
      isDividerAfter: false,
    });

    return {
      priceInSol,
      fields,
    };
  }, [solanaPrice.data, selectedPackages, selectedPackageQtyMap]);


  const handleDiscountApply = useCallback((code: string) => {
    setDiscountCode(code);
    console.log('Applying discount code:', code);
  }, []);

  const handleContinuePayment = useCallback(() => {
    transferSol.mutate({ amount: parseFloat(priceData.priceInSol.toFixed(6)), destination: AppConfig.masterSolAccount })
  }, []);


  return {
    priceData,
    discountCode,
    selectedPackages,
    selectedPackageQtyMap,
    selectedMethodId,
    local,
    plans,
    solanaPrice,
    transferSol,
    setSelectedMethodId,
    handleDiscountApply,
    handleContinuePayment,
  };
};
