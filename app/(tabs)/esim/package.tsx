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
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, Switch } from "react-native";

type DropdownOption = { label: string; value: string };

export default function EsimScreen() {
  const { value: publicKey } = useAsyncStorage<string>("publicKey");
  const [packages, setPackages] = useState<RegionPackage[]>([]);
  const [region, setRegion] = useState<string>("");
  const [selectedDataSize, setSelectedDataSize] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [type, setType] = useState<"global" | "local">("global");
  const [packageId, setPackageId] = useState<string | null>(null);
  const router = useRouter();

  const capitalize = (str: string) =>
    str
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");

  useEffect(() => {
    getPackages({ type }).then((res) => {
      const data: RegionPackage[] = res.data;
      setPackages(data);
      if (data.length > 0) setRegion(data[0].region);
    });
  }, [type]); // re-fetch when type changes

  const regionOptions = useMemo<DropdownOption[]>(
    () =>
      packages.map((r) => ({
        label: capitalize(r.region),
        value: r.region,
      })),
    [packages]
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
    setPackageId(
      validPackages.find(
        (p) => p.data === selectedDataSize && `${p.day}` === selectedDuration
      )?.id ?? null
    );
    return validPackages.find(
      (p) => p.data === selectedDataSize && `${p.day}` === selectedDuration
    )?.price;
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

  const handleCreateOrder = async () => {
    if (!publicKey) {
      console.error("Public key is not available");
      return;
    }
    const order = await createOrder({
      package_id: packageId ?? "",
      ppPublicKey: publicKey, // publicKey,
      quantity: 1,
      package_price: currentPrice?.toString() ?? "0",
    });
    router.push({
      pathname: "/esim/order",
      params: { orderId: order.data.orderId },
    });
    console.log("Order response:", order);
    console.log("Order created:", order.data.orderId);
  };

  return (
    <View className="h-full">
      <SafeAreaView className="flex-1 px-4">
        <Text className="text-red-500 text-3xl font-bold text-center mb-6">
          eSIM
        </Text>

        {/* Switch for type */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-medium">Show Local Packages</Text>
          <Switch
            value={type === "local"}
            onValueChange={(val) => setType(val ? "local" : "global")}
          />
        </View>

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
              setSelectedDuration(null); // reset duration to trigger reselect
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
          <View className="mt-4">
            <Text className="text-lg font-semibold mb-2">Price</Text>
            <Text className="text-center text-green-600 text-xl font-bold">
              {currentPrice ? `$${currentPrice}` : "Not available"}
            </Text>
          </View>
        )}
        {selectedDataSize && selectedDuration && packageId && (
          <View className="mt-4">
            <AppButton
              label="Buy eSIM"
              iconName="credit-card"
              variant="moonlight"
              onPress={() => {
                handleCreateOrder();
              }}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
