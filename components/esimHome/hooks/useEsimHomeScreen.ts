import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import {
  PackageCardData,
  countries,
  regions,
  transformCountriesToCardData,
  transformRegionsToCardData,
} from "@/constants/countries";
import { useSharedState } from "@/hooks/use-provider";
import { $api, Sim } from "@/api/api";
import { SIMS } from "@/components/checkout/hooks/useCheckout";
import { useWalletUi } from "@/components/solana/use-wallet-ui";
import { useMultiUsage } from "@/airalo-api/queries/usage";
import { UsageStat } from "../components/simUsagePanel";
import { PackageDetailsCardField } from "@/components/packageSelection/components";
import { IconType } from "@/components/Icon";

export const SELECTED_SIM = {
  key: 'SELECTED_SIM',
  initialState: null
}

export function useEsimHomeScreen() {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const { account } = useWalletUi()
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sims, setSims] = useSharedState<Sim[]>(SIMS.key, SIMS.initialState)
  const [selectedSim, setSelectedSim] = useSharedState<Sim | null>(SELECTED_SIM.key, SELECTED_SIM.initialState)
  const usageQuery = useMultiUsage(sims.map(s => s.iccid))
  const expiredSims = useMemo(() => sims.filter(s => s.expiration_ms < Date.now()), [sims])
  const [progress, setProgress] = useState<number>(0.0);
  const [showContent, setShowContent] = useSharedState('SHOW_CONTENT')
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const simsSim = simsQuery.data?.data?.find(t => t.iccid === selectedSim?.iccid)
    if (selectedSim?.installed === simsSim?.installed) return
    simsQuery.refetch()
  }, [selectedSim])

  const simDetails = useMemo(() => {
    if (!expiredSims || expiredSims.length === 0) {
      return [];
    }

    const addDetail = (
      key: string,
      icon: IconType,
      value: any,
      detailsArray: PackageDetailsCardField[]
    ) => {
      if (value !== undefined && value !== null) {
        detailsArray.push({
          key,
          icon,
          value: String(value),
        });
      }
    };

    return expiredSims.map((sim) => {
      const packageDetails: PackageDetailsCardField[] = [];

      const total = getDaysBetweenInclusive(sim.created_at_ms, sim.expiration_ms)
      const stats = usageQuery.data!
      addDetail("Calls (min)", "phone", stats[sim.iccid].total_voice, packageDetails);
      addDetail("SMS", "sms", stats[sim.iccid].total_text, packageDetails);
      addDetail("Data", "wifi", stats[sim.iccid].total, packageDetails);
      addDetail(
        "Validity",
        "calendar",
        total,
        packageDetails
      );

      return { sim, packageDetails };
    });
  }, [expiredSims, usageQuery]);

  const usageStats = useMemo(() => {
    const statsMap: Record<string, UsageStat[]> = {}
    if (!usageQuery.data) return {}
    for (const iccid of Object.keys(usageQuery.data)) {
      const stats: UsageStat[] = []
      const usage = usageQuery.data[iccid]
      if (usage.total_text) {
        stats.push({
          total: usage.total_text,
          used: usage.total_text - usage.remaining_text!,
          label: "SMS",
          icon: "sms",
          unit: "messages",
        })
      }
      if (usage.total) {
        stats.push({
          total: usage.total,
          used: usage.total - usage.remaining!,
          label: "Data",
          icon: "wifi",
          unit: "MB",
        })
      }
      if (usage.total_voice) {
        stats.push({
          total: usage.total_voice,
          used: usage.total_voice - usage.remaining_voice!,
          label: "Call",
          icon: "phone",
          unit: "mins",
        })
      }

      const sim = sims.find(s => s.iccid === iccid)
      if (sim) {
        const total = getDaysBetweenInclusive(sim.created_at_ms, sim.expiration_ms)
        const remaining = getDaysRemaining(sim.expiration_ms)
        stats.push({
          total: total,
          used: total - remaining,
          label: "Validity",
          icon: "calendar",
          unit: "days",
          formatValue: () => "7 days left",
        })
      }
      statsMap[iccid] = stats
    }
    return statsMap
  }, [usageQuery.data, sims])

  const simsQuery = $api.useQuery('get', '/fetch-sims/{id}',
    {
      params: {
        path: {
          id: account?.address ?? ""
        }
      }
    },
    {
      enabled: !!account?.address,
    },
  )

  useEffect(() => {
    const data = simsQuery?.data?.data;
    if (data && data.length > 0) {
      setSims((prev) => [
        ...prev.filter((t) => !data.find((s) => t.iccid === s.iccid)),
        ...data,
      ]);
      setSelectedSim(sims[0]);
    }

    if (!simsQuery.isFetched) {
      setShowContent(false);
      setProgress(0.0);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      intervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev < 0.9) return +(prev + 0.01).toFixed(2);
          return prev;
        });
      }, 30);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const finishInterval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev < 1.0) return +(prev + 0.05).toFixed(2);
          clearInterval(finishInterval);
          return 1.0;
        });
      }, 16);

      const timeout = window.setTimeout(() => {
        setShowContent(true);
        setProgress(0);
      }, 400);

      return () => {
        clearInterval(finishInterval);
        clearTimeout(timeout);
      };
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [simsQuery.isFetched, simsQuery.data]);

  useEffect(() => {
    if (!selectedSim && sims.length > 0) {
      setSelectedSim(sims[0])
    }
  }, [sims])

  const handleSimHomeTabChange = useCallback((index: number) => {
    if (expiredSims.length < 1) return
    setTabIndex(index);
  }, []);

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
    expiredSims,
    searchQuery,
    filteredData,
    sims,
    selectedSim,
    simsQuery,
    simDetails,
    usageStats,
    progress,
    showContent,
    setSelectedSim,
    setSearchQuery,
    handleTabChange,
    handleSimHomeTabChange,
  };
}

function getDaysRemaining(targetTimestamp: number): number {
  // Get current date at midnight (start of today)
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Calculate difference in milliseconds
  const diffMs = targetTimestamp - today.getTime();

  // Convert to days and round up
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Ensure we don't return negative days
  return Math.max(0, daysRemaining);
}

function getDaysBetweenInclusive(startTimestamp: number, endTimestamp: number): number {
  // Ensure start is before end (swap if needed)
  const [start, end] = startTimestamp <= endTimestamp
    ? [startTimestamp, endTimestamp]
    : [endTimestamp, startTimestamp];

  // Round start down to midnight (beginning of day)
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  const roundedStart = startDate.getTime();

  // Round end up to 23:59:59.999 (end of day)
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  const roundedEnd = endDate.getTime();

  // Calculate difference in days (inclusive)
  const diffMs = roundedEnd - roundedStart;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  return days;
}
