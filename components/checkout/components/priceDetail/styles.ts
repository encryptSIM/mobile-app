import { card } from '@/components/app-providers';
import { StyleSheet } from 'react-native';

const fieldStyles = {
  'line-item': {
    label: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: '#a1a1aa', // Light gray for dark theme
    },
    value: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: '#ffffff', // White text
    },
  },
  'fee': {
    label: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: '#a1a1aa',
    },
    value: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: '#ffffff',
    },
  },
  'discount': {
    label: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: '#22c55e', // Green for discount
    },
    value: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: '#22c55e',
    },
  },
  'total-primary': {
    label: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: '#ffffff',
    },
    value: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: '#ffffff',
    },
  },
  'total-secondary': {
    label: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: '#ffffff',
    },
    value: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: '#a1a1aa', // Slightly dimmed for secondary total
    },
  },
};

export const $styles = StyleSheet.create({
  card: {
    borderRadius: 29,
    marginBottom: 16,
    width: '100%',
    backgroundColor: card,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#ffffff', // White title
  },
  section: {
    marginVertical: 4,
  },
  totalSection: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  valueContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  currencyChip: {
    marginLeft: 8,
    height: 34,
    backgroundColor: '#3a3a52',
    borderColor: '#52525b', // Dark border
  },
  currencyText: {
    // fontSize: 11,
    color: '#a1a1aa', // Light gray text
  },
  sectionDivider: {
    marginVertical: 12,
    backgroundColor: '#3f3f46', // Dark divider
  },
  totalDivider: {
    marginVertical: 16,
    backgroundColor: '#52525b', // Slightly lighter divider for totals
    height: 1,
  },
});

export const getFieldStyle = (type: 'line-item' | 'fee' | 'discount' | 'total-primary' | 'total-secondary') => {
  return fieldStyles[type];
};
