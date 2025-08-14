import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { $styles } from './styles';

interface PaymentMethodOption {
  id: string;
  label: string;
  icon: any;
  disabled: boolean,
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  // {
  //   id: 'apple-pay',
  //   label: 'Apple pay',
  //   icon: require('@/assets/apple-pay.png'),
  // },
  // {
  //   id: 'bit-pay',
  //   label: 'Bit pay',
  //   icon: require('@/assets/bit-pay.png'),
  // },
  // {
  //   id: 'google-pay',
  //   label: 'Google pay',
  //   icon: require('@/assets/google-pay.png'),
  // },
  // {
  //   id: 'mastercard',
  //   label: 'Mastercard',
  //   icon: require('@/assets/mastercard.png'),
  // },
  {
    id: 'paypal',
    label: 'PayPal',
    disabled: true,
    icon: require('@/assets/paypal.png'),
  },
  // {
  //   id: 'stripe',
  //   label: 'Stripe',
  //   icon: require('@/assets/stripe.png'),
  // },
  {
    disabled: true,
    id: 'visa',
    label: 'Visa',
    icon: require('@/assets/visa.png'),
  },
  {
    id: 'bitcoin',
    label: 'Bitcoin',
    disabled: true,
    icon: require('@/assets/bitcoin.png'),
  },
  {
    id: 'solana',
    label: 'Solana',
    disabled: false,
    icon: require('@/assets/solana.png'),
  },
  {
    id: 'ethereum',
    label: 'Ethereum',
    disabled: true,
    icon: require('@/assets/ethereum.png'),
  },
];

interface PaymentMethodProps {
  selectedMethodId?: string;
  disabled?: boolean
  onMethodChange?: (methodId: string) => void;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({
  selectedMethodId = 'apple-pay',
  disabled,
  onMethodChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedMethod = PAYMENT_METHODS.find(
    (method) => method.id === selectedMethodId
  ) || PAYMENT_METHODS[0];

  const handleMethodSelect = (methodId: string) => {
    onMethodChange?.(methodId);
    setModalVisible(false);
  };

  const openModal = () => {
    setModalVisible(true);
  };

  return (
    <>
      <Card style={$styles.card}>
        <Card.Content style={$styles.content}>
          <TouchableOpacity style={$styles.header} disabled={disabled} onPress={openModal} >
            <View style={$styles.titleContainer}>
              <Image source={selectedMethod.icon} style={$styles.methodIcon} />
              <Text style={$styles.title}>Payment method</Text>
            </View>
            <IconButton
              icon="pencil"
              iconColor="#888"
              size={20}
            />
          </TouchableOpacity>

          <Text style={$styles.description}>
            You can choose or change the payment method to complete your order.
          </Text>
        </Card.Content>
      </Card>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity activeOpacity={1} onPressIn={() => setModalVisible(false)} style={$styles.modalOverlay}>
          <View style={$styles.modalContent}>
            <View style={$styles.modalHeader}>
              <View style={$styles.dragHandle} />
            </View>

            <ScrollView style={$styles.methodsList}>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  disabled={method.disabled}
                  style={[
                    $styles.methodItem,
                    selectedMethodId === method.id && $styles.selectedMethod,
                    {
                      opacity: method.disabled ? 0.5 : 1
                    }
                  ]}
                  onPressIn={() => handleMethodSelect(method.id)}
                >
                  <Image source={method.icon} style={$styles.methodItemIcon} />
                  <Text style={$styles.methodLabel}>{method.label}</Text>
                  {
                    method.disabled && (
                      <View style={$styles.disabledTextWrapper}>
                        <View style={$styles.disabledTextContainer}>
                          <Text style={$styles.disabledText}>Coming soon</Text>
                        </View>
                      </View>
                    )
                  }
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
