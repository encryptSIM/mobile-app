import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import Colors from "@/constants/Colors";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.tint,
        tabBarStyle: {
          backgroundColor: Colors.dark.modalBackground,
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "eSim Home",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="mobile-phone" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="esim"
        options={{
          headerShown: false,
          title: "eSim",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="mobile-phone" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dVPN"
        options={{
          headerShown: false,
          title: "dVPN",
          tabBarIcon: ({ color }) => <TabBarIcon name="lock" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
