import React from "react";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { SvgProps } from "react-native-svg";

export const iconRegistry = {
  x: require("@/assets/x.svg"),
  check: require("@/assets/check.svg"),
  minus: require("@/assets/minus.svg"),
  speed: require("@/assets/speed.svg"),
  plus: require("@/assets/plus.svg"),
  search: require("@/assets/search.svg"),
  back: require("@/assets/back.png"),
  applePay: require("@/assets/apple-pay.png"),
  appLogo: require("@/assets/app-logo.png"),
  appLogoLight: require("@/assets/app-logo-light.png"),
  backpack: require("@/assets/backpack.png"),
  bitPay: require("@/assets/bit-pay.png"),
  bitcoin: require("@/assets/bitcoin.png"),
  buyEsim: require("@/assets/buy-esim.png"),
  coinbase: require("@/assets/coinbase.png"),
  dvpn: require("@/assets/dvpn.png"),
  ethereum: require("@/assets/ethereum.png"),
  glow: require("@/assets/glow.png"),
  googlePay: require("@/assets/google-pay.png"),
  mastercard: require("@/assets/mastercard.png"),
  metamask: require("@/assets/metamask.png"),
  paypal: require("@/assets/paypal.png"),
  phantom: require("@/assets/phantom.png"),
  profile: require("@/assets/profile.png"),
  simCard: require("@/assets/sim-card.png"),
  sim: require("@/assets/sim.png"),
  solflare: require("@/assets/solflare.png"),
  solana: require("@/assets/solana.png"),
  stripe: require("@/assets/stripe.png"),
  trust: require("@/assets/trust.png"),
  visa: require("@/assets/visa.png"),
  copy: require("@/assets/copy.svg"),
  wallet: require("@/assets/wallet.svg"),
  logout: require("@/assets/logout.svg"),
  wifi: require("@/assets/wifi.svg"),
  phone: require("@/assets/phone.svg"),
  sms: require("@/assets/sms.svg"),
  calendar: require("@/assets/calendar.svg"),
  checkCircle: require("@/assets/checkCircle.svg"),
  alert: require("@/assets/alert.svg"),
  right: require("@/assets/right.svg"),
  alertCircle: require("@/assets/alertCircle.svg"),
  cube: require("@/assets/cube.svg"),
  swap: require("@/assets/swap.svg"),
  pencil: require("@/assets/pencil.svg"),
  chevronDown: require("@/assets/chevronDown.svg"),
};

export type IconType = keyof typeof iconRegistry;

export const IconSize = {
  small: 16,
  medium: 20,
  large: 32,
  normal: 24,
};

export type IconSizeType = keyof typeof IconSize;

export interface IconProps extends TouchableOpacityProps {
  icon: IconType;
  size?: IconSizeType;
  colour?: string;
  loading?: boolean;
}

export const Icon: React.FC<IconProps> = React.memo(
  ({ icon, size = "medium", colour = "#666", loading = false, ...touchableProps }) => {
    const IconComponent = iconRegistry[icon];
    const dimension = IconSize[size];

    const isPressable =
      !!touchableProps.onPress ||
      !!touchableProps.onLongPress ||
      !!touchableProps.onPressIn ||
      !!touchableProps.onPressOut;

    const Content = () => {
      if (loading) {
        return (
          <ActivityIndicator
            size="small"
            color={colour}
            style={{ width: dimension, height: dimension }}
          />
        );
      }

      if (typeof IconComponent === "function") {
        const SvgIcon = IconComponent as React.FC<SvgProps>;
        return <SvgIcon width={dimension} height={dimension} fill={colour} />;
      }

      return (
        <Image
          source={IconComponent as ImageSourcePropType}
          style={{ width: dimension, height: dimension, tintColor: colour }}
          resizeMode="contain"
        />
      );
    };

    if (isPressable) {
      return (
        <TouchableOpacity disabled={loading} {...touchableProps}>
          <Content />
        </TouchableOpacity>
      );
    }

    return (
      <View>
        <Content />
      </View>
    );
  }
);
