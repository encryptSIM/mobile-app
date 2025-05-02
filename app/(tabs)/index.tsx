import { View, Text } from "@/components/Themed";
import DropdownSelector from "@/components/dropdown";
import { Link } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native";

const countries = [
  { label: "USA", value: "us" },
  { label: "Canada", value: "ca" },
];

const dataSizes = [
  { label: "1GB", value: "1gb" },
  { label: "5GB", value: "5gb" },
];

const days = [
  { label: "7 Days", value: "7" },
  { label: "30 Days", value: "30" },
];

export default function EsimScreen() {
  const [country, setCountry] = useState("us");
  const [dataSize, setDataSize] = useState("1gb");
  const [day, setDay] = useState("7");

  const getPrice = () => {
    if (dataSize === "5gb" && day === "30") return "$19.99";
    if (dataSize === "5gb") return "$12.99";
    return "$6.99";
  };

  return (
    <View className="flex-1">
      <SafeAreaView>
        <Text className="text-red-500 text-3xl font-bold text-center mb-8">
          Esim
        </Text>

        <View className="w-full">
          <DropdownSelector
            label="Country"
            selectedValue={country}
            onValueChange={setCountry}
            options={countries}
            // placeholder="Select a country"
          />

          <DropdownSelector
            label="Data Size"
            selectedValue={dataSize}
            onValueChange={setDataSize}
            options={dataSizes}
            // placeholder="Select data size"
          />

          <DropdownSelector
            label="Duration"
            selectedValue={day}
            onValueChange={setDay}
            options={days}
            // placeholder="Select duration"
          />
        </View>

        <Text className="text-lg font-semibold text-center mt-4">
          Price: <Text className="text-green-600">{getPrice()}</Text>
        </Text>

        <Link
          href="/onboarding"
          className="mt-10 text-blue-500 underline text-center"
        >
          Go to onboarding
        </Link>
      </SafeAreaView>
    </View>
  );
}
