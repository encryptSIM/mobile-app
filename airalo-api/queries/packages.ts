import { PackageDetailsCardField } from "@/components/packageSelection/components/packageDetailsCard";
import { useMemo } from "react";
import { $api } from "../api";

export const useGlobalPackages = (enabled?: boolean) => $api
  .useQuery("get", "/v2/packages", {
    params: {
      query: {
        "filter[type]": "global"
      }
    }
  }, { enabled })

export const useLocalPackages = (country?: string) => $api
  .useQuery("get", "/v2/packages", {
    params: {
      query: {
        "filter[type]": "local",
        "filter[country]": country
      }
    }
  }, { enabled: !!country })

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
      console.log("Country code")
      const queryData = localPackagesQuery.data;
      return (
        queryData?.data?.flatMap(
          (i) => i.operators?.flatMap((j) => j.packages) || []
        ) || []
      );
    } else if (region) {
      const queryData = globalPackagesQuery.data;
      console.log("queryData", queryData)
      return (
        queryData?.data
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
      addDetail("SMS", "sms", localPackage?.text, packageDetails);
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
