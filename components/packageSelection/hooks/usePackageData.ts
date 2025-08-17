import { Package } from "@/airalo-api/api";
import { usePackageDetails } from "@/airalo-api/queries/packages";
import { useSharedState } from "@/hooks/use-provider";
import { useCallback, useMemo, useState } from "react";
import { PackageDetailsCardField } from "../components";

export interface PackageItem {
  id: string;
  localPackage?: Package;
  packageDetails: PackageDetailsCardField[];
  price: number;
}

export type SelectedPackageQtyMap = Record<string, {
  qty: number,
  pkg: Package
}>

export const SELECTED_PACKAGES = {
  key: 'SELECTED_PACKAGES_KEY',
  initialState: []
};

export const SELECTED_PACKAGE_QTY_MAP = {
  key: 'SELECTED_PACKAGE_QTY_MAP_KEY',
  initialState: {}
};

export const usePackageData = ({
  countryCode,
  region
}: {
  countryCode?: string,
  region?: string
}) => {
  const [filter, setFilter] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPackages, setSelectedPackages] = useSharedState<string[]>(
    SELECTED_PACKAGES.key,
    SELECTED_PACKAGES.initialState
  );
  const [selectedPackageQtyMap, setSelectedPackageQtyMap] = useSharedState<SelectedPackageQtyMap>(
    SELECTED_PACKAGE_QTY_MAP.key,
    SELECTED_PACKAGE_QTY_MAP.initialState
  );

  const packageDetails = usePackageDetails({ countryCode, region });

  const filters = useMemo(() => {
    if (!packageDetails.packageDetails) return [];
    const values: number[] = [];

    for (let i = 0; i < packageDetails.packageDetails.length; i++) {
      const day = packageDetails.packageDetails[i].localPackage?.day;
      if (!day) continue;
      if (values.includes(day)) continue;
      values.push(day);
    }

    return values.sort((a, b) => a - b); // Fixed sorting logic
  }, [packageDetails.packageDetails]);

  const filteredPackages = useMemo(() => {
    if (!packageDetails.packageDetails) {
      console.warn('no package details found');
      return [];
    }

    return packageDetails.packageDetails
      .map((packageDetail) => ({
        id: packageDetail.localPackage?.id || Math.random().toString(),
        localPackage: packageDetail.localPackage,
        packageDetails: packageDetail.packageDetails,
        price: parseFloat(
          String(
            packageDetail.localPackage?.prices?.recommended_retail_price?.AUD?.toFixed(2)
          )
        ),
      }))
      .filter((item) => {
        if (filter.length === 0) return true;
        if (filter.includes(parseInt(String(item.localPackage?.day)))) return true;
        if (selectedPackages.includes(item.id)) return true
        return false;
      });
  }, [packageDetails.packageDetails, filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Clear cache and refetch
      await packageDetails.invalidateCache?.();
      await packageDetails.refetch?.();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, [packageDetails.invalidateCache, packageDetails.refetch]);

  const handlePackagePress = useCallback(
    (packageId: string) => {
      setSelectedPackages((prev) => {
        if (prev.includes(packageId)) {
          setSelectedPackageQtyMap((qtyPrev) => {
            const { [packageId]: _, ...rest } = qtyPrev;
            return rest;
          });
          return prev.filter((id) => id !== packageId);
        } else {
          const packages = packageDetails.packageDetails?.flatMap(
            (t) => t.localPackage
          ) || [];
          const pkg = packages.find((t) => t?.id === packageId);

          if (pkg) {
            setSelectedPackageQtyMap((qtyPrev) => ({
              ...qtyPrev,
              [packageId]: {
                pkg,
                qty: qtyPrev[packageId] ? qtyPrev[packageId].qty + 1 : 1,
              },
            }));
          }
          return [...prev, packageId];
        }
      });
    },
    [packageDetails.packageDetails, setSelectedPackages, setSelectedPackageQtyMap]
  );

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
    error: packageDetails.error,
    handlePackagePress,
    handleFilterPress,
    clearFilters,
    onRefresh,
    selectedPackageQtyMap,
    setSeletedPackageQtyMap: setSelectedPackageQtyMap,
    filters,
    packageDetails,
    // Additional cache utilities
    invalidateCache: packageDetails.invalidateCache,
    preloadCache: packageDetails.preloadCache,
    cacheKey: packageDetails.cacheKey,
  };
};
