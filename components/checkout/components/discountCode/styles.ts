import { brandGreen, card } from '@/components/app-providers';
import { StyleSheet } from 'react-native';

export const $styles = StyleSheet.create({
  card: {
    backgroundColor: card,
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
    marginBottom: 8,
  },
  description: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  inputContent: {
    color: '#ffffff',
  },
  inputOutline: {
    borderColor: '#555',
  },
  inputOutlineSuccess: {
    borderColor: brandGreen,
  },
  applyButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#555',
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#ffffff',
  },
});
