import { useCallback, useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import {
  PackageCardData,
  countries,
  regions,
  transformCountriesToCardData,
  transformRegionsToCardData,
} from "@/constants/countries";
import { useSharedState } from "@/hooks/use-provider";
import { Sim } from "@/api/api";
import { SIMS } from "@/components/checkout/hooks/useCheckout";

export function useEsimHomeScreen() {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sims] = useSharedState<Sim[]>(SIMS.key)
  useEffect(() => {
    console.log("sims", JSON.stringify(sims, null, 2))
  }, [sims])

  const handleTabChange = useCallback((index: number) => {
    setTabIndex(index);
  }, []);

  const rawData = useMemo((): PackageCardData[] => {
    if (tabIndex === 0) {
      return transformCountriesToCardData(countries).filter(
        (item) => !item.disabled
      );
    } else {
      return transformRegionsToCardData(regions);
    }
  }, [tabIndex]);

  const fuse = useMemo(() => {
    return new Fuse(rawData, {
      keys: ["label"],
      threshold: 0.3,
    });
  }, [rawData]);

  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return rawData;
    }
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, rawData, fuse]);

  return {
    tabIndex,
    searchQuery,
    filteredData,
    setSearchQuery,
    handleTabChange,
  };
}
