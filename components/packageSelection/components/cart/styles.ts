import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    zIndex: 1000,
    width: '100%',
  },

  cartContent: {
    backgroundColor: '#111926',
    padding: 16,
    maxHeight: 400,
    width: '100%',
    height: '100%',
  },

  itemsList: {
    maxHeight: 280,
    marginBottom: 16,
  },

  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },

  itemInfo: {
    flex: 1,
    marginRight: 16,
    backgroundColor: 'transparent',
  },

  itemDescription: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  quantityButton: {
    backgroundColor: '#32D583',
    borderRadius: 20,
  },

  minusButton: {
    marginRight: 12,
  },

  plusButton: {
    marginLeft: 12,
    backgroundColor: '#32D583',
  },

  quantityText: {
    color: '#ffffff',
    minWidth: 24,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },

  checkoutButton: {
    backgroundColor: '#32D583',
    borderRadius: 12,
    paddingVertical: 4,
  },

  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
