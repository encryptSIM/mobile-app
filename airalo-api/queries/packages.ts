import { createAsyncStorage } from "@/components/cache/asyncStorage";
import { useCachedData } from "@/components/cache/useCachedData";
import { PackageDetailsCardField } from "@/components/packageSelection/components/packageDetailsCard";
import { useMemo } from "react";
import { airaloFetchClient, TopupPackage } from "../api";
import { RemoteCache } from "@/components/cache/types";
import { fetchClient } from "@/api/api";

const localStorage = createAsyncStorage();

const createRemoteCache = (): RemoteCache => ({
  get: async (key) => {
    console.log("[RemoteCache] GET called with key:", key);
    const response = await fetchClient.GET(`/cache/{key}`, {
      params: { path: { key } },
    });
    const data: any | undefined = response.data?.data?.value;
    console.log("[RemoteCache] GET response data:", data);
    return data ? data : null;
  },
  set: async (key, value, ttl) => {
    console.log("[RemoteCache] SET called with key:", key, "value:", value, "ttl:", ttl);
    await fetchClient.POST("/cache/{key}", {
      body: {
        value: value as any,
      },
      params: { path: { key } },
    });
    console.log("[RemoteCache] SET completed for key:", key);
  },
  delete: async (key) => {
    console.log("[RemoteCache] DELETE called with key:", key);
    await fetchClient.DELETE(`/cache/{key}`, { params: { path: { key } } });
    console.log("[RemoteCache] DELETE completed for key:", key);
  },
});

export const useTopupPackages = (iccid?: string) => {
  console.log("[useTopupPackages] Hook called with iccid:", iccid);
  return useCachedData({
    queryKey: ["packages", "topup", iccid!],
    queryFn: async () => {
      console.log("[useTopupPackages] Fetching topup packages for iccid:", iccid);
      const response = await airaloFetchClient.GET("/v2/sims/{iccid}/topups", {
        params: {
          path: {
            iccid: iccid as any,
          },
        },
      });
      console.log("[useTopupPackages] API response:", JSON.stringify(response.data, null, 2));
      return response
    },
    localStorage,
    remoteCache: createRemoteCache(),
    localTTL: 0.1 * 60 * 1000,
    remoteTTL: 0.1 * 60 * 1000,
    staleTime: 0.1 * 60 * 1000,
    queryOptions: {
      enabled: !!iccid,
    },
  });
};

export const useGlobalPackages = (enabled: boolean) => {
  console.log("[useGlobalPackages] Hook called with enabled:", enabled);
  return useCachedData({
    queryKey: ["packages", "global"],
    queryFn: async () => {
      console.log("[useGlobalPackages] Fetching global packages");
      const response = await airaloFetchClient.GET("/v2/packages", {
        params: {
          query: {
            "filter[type]": "global",
          },
        },
      });
      console.log("[useGlobalPackages] API response:", response);
      return response;
    },
    localStorage,
    remoteCache: createRemoteCache(),
    localTTL: 65 * 60 * 1000,
    remoteTTL: 65 * 60 * 1000,
    staleTime: 65 * 60 * 1000,
    queryOptions: {
      enabled: enabled,
    },
  });
};

export const useLocalPackages = (enabled: boolean, country?: string) => {
  console.log("[useLocalPackages] Hook called with country:", country);
  return useCachedData({
    queryKey: ["packages", "local" + country?.toString()],
    queryFn: async () => {
      console.log("[useLocalPackages] Fetching local packages for country:", country);
      const response = await airaloFetchClient.GET("/v2/packages", {
        params: {
          query: {
            "filter[type]": "local",
            "filter[country]": country,
          },
        },
      });
      console.log("[useLocalPackages] API response:", response);
      return response;
    },
    localStorage,
    remoteCache: createRemoteCache(),
    localTTL: 65 * 60 * 1000,
    remoteTTL: 65 * 60 * 1000,
    staleTime: 65 * 60 * 1000,
    queryOptions: {
      enabled,
    },
  });
};

export const usePackageDetails = (params?: {
  countryCode?: string;
  region?: string;
  iccid?: string;
}) => {
  console.log("[usePackageDetails] Hook called with params:", params);
  const { countryCode, region, iccid } = params || {};

  const topupPackagesQuery = useTopupPackages(iccid);
  console.log("topupPackagesQuery", JSON.stringify(topupPackagesQuery.data?.data, null, 2))
  const localPackagesQuery = useLocalPackages(!iccid,
    countryCode ? String(countryCode) : undefined
  );
  const globalPackagesQuery = useGlobalPackages(!!region && !iccid);

  const activeQuery = iccid
    ? topupPackagesQuery
    : countryCode
      ? localPackagesQuery
      : globalPackagesQuery;

  const packages = useMemo(() => {
    console.log("[usePackageDetails] useMemo for packages called");
    if (countryCode) {
      console.log("[usePackageDetails] Using localPackagesQuery for countryCode:", countryCode);
      const queryData = localPackagesQuery.data;
      console.log("[usePackageDetails] localPackagesQuery data:", queryData);
      return (
        queryData?.data?.data?.flatMap(
          (i) => i.operators?.flatMap((j) => j.packages) || []
        ) || []
      );
    } else if (region) {
      const queryData = globalPackagesQuery.data;
      console.log("[usePackageDetails] Using globalPackagesQuery for region:", region);
      console.log("[usePackageDetails] globalPackagesQuery data:", queryData);
      return (
        queryData?.data?.data
          ?.find((t) => t.slug === region)
          ?.operators?.flatMap((j) => j.packages) || []
      );
    } else if (iccid) {
      console.log("[usePackageDetails] Using topupPackagesQuery for iccid:", iccid);
      console.log("[usePackageDetails] topupPackagesQuery data:", topupPackagesQuery.data);
      return topupPackagesQuery.data?.data?.data!.map((p: TopupPackage) => ({
        ...p,
        prices: {
          recommended_retail_price: {
            USD: p.price
          },
          net_price: {
            USD: p.net_price
          }
        }
      }));
    }
    console.log("[usePackageDetails] No packages found, returning empty array");
    return [];
  }, [
    countryCode,
    region,
    iccid,
    localPackagesQuery.data,
    globalPackagesQuery.data,
    topupPackagesQuery.data
  ]);

  const packageDetails = useMemo(() => {
    console.log("[usePackageDetails] useMemo for packageDetails called");
    if (!packages || packages.length === 0) {
      console.log("[usePackageDetails] No packages to process for details");
      return [];
    }

    const addDetail = (
      key: string,
      icon: string,
      value: any,
      detailsArray: PackageDetailsCardField[]
    ) => {
      if (value !== undefined && value !== null) {
        detailsArray.push({
          key,
          icon,
          value: String(value),
        });
        console.log(
          `[usePackageDetails] Added detail: key=${key}, icon=${icon}, value=${value}`
        );
      }
    };

    return packages.map((localPackage) => {
      const packageDetails: PackageDetailsCardField[] = [];

      addDetail("Calls (min)", "phone", localPackage?.voice, packageDetails);
      addDetail("SMS", "message-processing", localPackage?.text, packageDetails);
      addDetail("Data", "wifi", localPackage?.data, packageDetails);
      addDetail(
        "Validity",
        "calendar-month",
        localPackage?.day,
        packageDetails
      );

      console.log("[usePackageDetails] Package details for package:", localPackage, packageDetails);

      return { localPackage, packageDetails };
    });
  }, [packages]);

  console.log("[usePackageDetails] Returning packageDetails and activeQuery");
  return {
    packageDetails,
    ...activeQuery,
  };
};
