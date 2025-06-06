import { DefaultTheme, DarkTheme, Theme } from "@react-navigation/native";

export const LightTheme: Theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: "#32D583", // green
        background: "#F8FAFC",
        card: "#FFFFFF",
        text: "#111926",
        border: "#E2E8F0",
    },
};

export const DarkThemeCustom: Theme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: "#2BB069", // green
        background: "#111926",
        card: "#1F2837",
        text: "#F8FAFC",
        border: "#334155",
    },
};