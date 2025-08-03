import { Sim } from "@/api/api";
import { $styles } from "./styles";
import { useState } from "react";
import { Image, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { Card, IconButton, List, Text } from "react-native-paper";
import { countries, regions } from "@/constants/countries";
import CountryFlag from "react-native-country-flag";

export interface SimSelectorProps {
  selectedSim: Sim | null
  sims: Sim[]
  onSelectSim: (sim: Sim) => void
}

function getSimImage(sim: Sim): string | undefined {
  return regions.find(r => r.slug === sim.region!)?.image
}

function getSimCountryOrRegion(sim: Sim): string {
  if (sim.region) {
    const region = regions.find(r => r.slug === sim.region)
    if (region) return region.title
  }
  if (sim.country_code) {
    const country = countries.find(c => c.value.toLowerCase() === sim.country_code?.toLowerCase())
    if (country) return country.label
  }
  return "Unknown Region"
}

export function SimSelector(props: SimSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);


  const openModal = () => {
    setModalVisible(true);
  };

  if (!props.selectedSim) return null

  return (
    <>
      <TouchableOpacity
        style={[
          $styles.simItem,
          $styles.simDropdown
        ]}
        disabled={props.sims.length < 2}
        onPress={openModal}
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
          <Text style={[
            $styles.simLabel,
            {
              fontWeight: 500,
            }

          ]}>{props.selectedSim.package_title}</Text>
          {props.sims.length > 1 && <List.Icon icon={'chevron-down'} />}
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={$styles.modalOverlay}>
          <View style={$styles.modalContent}>
            <View style={$styles.modalHeader}>
              <View style={$styles.dragHandle} />
            </View>

            <ScrollView style={$styles.simsList}>
              {props.sims.map((sim) => (
                <TouchableOpacity
                  key={sim.iccid}
                  style={[
                    $styles.simItem,
                    props.selectedSim!.iccid === sim.iccid && $styles.selectedSim,
                  ]}
                  onPress={() => props.onSelectSim(sim)}
                >
                  {props.selectedSim!.country_code ? (
                    <CountryFlag
                      style={$styles.flagImage}
                      isoCode={props.selectedSim!.country_code}
                      size={40}
                    />
                  ) : (
                    <Image
                      source={{ uri: getSimImage(props.selectedSim!)! }}
                      style={$styles.flagImage}
                    />
                  )}
                  <View>
                    <Text style={$styles.simLabel}>{getSimCountryOrRegion(sim)}</Text>
                    <Text style={$styles.simLabel}>{sim.package_title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
