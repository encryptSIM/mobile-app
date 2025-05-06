import { Text, View } from "@/components/Themed";
import DropdownSelector from "@/components/dropdown";
import {
  getPackages,
  type EsimPackage,
  type RegionPackage,
} from "@/service/package";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native";

type DropdownOption = { label: string; value: string };

export default function EsimScreen() {
  const [packages, setPackages] = useState<RegionPackage[]>([]);
  const [region, setRegion] = useState<string>("");
  const [selectedDataSize, setSelectedDataSize] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);

  const capitalize = (str: string) =>
    str
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");

  useEffect(() => {
    getPackages({ type: "global" }).then((res) => {
      const data: RegionPackage[] = res.data;
      setPackages(data);
      if (data.length > 0) setRegion(data[0].region);
    });
  }, []);

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
    return validPackages.find(
      (p) => p.data === selectedDataSize && `${p.day}` === selectedDuration
    )?.price;
  }, [validPackages, selectedDataSize, selectedDuration]);

  // Auto-select first data size and duration when region or size changes
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

  return (
    <SafeAreaView className="flex-1 px-4">
      <View className="h-full">
        <Text className="text-red-500 text-3xl font-bold text-center mb-6">
          eSIM
        </Text>

        <DropdownSelector
          label="Region"
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
      </View>
    </SafeAreaView>
  );
}
