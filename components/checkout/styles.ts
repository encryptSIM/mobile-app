import { sizing } from '@/constants/sizing';
import { StyleSheet } from 'react-native';

export const $styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: sizing.horizontalPadding2,
  },
});
