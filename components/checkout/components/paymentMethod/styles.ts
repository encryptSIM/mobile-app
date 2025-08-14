import { background, brandGreen, card } from '@/components/app-providers';
import { getDimensions } from '@/utils/dimensions';
import { StyleSheet } from 'react-native';

const { height } = getDimensions()

export const $styles = StyleSheet.create({
  card: {
    backgroundColor: card,
    marginBottom: 16,
    borderRadius: 30,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 44,
    height: 44,
    marginRight: 12,
    resizeMode: 'contain',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    paddingTop: 20,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: brandGreen,
    borderLeftWidth: 0.01,
    borderRightWidth: 0.01,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalTitle: {
    color: '#cccccc',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#cccccc',
    fontSize: 24,
    fontWeight: 'bold',
  },
  methodsList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingLeft: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  selectedMethod: {
    position: 'relative',
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  methodItemIcon: {
    width: 34,
    height: 44,
    marginRight: 12,
    resizeMode: 'contain',
  },
  disabledTextWrapper: {
    position: 'absolute',
    right: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    top: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  disabledTextContainer: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderColor: '#DADADA',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  disabledText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '500',
  },
  methodLabel: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
});
