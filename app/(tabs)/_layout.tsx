import { Tabs } from "expo-router";
import React from "react";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import Colors from "@/constants/Colors";
import { Icon } from "react-native-paper";
import { useSharedState } from "@/hooks/use-provider";

function TabBarIcon(props: {
  name: 'dVPN' | 'eSIM' | 'Profile'
  color: string;
}) {
  if (props.name === 'eSIM') return <Icon source={require('@/assets/sim-card.png')} size={24} color={props.color} />
  if (props.name === 'Profile') return <Icon source={require('@/assets/profile.png')} size={24} color={props.color} />
  return <Icon source={require('@/assets/dvpn.png')} size={24} color={props.color} />
}

export default function TabLayout() {
  const [showContent,] = useSharedState('SHOW_CONTENT', false)
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
          title: 'eSIM',
          tabBarStyle: { opacity: showContent ? 1 : 0 },
          tabBarIcon: ({ color }) => <TabBarIcon name="eSIM" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dVPN"
        options={{
          headerShown: false,
          title: "dVPN",
          tabBarStyle: { opacity: showContent ? 1 : 0 },
          tabBarIcon: ({ color }) => <TabBarIcon name="dVPN" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarStyle: { opacity: showContent ? 1 : 0 },
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="Profile" color={color} />,
        }}
      />
    </Tabs>
  );
}
