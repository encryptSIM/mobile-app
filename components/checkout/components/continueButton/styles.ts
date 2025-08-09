import { brandGreen } from '@/components/app-providers';
import { StyleSheet } from 'react-native';

export const $styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: brandGreen,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
