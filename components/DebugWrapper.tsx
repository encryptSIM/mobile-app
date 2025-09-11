import { Accelerometer } from 'expo-sensors';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Modal, SafeAreaView, StyleSheet } from 'react-native';
import { DevMenu } from './DevMenu';

interface DebugWrapperProps {
  children: ReactNode;
  enabled?: boolean;
  shakeThreshold?: number;
}

export const DebugWrapper: React.FC<DebugWrapperProps> = ({
  children,
  enabled = true,
  shakeThreshold = 2.5
}) => {
  const [showDevMenu, setShowDevMenu] = useState(false);
  const lastShake = useRef(0);
  const subscription = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    if (!enabled || __DEV__ || process.env.EXPO_PUBLIC_ENVIRONMENT === 'prod') return;

    const startAccelerometer = async () => {
      try {
        Accelerometer.setUpdateInterval(100);
        subscription.current = Accelerometer.addListener(({ x, y, z }) => {
          const acceleration = Math.sqrt(x * x + y * y + z * z);
          const now = Date.now();

          if (acceleration > shakeThreshold && now - lastShake.current > 1000) {
            lastShake.current = now;
            setShowDevMenu(true);
          }
        });
      } catch (error) {
        console.error('Failed to start accelerometer:', error);
      }
    };

    startAccelerometer();

    return () => {
      subscription.current?.remove();
    };
  }, [enabled, shakeThreshold]);

  return (
    <>
      {children}
      <Modal
        visible={showDevMenu}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDevMenu(false)}
      >
        <SafeAreaView style={styles.container}>
          <DevMenu onClose={() => setShowDevMenu(false)} />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  }
});
