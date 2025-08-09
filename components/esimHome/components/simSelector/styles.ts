import { getDimensions } from "@/utils/dimensions";
import { StyleSheet } from "react-native";

const { height } = getDimensions()

export const $styles = StyleSheet.create({
  flagImage: {
    paddingRight: 16,
    width: 30,
    height: 30,
    borderRadius: 50,
  },
  card: {
    backgroundColor: '#202939',
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
    backgroundColor: 'transparent'
  },
  modalContent: {
    backgroundColor: '#111926',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    paddingTop: 20,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#878787',
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
  simsList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  simDropdownRight: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simDropdown: {
    marginTop: 18,
    marginBottom: 8,
    justifyContent: 'space-between',
    paddingRight: 20,
    paddingVertical: 12,
  },
  simItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202939',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 29,
  },
  selectedSim: {
    position: 'relative',
    backgroundColor: '#202939',
    borderWidth: 2,
    borderColor: '#32D583',
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
  simLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
})
