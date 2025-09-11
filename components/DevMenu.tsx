import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { logger } from '../utils/logger';
import { router } from 'expo-router';

interface DevMenuProps {
  onClose: () => void;
}

interface MenuItem {
  title: string;
  onPress: () => void;
  color?: string;
}

export const DevMenu: React.FC<DevMenuProps> = ({ onClose }) => {

  const menuItems: MenuItem[] = [
    {
      title: 'View Logs',
      onPress: () => {
        onClose();
        router.push('/LogViewer')
      }
    },
    {
      title: 'Clear Logs',
      onPress: () => {
        Alert.alert(
          'Clear Logs',
          'Are you sure you want to clear all logs?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear',
              style: 'destructive',
              onPress: () => {
                logger.clearLogs();
                Alert.alert('Success', 'Logs cleared');
              }
            }
          ]
        );
      },
      color: '#ff4444'
    },
    {
      title: 'Test Log',
      onPress: () => {
        console.log('Test log from dev menu');
        console.warn('Test warning');
        console.error('Test error');
        Alert.alert('Success', 'Test logs added');
      }
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dev Menu</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Text style={[styles.menuText, { color: item.color || '#fff' }]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  closeButton: {
    padding: 10
  },
  closeText: {
    fontSize: 20,
    color: '#fff'
  },
  content: {
    flex: 1,
    padding: 20
  },
  menuItem: {
    backgroundColor: '#333',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500'
  }
});
