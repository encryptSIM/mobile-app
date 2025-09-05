import { card } from '@/components/app-providers';
import { StyleSheet } from 'react-native';

export const $styles = StyleSheet.create({
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex'
  },
  qtyContainer: {
    position: 'absolute',
    bottom: -20,
    right: 20,
  },
  flagImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  card: {
    position: 'relative',
    backgroundColor: card,
    marginBottom: 16,
    borderRadius: 30,
    paddingBottom: 30,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  countryInfo: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  esimLabel: {
    color: '#888',
    fontSize: 14,
  },
  simCard: {
    width: 40,
    height: 28,
    backgroundColor: '#d4af37',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    width: 20,
    height: 16,
    backgroundColor: '#b8860b',
    borderRadius: 2,
  },
  benefitsTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  benefitChip: {
    backgroundColor: '#3a3a52',
  },
  benefitText: {
    color: '#ffffff',
    fontSize: 12,
  },
});
