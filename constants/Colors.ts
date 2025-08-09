import { background, brandGreen } from "@/components/app-providers";

const tintColorLight = brandGreen;
const tintColorDark = '#2BB069';

export default {
  light: {
    text: background,
    background: '#F8FAFC',
    modalBackground: '#FFFFFF',
    tint: tintColorLight,
    primary: tintColorLight, // alias
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F8FAFC',
    background: background,
    modalBackground: '#1F2837',
    tint: tintColorDark,
    primary: tintColorDark, // alias
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
  },
};
