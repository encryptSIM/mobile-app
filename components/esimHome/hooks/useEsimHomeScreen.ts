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
import { useMultiUsage } from "@/airalo-api/queries/usage";
import { UsageStat } from "../components/simUsagePanel";
import { PackageDetailsCardField } from "@/components/packageSelection/components";
import { IconType } from "@/components/Icon";
import { useWalletAuth } from "@/components/auth/wallet-auth-provider";
import { useAuthorization } from "@/components/auth/useAuthorization";

export const SELECTED_SIM = {
  key: "SELECTED_SIM",
  initialState: null,
};

export function useEsimHomeScreen() {
  const [tabIndex, setTabIndex] = useState<number>(0);
  // const { isConnected, account } = useWalletAuth();
  const auth = useAuthorization()
  const account = auth?.accounts ? auth?.accounts[0] : undefined
  const isConnected = !!account
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sims, setSims] = useSharedState<Sim[]>(SIMS.key, SIMS.initialState);
  const [selectedSim, setSelectedSim] = useSharedState<Sim | null>(
    SELECTED_SIM.key,
    SELECTED_SIM.initialState
  );
  const usageQuery = useMultiUsage(sims.map((s) => s.iccid));
  const expiredSims = useMemo(
    () => sims.filter((s) => s.expiration_ms < Date.now()),
    [sims]
  );
  const [progress, setProgress] = useState<number>(0.0);
  const [showContent, setShowContent] = useSharedState("SHOW_CONTENT");
  const intervalRef = useRef<number | null>(null);

  const simsQuery = $api.useQuery(
    "get",
    "/fetch-sims/{id}",
    {
      params: {
        path: {
          id: account?.address ?? "",
        },
      },
    },
    {
      enabled: !!account?.address && isConnected,
      queryHash: account?.address ?? "",
    }
  );

  useEffect(() => {
    console.log("--------------------------------------------------")
    console.log("simsQuery config and options", {
      method: "get",
      path: "/fetch-sims/{id}",
      options: {
        params: {
          path: {
            id: account?.address ?? "",
          },
        },
      },
      other: {
        enabled: !!account?.address && isConnected,
        queryHash: account?.address ?? "",
      }
    })
    console.log("--------------------------------------------------")
  }, [account, isConnected])


  useEffect(() => {
    if (account?.address && isConnected) {
      console.log("🔄 Account/auth changed, refetching simsQuery", {
        address: account.address,
        isConnected
      });
      simsQuery.refetch();
    }
  }, [account?.address, isConnected]);

  useEffect(() => {
    console.log("🔍 sims:", sims);
    console.log("🔍 selectedSim:", selectedSim);
    console.log("🔍 usageQuery.data:", usageQuery.data);
    console.log("🔍 expiredSims:", expiredSims);
    console.log("🔍 account from auth:", account);
    console.log("🔍 isConnected:", isConnected);
  }, [sims, selectedSim, usageQuery.data, expiredSims, account, isConnected]);

  useEffect(() => {
    console.log("🔍 simsQuery config:", {
      enabled: !!account?.address && isConnected,
      accountAddress: account?.address,
      queryHash: account?.address ?? "",
      isFetched: simsQuery.isFetched,
      isLoading: simsQuery.isLoading,
      error: simsQuery.error,
    });
  }, [account?.address, isConnected, simsQuery.isFetched, simsQuery.isLoading, simsQuery.error]);

  useEffect(() => {
    const simsSim = simsQuery.data?.data?.find(
      (t) => t.iccid === selectedSim?.iccid
    );
    if (selectedSim?.installed === simsSim?.installed) return;
    simsQuery.refetch();
  }, [selectedSim]);

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
      const stats = usageQuery.data ?? {};

      const total = getDaysBetweenInclusive(
        sim.created_at_ms,
        sim.expiration_ms
      );

      const simStats = stats[sim.iccid];
      if (!simStats) {
        console.warn(
          `⚠️ No usage stats found for SIM ${sim.iccid}, skipping details.`
        );
      }

      addDetail("Calls (min)", "phone", simStats?.total_voice, packageDetails);
      addDetail("SMS", "sms", simStats?.total_text, packageDetails);
      addDetail("Data", "wifi", simStats?.total, packageDetails);
      addDetail("Validity", "calendar", total, packageDetails);

      return { sim, packageDetails };
    });
  }, [expiredSims, usageQuery.data]);

  const usageStats = useMemo(() => {
    const statsMap: Record<string, UsageStat[]> = {};
    if (!usageQuery.data) return {};

    for (const iccid of Object.keys(usageQuery.data)) {
      const usage = usageQuery.data?.[iccid];
      if (!usage) {
        console.warn(`⚠️ Missing usage data for SIM ${iccid}`);
        continue;
      }

      const stats: UsageStat[] = [];

      if (usage.total_text) {
        stats.push({
          total: usage.total_text,
          used: usage.total_text - (usage.remaining_text ?? 0),
          label: "SMS",
          icon: "sms",
          unit: "messages",
        });
      }

      if (usage.total) {
        stats.push({
          total: usage.total,
          used: usage.total - (usage.remaining ?? 0),
          label: "Data",
          icon: "wifi",
          unit: "MB",
        });
      }

      if (usage.total_voice) {
        stats.push({
          total: usage.total_voice,
          used: usage.total_voice - (usage.remaining_voice ?? 0),
          label: "Call",
          icon: "phone",
          unit: "mins",
        });
      }

      const sim = sims.find((s) => s.iccid === iccid);
      if (sim) {
        const total = getDaysBetweenInclusive(
          sim.created_at_ms,
          sim.expiration_ms
        );
        const remaining = getDaysRemaining(sim.expiration_ms);
        stats.push({
          total,
          used: total - remaining,
          label: "Validity",
          icon: "calendar",
          unit: "days",
          formatValue: () => `${remaining} days left`,
        });
      }

      statsMap[iccid] = stats;
    }

    return statsMap;
  }, [usageQuery.data, sims]);

  useEffect(() => {
    console.log("🔄 simsQuery.isFetched:", simsQuery.isFetched);
    console.log("🔄 simsQuery.isLoading:", simsQuery.isLoading);
    console.log("🔄 simsQuery.error:", simsQuery.error);
    console.log("📦 simsQuery.data:", simsQuery.data);

    const data = simsQuery?.data?.data;
    if (data && data.length > 0) {
      console.log("✅ Updating sims state with fetched data");
      setSims((prev) => [
        ...prev.filter((t) => !data.find((s) => t.iccid === s.iccid)),
        ...data,
      ]);
      if (!selectedSim) {
        console.log("🎯 Setting initial selectedSim");
        setSelectedSim(data[0]);
      }
    }

    if (!simsQuery.isFetched) {
      console.log("⏳ simsQuery not fetched yet → showing loading progress");
      setShowContent(false);
      setProgress(0.0);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      intervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          const next = prev < 0.9 ? +(prev + 0.01).toFixed(2) : prev;
          return next;
        });
      }, 30);
    } else {
      console.log("✅ simsQuery fetched → finishing progress and showing content");

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const finishInterval = window.setInterval(() => {
        setProgress((prev) => {
          const next = prev < 1.0 ? +(prev + 0.05).toFixed(2) : 1.0;
          if (next >= 1.0) {
            clearInterval(finishInterval);
          }
          return next;
        });
      }, 16);

      const timeout = window.setTimeout(() => {
        console.log("🎉 Setting showContent = true");
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
        console.log("🧹 Cleaning up intervalRef");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [simsQuery.isFetched, simsQuery.data, simsQuery.isLoading, simsQuery.error]);

  useEffect(() => {
    if (!selectedSim && sims.length > 0) {
      setSelectedSim(sims[0]);
    }
  }, [sims]);

  const handleSimHomeTabChange = useCallback(
    (index: number) => {
      if (expiredSims.length < 1) return;
      setTabIndex(index);
    },
    [expiredSims]
  );

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
    const result = fuse.search(searchQuery).map((result) => result.item)
    if (result.length === 0) return rawData
    return result
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
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const diffMs = targetTimestamp - today.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, daysRemaining);
}

function getDaysBetweenInclusive(
  startTimestamp: number,
  endTimestamp: number
): number {
  const [start, end] =
    startTimestamp <= endTimestamp
      ? [startTimestamp, endTimestamp]
      : [endTimestamp, startTimestamp];

  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  const roundedStart = startDate.getTime();

  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  const roundedEnd = endDate.getTime();

  const diffMs = roundedEnd - roundedStart;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  return days;

}
