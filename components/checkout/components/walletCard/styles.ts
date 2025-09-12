import { card } from '@/components/app-providers';
import { StyleSheet } from 'react-native';

export const $styles = StyleSheet.create({
  card: {
    backgroundColor: card,
    marginBottom: 16,
    borderRadius: 30,
  },
  content: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: { flexDirection: 'row', alignItems: 'center' },
  methodIcon: {
    width: 44,
    height: 44,
    marginRight: 12,
    resizeMode: 'contain',
  },
  title: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  description: { color: '#cccccc', fontSize: 14, lineHeight: 20 },
  networkChip: {
    backgroundColor: 'rgba(50, 213, 131, 0.1)',
    borderColor: '#32D583',
  },
  networkText: { color: '#32D583', fontSize: 12, fontWeight: '500' },
  walletDetails: {
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletLabel: { color: '#cccccc', fontSize: 14, fontWeight: '500' },
  walletValue: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  valueNegative: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  valuePositive: { color: '#22c55e', fontSize: 14, fontWeight: '600' },
  balanceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
