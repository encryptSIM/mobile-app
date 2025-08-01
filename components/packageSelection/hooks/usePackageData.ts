import { usePackageDetails } from "@/airalo-api/queries/packages";
import { useCallback, useMemo, useState } from "react";

export interface PackageItem {
  id: string;
  localPackage: any;
  packageDetails: any;
  price: number;
}

export const usePackageData = ({ countryCode, region }: { countryCode?: string, region?: string }) => {
  const [filter, setFilter] = useState<number[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPackageQtyMap, setSeletedPackageQtyMap] = useState<Record<string, number>>({})

  const packageDetails = usePackageDetails({ countryCode, region });

  const filters = useMemo(() => {
    if (!packageDetails) return []
    const values: number[] = []
    for (let i = 0; i < packageDetails.packageDetails.length; i++) {
      const day = packageDetails.packageDetails[i].localPackage?.day
      if (!day) continue
      if (values.includes(day)) continue
      values.push(day)
    }
    return values.sort((a, b) => {
      if (a >= b) return 0
      return 1
    })
  }, [packageDetails.data])

  const filteredPackages = useMemo(() => {
    if (!packageDetails.packageDetails) return [];

    return packageDetails.packageDetails
      .map((packageDetails) => ({
        id: packageDetails.localPackage?.id || Math.random().toString(),
        localPackage: packageDetails.localPackage,
        packageDetails: packageDetails.packageDetails,
        price: parseFloat(
          String(
            packageDetails.localPackage?.prices?.recommended_retail_price?.AUD?.toFixed(
              2
            )
          )
        ),
      }))
      .filter((item) => {
        if (filter.length === 0) return true;
        if (filter.includes(parseInt(String(item.localPackage?.day)))) return true;
        return false;
      });
  }, [packageDetails.packageDetails, filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await packageDetails.refetch?.();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, [packageDetails.refetch]);

  const handlePackagePress = useCallback((packageId: string) => {
    setSelectedPackages((prev) => {
      if (prev.includes(packageId)) {
        return prev.filter((id) => id !== packageId);
      }
      return [...prev, packageId];
    });
    setSeletedPackageQtyMap(prev => ({
      ...prev,
      [packageId]: prev[packageId] ? prev[packageId]++ : 1
    }))
  }, []);

  const handleFilterPress = useCallback((filterValue: number) => {
    setFilter((prev) => {
      if (prev.includes(filterValue)) {
        return prev.filter((i) => i !== filterValue);
      }
      return [...prev, filterValue];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilter([]);
  }, []);

  return {
    filteredPackages,
    selectedPackages,
    filter,
    refreshing,
    isLoading: packageDetails.isLoading,
    isError: packageDetails.isError,
    handlePackagePress,
    handleFilterPress,
    clearFilters,
    onRefresh,
    selectedPackageQtyMap,
    setSeletedPackageQtyMap,
    filters,
    packageDetails,
  };
};
