import 'react-native-get-random-values'
import { polyfillWebCrypto } from 'expo-crypto'

// Polyfill crypto
polyfillWebCrypto()

// Base64 polyfills for Mobile Wallet Adapter
import { decode, encode } from 'react-native-quick-base64'

if (typeof global !== 'undefined') {
  global.atob = decode
  global.btoa = encode

  // Add the specific functions that Mobile Wallet Adapter expects
  global.base64ToArrayBuffer = (base64) => {
    const binaryString = decode(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  global.arrayBufferToBase64 = (buffer) => {
    let binary = ''
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i])
    }
    return encode(binary)
  }
}
