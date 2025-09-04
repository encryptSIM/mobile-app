import Alert from "@/assets/alert.svg";
import AlertCircle from "@/assets/alertCircle.svg";
import AppLogoLight from "@/assets/app-logo-light.png";
import AppLogo from "@/assets/app-logo.png";
import ApplePay from "@/assets/apple-pay.png";
import Back from "@/assets/back.png";
import Backpack from "@/assets/backpack.png";
import BitPay from "@/assets/bit-pay.png";
import Bitcoin from "@/assets/bitcoin.png";
import BuyEsim from "@/assets/buy-esim.png";
import Calendar from "@/assets/calendar.png";
import Check from "@/assets/check.svg";
import CheckCircle from "@/assets/checkCircle.svg";
import ChevronDown from "@/assets/chevronDown.png";
import Coinbase from "@/assets/coinbase.png";
import Copy from "@/assets/copy.svg";
import Cube from "@/assets/cube.png";
import Dvpn from "@/assets/dvpn.png";
import Ethereum from "@/assets/ethereum.png";
import Glow from "@/assets/glow.png";
import GooglePay from "@/assets/google-pay.png";
import Logout from "@/assets/logout.svg";
import Mastercard from "@/assets/mastercard.png";
import Metamask from "@/assets/metamask.png";
import Minus from "@/assets/minus.svg";
import Paypal from "@/assets/paypal.png";
import Pencil from "@/assets/pencil.svg";
import Phantom from "@/assets/phantom.png";
import Phone from "@/assets/phone.png";
import Plus from "@/assets/plus.svg";
import Profile from "@/assets/profile.png";
import Right from "@/assets/right.svg";
import Search from "@/assets/search.svg";
import SimCard from "@/assets/sim-card.png";
import Sim from "@/assets/sim.png";
import Sms from "@/assets/sms.png";
import Solana from "@/assets/solana.png";
import Solflare from "@/assets/solflare.png";
import Speed from "@/assets/speed.svg";
import Stripe from "@/assets/stripe.png";
import Swap from "@/assets/swap.svg";
import Trust from "@/assets/trust.png";
import Visa from "@/assets/visa.png";
import Wallet from "@/assets/wallet.svg";
import Wifi from "@/assets/wifi.png";
import X from "@/assets/x.svg";
import React from "react";
import { ActivityIndicator, Image, ImageSourcePropType, TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import { SvgProps } from "react-native-svg";

export const iconRegistry = {
  x: X,
  check: Check,
  minus: Minus,
  speed: Speed,
  plus: Plus,
  search: Search,
  copy: Copy,
  wallet: Wallet,
  logout: Logout,
  wifi: Wifi,
  phone: Phone,
  sms: Sms,
  calendar: Calendar,
  checkCircle: CheckCircle,
  alert: Alert,
  right: Right,
  alertCircle: AlertCircle,
  cube: Cube,
  swap: Swap,
  pencil: Pencil,
  chevronDown: ChevronDown,
  back: Back,
  applePay: ApplePay,
  appLogo: AppLogo,
  appLogoLight: AppLogoLight,
  backpack: Backpack,
  bitPay: BitPay,
  bitcoin: Bitcoin,
  buyEsim: BuyEsim,
  coinbase: Coinbase,
  dvpn: Dvpn,
  ethereum: Ethereum,
  glow: Glow,
  googlePay: GooglePay,
  mastercard: Mastercard,
  metamask: Metamask,
  paypal: Paypal,
  phantom: Phantom,
  profile: Profile,
  simCard: SimCard,
  sim: Sim,
  solflare: Solflare,
  solana: Solana,
  stripe: Stripe,
  trust: Trust,
  visa: Visa,
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

      // Handle images (png, jpg)
      if (typeof IconComponent === "number" || typeof IconComponent === "string") {
        return (
          <Image
            source={IconComponent as ImageSourcePropType}
            style={{ width: dimension, height: dimension, tintColor: colour }}
            resizeMode="contain"
          />
        );
      }

      // Handle SVGs
      if (typeof IconComponent === "function") {
        const SvgIcon = IconComponent as React.FC<SvgProps>;
        return <SvgIcon width={dimension} height={dimension} fill={colour} />;
      }

      console.warn("Invalid icon type:", icon, IconComponent);
      return null;
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
