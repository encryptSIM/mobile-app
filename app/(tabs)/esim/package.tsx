import { Text, View } from "@/components/Themed";
import { AppButton } from "@/components/button";
import DropdownSelector from "@/components/dropdown";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import {
  getPackages,
  type EsimPackage,
  type RegionPackage,
} from "@/service/package";
import { createOrder } from "@/service/payment";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView, Switch } from "react-native";
import { Header } from "@/components/Header";

type DropdownOption = { label: string; value: string };

const PackageTypeSwitch = React.memo(
  ({
    type,
    onTypeChange,
  }: {
    type: "global" | "local";
    onTypeChange: (value: boolean) => void;
  }) => (
    <View className="flex-row justify-between items-center mb-4">
      <Text className="text-lg font-medium">Show Local Packages</Text>
      <Switch value={type === "local"} onValueChange={onTypeChange} />
    </View>
  )
);

const PriceDisplay = React.memo(({ price }: { price: number | undefined }) => (
  <View className="mt-4">
    <Text className="text-lg font-semibold mb-2">Price</Text>
    <Text className="text-center text-green-600 text-xl font-bold">
      {price ? `$${price}` : "Not available"}
    </Text>
  </View>
));

export default function EsimScreen() {
  const { value: publicKey } = useAsyncStorage<string>("publicKey");
  const [packages, setPackages] = useState<RegionPackage[]>([]);
  const [region, setRegion] = useState<string>("");
  const [selectedDataSize, setSelectedDataSize] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [type, setType] = useState<"global" | "local">("global");
  const [packageId, setPackageId] = useState<string | null>(null);
  const router = useRouter();

  const capitalize = useCallback(
    (str: string) =>
      str
        .split("-")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" "),
    []
  );

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await getPackages({ type });
        const data: RegionPackage[] = res.data;
        setPackages(data);
        if (data.length > 0) setRegion(data[0].region);
      } catch (error) {
        console.error("Failed to fetch packages:", error);
      }
    };

    fetchPackages();
  }, [type]);

  const regionOptions = useMemo<DropdownOption[]>(
    () =>
      packages.map((r) => ({
        label: capitalize(r.region),
        value: r.region,
      })),
    [packages, capitalize]
  );

  const validPackages = useMemo<EsimPackage[]>(() => {
    const selected = packages.find((r) => r.region === region);
    return selected
      ? selected.operators
          .flatMap((op) => op.packages)
          .filter((p) => typeof p.price === "number" && !isNaN(p.price))
      : [];
  }, [region, packages]);

  const dataSizes = useMemo<string[]>(
    () => Array.from(new Set(validPackages.map((p) => p.data))),
    [validPackages]
  );

  const durations = useMemo<string[]>(
    () =>
      Array.from(
        new Set(
          validPackages
            .filter((p) => p.data === selectedDataSize)
            .map((p) => `${p.day}`)
        )
      ),
    [validPackages, selectedDataSize]
  );

  const currentPrice = useMemo(() => {
    const selectedPackage = validPackages.find(
      (p) => p.data === selectedDataSize && `${p.day}` === selectedDuration
    );
    setPackageId(selectedPackage?.id ?? null);
    return selectedPackage?.price;
  }, [validPackages, selectedDataSize, selectedDuration]);

  useEffect(() => {
    if (dataSizes.length > 0) {
      setSelectedDataSize(dataSizes[0]);
    } else {
      setSelectedDataSize(null);
      setSelectedDuration(null);
    }
  }, [dataSizes]);

  useEffect(() => {
    if (durations.length > 0) {
      setSelectedDuration(durations[0]);
    } else {
      setSelectedDuration(null);
    }
  }, [durations]);

  const handleCreateOrder = useCallback(() => {
    if (!packageId || !currentPrice) {
      console.error("Missing required data for order creation");
      return;
    }
    console.log("packageId", packageId);
    console.log("currentPrice", currentPrice);

    router.push({
      pathname: "/esim/order-processing",
      params: {
        packageId: packageId,
        price: currentPrice.toString(),
        type: type,
      },
    });
  }, [packageId, currentPrice, router]);

  const handleTypeChange = useCallback((value: boolean) => {
    setType(value ? "local" : "global");
  }, []);

  return (
    <View className="h-full">
      <SafeAreaView className="flex-1">
        <Header showBackButton={false} title="eSIM" />
        <View className="px-4">
          <PackageTypeSwitch type={type} onTypeChange={handleTypeChange} />

          <DropdownSelector
            label={type === "local" ? "Country" : "Region"}
            selectedValue={region}
            onValueChange={setRegion}
            options={regionOptions}
          />

          {region && dataSizes.length > 0 && (
            <DropdownSelector
              label="Data Size"
              selectedValue={selectedDataSize ?? ""}
              onValueChange={(value) => {
                setSelectedDataSize(value);
                setSelectedDuration(null);
              }}
              options={dataSizes.map((size) => ({
                label: size,
                value: size,
              }))}
            />
          )}

          {selectedDataSize && durations.length > 0 && (
            <DropdownSelector
              label="Duration"
              selectedValue={selectedDuration ?? ""}
              onValueChange={setSelectedDuration}
              options={durations.map((d) => ({
                label: `${d} Days`,
                value: d,
              }))}
            />
          )}

          {selectedDataSize && selectedDuration && (
            <PriceDisplay
              price={currentPrice ? Number(currentPrice) : undefined}
            />
          )}

          {selectedDataSize && selectedDuration && packageId && (
            <View className="mt-4">
              <AppButton
                label="Buy eSIM"
                iconName="credit-card"
                variant="moonlight"
                onPress={handleCreateOrder}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
