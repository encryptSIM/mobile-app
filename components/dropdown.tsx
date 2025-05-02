import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Picker, PickerIOS } from "@react-native-picker/picker";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: Option[];
};

const DropdownSelector: React.FC<Props> = ({
  label,
  selectedValue,
  onValueChange,
  options,
}) => {
  if (Platform.OS === "ios") {
    // You can create a custom modal-based picker for iOS if you want
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.pickerContainer}>
          <PickerIOS
            onValueChange={(itemValue) => onValueChange(itemValue as string)}
            selectedValue={selectedValue}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {options.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </PickerIOS>
        </View>
      </View>
    );
  }

  // Android version
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={[styles.picker, { height: 44 }]}
          itemStyle={styles.pickerItem}
          mode="dropdown"
        >
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
              color="#000"
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  pickerContainer: {
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  picker: {
    height: 44,
    color: "#000",
  },
  pickerItem: {
    height: 44,
    fontSize: 16,
    color: "#000",
  },
});

export default DropdownSelector;
