import { StyleSheet } from 'react-native';

export const $styles = StyleSheet.create({
  card: {
    backgroundColor: '#202939',
    marginBottom: 16,
    borderRadius: 30,
  },
  content: {
    padding: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  rowInner: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#cccccc',
    fontSize: 16,
  },
  price: {
    color: '#cccccc',
    fontSize: 16,
  },
  divider: {
    backgroundColor: '#444',
    marginVertical: 8,
  },
  subtotalLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  subtotalPrice: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPrice: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
