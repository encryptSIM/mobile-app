import { createAsyncStorage } from "@/components/cache/asyncStorage";
import { useCachedData } from "@/components/cache/useCachedData";
import { PackageDetailsCardField } from "@/components/packageSelection/components/packageDetailsCard";
import { useMemo } from "react";
import { airaloFetchClient } from "../api";
import { RemoteCache } from "@/components/cache/types";
import { fetchClient } from "@/api/api";

const localStorage = createAsyncStorage();

const createRemoteCache = (): RemoteCache => ({
  get: async (key) => {
    const response = await fetchClient.GET(`/cache/{key}`, { params: { path: { key } } });
    const data: any | undefined = response.data?.data?.value
    return data ? data : null;
  },
  set: async (key, value, ttl) => {
    await fetchClient.POST('/cache/{key}', {
      body: {
        value: value as any
      },
      params: { path: { key } }
    })
  },
  delete: async (key) => {
    await fetchClient.DELETE(`/cache/{key}`, { params: { path: { key } } });
  },
});

export const useGlobalPackages = (enabled?: boolean) => {
  return useCachedData({
    queryKey: ["packages", "global"],
    queryFn: async () => {
      const response = await airaloFetchClient.GET("/v2/packages", {
        params: {
          query: {
            "filter[type]": "global"
          }
        }
      });
      return response;
    },
    localStorage,
    remoteCache: createRemoteCache(),
    localTTL: 65 * 60 * 1000,
    remoteTTL: 65 * 60 * 1000,
    staleTime: 65 * 60 * 1000,
    queryOptions: {
      enabled: enabled ?? true,
    },
  });
};

export const useLocalPackages = (country?: string) => {
  return useCachedData({
    queryKey: ["packages", "local" + country?.toString()],
    queryFn: async () => {
      const response = await airaloFetchClient.GET("/v2/packages", {
        params: {
          query: {
            "filter[type]": "local",
            "filter[country]": country
          }
        }
      });
      return response;
    },
    localStorage,
    remoteCache: createRemoteCache(),
    localTTL: 65 * 60 * 1000,
    remoteTTL: 65 * 60 * 1000,
    staleTime: 65 * 60 * 1000,
    queryOptions: {
      enabled: !!country,
    },
  });
};

export const usePackageDetails = (params?: {
  countryCode?: string;
  region?: string;
}) => {
  const { countryCode, region } = params || {};

  const localPackagesQuery = useLocalPackages(
    countryCode ? String(countryCode) : undefined
  );
  const globalPackagesQuery = useGlobalPackages(!!region);

  const activeQuery = countryCode ? localPackagesQuery : globalPackagesQuery;

  const packages = useMemo(() => {
    if (countryCode) {
      console.log("Country code");
      const queryData = localPackagesQuery.data;
      return (
        queryData?.data?.data?.flatMap(
          (i) => i.operators?.flatMap((j) => j.packages) || []
        ) || []
      );
    } else if (region) {
      const queryData = globalPackagesQuery.data;
      console.log("queryData", queryData);
      return (
        queryData?.data?.data
          ?.find((t) => t.slug === region)
          ?.operators?.flatMap((j) => j.packages) || []
      );
    }
    return [];
  }, [
    countryCode,
    region,
    localPackagesQuery.data,
    globalPackagesQuery.data,
  ]);

  const packageDetails = useMemo(() => {
    if (!packages || packages.length === 0) {
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

      return { localPackage, packageDetails };
    });
  }, [packages]);

  return {
    packageDetails,
    ...activeQuery,
  };
};
