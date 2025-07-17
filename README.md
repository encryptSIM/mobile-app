# encryptSIM - Complete Solana Mobile Stack Integration

A comprehensive Solana mobile dApp providing secure VPN and eSIM services with full **Solana Mobile Stack** integration.

## 🚀 Features

- ✅ **Mobile Wallet Adapter**: Full integration with Solana mobile wallets
- 🔐 **Seed Vault Integration**: Hardware-backed secure key storage
- 📱 **dApp Store Ready**: Complete submission configuration
- 🛡️ **VPN Services**: WireGuard and V2Ray VPN implementations
- 📱 **eSIM Services**: Digital eSIM provisioning and management
- 💰 **Balance Tracking**: Real-time SOL balance and pricing
- 🔧 **Development Tools**: Setup validation and debugging

## 📱 Solana Mobile Stack Implementation

This app implements the complete [Solana Mobile Stack](https://docs.solanamobile.com/developers/overview) with all official components:

### 🔐 **1. Mobile Wallet Adapter**

Connect securely with any Solana mobile wallet:

- **Wallet Discovery**: Automatically finds compatible wallets
- **Authorization Flow**: Secure wallet connection with proper session management
- **Transaction Signing**: Sign individual or batch transactions
- **Multi-Account Support**: Handle multiple wallet accounts

### 🔒 **2. Seed Vault Integration**

Hardware-backed secure key management:

- **Secure Storage**: Hardware-protected key storage
- **Biometric Auth**: Fingerprint/face unlock for sensitive operations
- **Account Management**: Create and import accounts securely
- **Transaction Signing**: Hardware-isolated signing operations

### 🏪 **3. dApp Store Compliance**

Ready for Solana dApp Store submission:

- **Metadata Configuration**: Complete publisher and app information
- **Testing Setup**: Alpha tester management and instructions
- **Config Generation**: Automated `config.yaml` file creation
- **Compliance Validation**: Submission requirement checking

### 🛠️ **4. Development Tools**

Comprehensive development and debugging tools:

- **Setup Validator**: Verify Solana Mobile Stack configuration
- **Device Compatibility**: Check hardware and software requirements
- **Network Testing**: Validate RPC and cluster connections
- **Dependency Validation**: Ensure all required packages are installed

## 🏗️ Key Components

### **Mobile Wallet Integration**

```typescript
// Connect to any Solana mobile wallet
const {
  connecting,
  connected,
  selectedAccount,
  publicKey,
  connect,
  disconnect,
  signTransaction,
  signAndSendTransaction,
} = useMobileWallet();
```

### **Seed Vault Management**

```typescript
// Secure hardware-backed key storage
const {
  isAvailable,
  isUnlocked,
  accounts,
  unlock,
  createAccount,
  importAccount,
  signData,
  enableBiometrics,
} = useSeedVault();
```

### **dApp Store Configuration**

```typescript
// Generate submission-ready configuration
<DappStoreConfig onClose={() => console.log("Config generated")} />
```

### **Development Setup Validation**

```typescript
// Validate your development environment
<DevSetupValidator onClose={() => console.log("Setup validated")} />
```

## 🔧 Installation & Setup

### **1. Install Dependencies**

```bash
yarn install
```

### **2. Required Packages** (already included)

```bash
yarn add @solana-mobile/mobile-wallet-adapter-protocol
yarn add @solana-mobile/mobile-wallet-adapter-protocol-web3js
yarn add @solana/web3.js
yarn add ed25519-hd-key bip39  # For Seed Vault
yarn add expo-device expo-secure-store  # For hardware validation
```

### **3. Platform Requirements**

**iOS:**

- **Minimum deployment target**: iOS 15.1+
- **LSApplicationQueriesSchemes** configured for wallet communication
- **URL schemes** set up for deep linking

**Android:**

- **Minimum SDK**: 23 (Android 6.0)
- **Target SDK**: 34 (Android 14)
- **Intent filters** configured for wallet communication

## 📱 Platform Configuration

### **iOS Configuration** (`app.json`)

```json
{
  "ios": {
    "deploymentTarget": "15.1",
    "infoPlist": {
      "LSApplicationQueriesSchemes": [
        "https",
        "solana-wallet",
        "phantom",
        "solflare",
        "glow",
        "trust",
        "backpack",
        "mathwallet"
      ]
    }
  }
}
```

### **Android Configuration** (`app.json`)

```json
{
  "android": {
    "minSdkVersion": 23,
    "targetSdkVersion": 34,
    "intentFilters": [
      {
        "action": "VIEW",
        "category": ["DEFAULT", "BROWSABLE"],
        "data": { "scheme": "encryptSIM" }
      }
    ]
  }
}
```

## 🎯 Usage Examples

### **Basic Wallet Connection**

```typescript
import { WalletConnectionButton } from "@/components/WalletConnectionButton";

function MyScreen() {
  return (
    <WalletConnectionButton
      onConnected={() => console.log("Wallet connected!")}
      fullWidth={true}
      showAddress={true}
    />
  );
}
```

### **Seed Vault Account Management**

```typescript
import { SeedVaultManager } from "@/components/SeedVaultManager";

function SecurityScreen() {
  return (
    <SeedVaultManager
      onAccountSelect={(account) => console.log("Selected:", account)}
      onClose={() => console.log("Vault closed")}
    />
  );
}
```

### **Transaction Signing**

```typescript
import { useAuth } from "@/context/auth-context";
import { Transaction, SystemProgram } from "@solana/web3.js";

function SendTransaction() {
  const { wallet, currentPublicKeyObject } = useAuth();

  const handleSend = async () => {
    try {
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: currentPublicKeyObject,
          toPubkey: destinationPublicKey,
          lamports: amount,
        })
      );

      const signature = await wallet.signAndSendTransaction(
        transaction,
        connection
      );
      console.log("Transaction sent:", signature);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return <button onPress={handleSend}>Send SOL</button>;
}
```

### **Development Setup Validation**

```typescript
import { DevSetupValidator } from "@/components/DevSetupValidator";

function DevScreen() {
  return (
    <DevSetupValidator onClose={() => console.log("Validation complete")} />
  );
}
```

## 🚀 Development

### **Running the App**

```bash
# Start development server
yarn start

# Run on iOS (requires Xcode)
yarn ios

# Run on Android (requires Android Studio)
yarn android
```

### **Testing on Solana Mobile**

1. **Physical Device**: Install on Solana Saga or compatible device
2. **Emulator**: Use Solana Mobile emulator for Seed Vault testing
3. **Wallet Apps**: Install Phantom, Solflare, or other compatible wallets
4. **Network**: Test on both devnet and mainnet

### **Development Validation**

Use the built-in development validator to check your setup:

```typescript
// Automatically validates:
// ✅ Device compatibility
// ✅ Secure storage functionality
// ✅ Wallet adapter initialization
// ✅ Seed Vault availability
// ✅ Network configuration
// ✅ App configuration
// ✅ Dependencies
// ✅ URL schemes
```

## 🏪 dApp Store Submission

### **1. Generate Configuration**

```typescript
<DappStoreConfig onClose={() => console.log("Ready for submission")} />
```

### **2. Required Assets**

- **App Icons**: Various sizes for different contexts
- **Screenshots**: At least 4 high-quality screenshots
- **Banner**: Feature graphic for store listing
- **APK**: Signed Android application package

### **3. Testing**

- **Alpha Testers**: Configure genesis token holders
- **Testing Instructions**: Provide clear testing guidelines
- **Feature Validation**: Test all Solana Mobile Stack features

## 🔐 Security Features

### **Hardware Security**

- ✅ **Seed Vault**: Hardware-backed key storage
- ✅ **Biometric Auth**: Fingerprint/face unlock
- ✅ **Secure Enclave**: iOS Secure Enclave integration
- ✅ **Android Keystore**: Android hardware security module

### **Transaction Security**

- ✅ **User Approval**: All transactions require explicit user consent
- ✅ **Private Key Isolation**: Keys never leave secure hardware
- ✅ **Session Management**: Automatic session cleanup and timeout
- ✅ **Network Validation**: Request validation and sanitization

## 🐛 Troubleshooting

### **Common Issues**

**1. Wallet Not Found Error**

```
Solution: Install a compatible Solana wallet (Phantom, Solflare, etc.)
Check: LSApplicationQueriesSchemes in app.json
```

**2. Seed Vault Not Available**

```
Solution: Use Solana Mobile device or emulator
Check: Device compatibility with DevSetupValidator
```

**3. Transaction Signing Fails**

```
Solution: Verify network connectivity and sufficient balance
Check: RPC endpoint and cluster configuration
```

**4. iOS Deployment Target Error**

```
Solution: Update app.json to use iOS 15.1+
Check: expo-build-properties configuration
```

### **Debug Tools**

Enable comprehensive logging:

```bash
# Environment variables
EXPO_PUBLIC_DEBUG=true
EXPO_PUBLIC_SOLANA_CLUSTER=devnet
EXPO_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

Use the development validator:

```typescript
// Automatically diagnoses common issues
<DevSetupValidator />
```

## 📚 Documentation

- **[Solana Mobile Documentation](https://docs.solanamobile.com/developers/overview)**
- **[Mobile Wallet Adapter](https://docs.solanamobile.com/developers/overview#mobile-wallet-adapter)**
- **[Seed Vault](https://docs.solanamobile.com/developers/overview#seed-vault)**
- **[dApp Store](https://docs.solanamobile.com/developers/overview#dapp-store)**

## 🤝 Contributing

When contributing to Solana Mobile Stack features:

1. **Test on Real Devices**: Use Solana Saga or compatible hardware
2. **Validate All Features**: Run the development validator
3. **Follow Security Best Practices**: Never expose private keys
4. **Update Documentation**: Keep README and comments current
5. **Test Wallet Compatibility**: Verify with multiple wallet apps

## 📄 License

[Your license here]

## 🎉 Production Ready!

Your encryptSIM app now includes:

- ✅ **Complete Solana Mobile Stack** implementation
- ✅ **Hardware-secured** key management via Seed Vault
- ✅ **Universal wallet** compatibility with Mobile Wallet Adapter
- ✅ **dApp Store submission** ready configuration
- ✅ **Development tools** for validation and debugging
- ✅ **Security best practices** following official guidelines

Ready for deployment to Solana Mobile devices and dApp Store submission! 🚀
