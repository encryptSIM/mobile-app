import { Sim } from "@/api/api";
import { countries, regions } from "@/constants/countries";
import { useState, useRef } from "react";
import {
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
  useWindowDimensions,
  StyleSheet,
  Platform,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { Text } from "react-native";
import { $styles } from "./styles";
import { Icon } from "@/components/Icon";
import { background } from "@/components/app-providers";

export interface SimSelectorProps {
  selectedSim: Sim | null;
  sims: Sim[];
  onSelectSim: (sim: Sim) => void;
}

function getSimImage(sim: Sim): string | undefined {
  return regions.find((r) => r.slug === sim.region!)?.image;
}

function getSimCountryOrRegion(sim: Sim): string {
  if (sim.region) {
    const region = regions.find((r) => r.slug === sim.region);
    if (region) return region.title;
  }
  if (sim.country_code) {
    const country = countries.find(
      (c) => c.value.toLowerCase() === sim.country_code?.toLowerCase()
    );
    if (country) return country.label;
  }
  return "Unknown Region";
}

export function SimSelector(props: SimSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0, w: 200 });
  const { width } = useWindowDimensions();
  const triggerRef = useRef<any>(null);

  if (!props.selectedSim) return null;

  const isMobile = width < 600;

  const openDropdown = () => {
    if (Platform.OS === "web" && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        x: rect.left,
        y: rect.bottom,
        w: rect.width,
      });
      setDropdownVisible(true);
    } else {
      setDropdownVisible(true);
    }
  };

  const renderSimItem = (
    sim: Sim,
    isSelected: boolean,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      key={sim.iccid}
      style={[$styles.simItem, isSelected && $styles.selectedSim]}
      onPress={onPress}
    >
      {sim.country_code ? (
        <CountryFlag
          style={$styles.flagImage}
          isoCode={sim.country_code}
          size={30}
        />
      ) : (
        <Image source={{ uri: getSimImage(sim)! }} style={$styles.flagImage} />
      )}
      <View style={{ paddingLeft: 16 }}>
        <Text style={$styles.simLabel}>{getSimCountryOrRegion(sim)}</Text>
        <Text style={$styles.simLabel}>{sim.package_title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      {/* Trigger */}
      <TouchableOpacity
        ref={triggerRef}
        style={[$styles.simItem, $styles.simDropdown]}
        disabled={props.sims.length < 2}
        onPressIn={() => (isMobile ? setModalVisible(true) : openDropdown())}
      >
        {props.selectedSim!.country_code ? (
          <CountryFlag
            style={$styles.flagImage}
            isoCode={props.selectedSim!.country_code}
            size={30}
          />
        ) : (
          <Image
            source={{ uri: getSimImage(props.selectedSim!)! }}
            style={$styles.flagImage}
          />
        )}
        <View style={$styles.simDropdownRight}>
          <Text style={[$styles.simLabel, { fontWeight: "500" }]}>
            {props.selectedSim!.package_title}
          </Text>
          {props.sims.length > 1 && <Icon icon={"chevronDown"} />}
        </View>
      </TouchableOpacity>

      {/* Web Dropdown (portal via Modal) */}
      {!isMobile && dropdownVisible && (
        <Modal transparent animationType="none" visible={dropdownVisible}>
          <TouchableOpacity
            style={dropdownStyles.overlay}
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}
          >
            <View
              style={[
                dropdownStyles.dropdownMenu,
                {
                  top: dropdownPos.y,
                  left: dropdownPos.x,
                  width: dropdownPos.w,
                },
              ]}
            >
              <ScrollView>
                {props.sims.map((sim) =>
                  renderSimItem(sim, props.selectedSim!.iccid === sim.iccid, () => {
                    setDropdownVisible(false);
                    props.onSelectSim(sim);
                  })
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Mobile Modal */}
      {isMobile && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => setModalVisible(false)}
            style={$styles.modalOverlay}
          >
            <View style={$styles.modalContent}>
              <View style={$styles.modalHeader}>
                <View style={$styles.dragHandle} />
              </View>

              <ScrollView style={$styles.simsList}>
                {props.sims.map((sim) =>
                  renderSimItem(sim, props.selectedSim!.iccid === sim.iccid, () => {
                    setModalVisible(false);
                    props.onSelectSim(sim);
                  })
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const dropdownStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdownMenu: {
    position: "absolute",
    backgroundColor: background,
    padding: 8,
    borderRadius: 12,
    maxHeight: 300,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#555",
    zIndex: 1000,
  },
});
