The user has access to the private key, and whenever he needs to make a transaction the app will sign it with him.
He cant uninstall the app or reset the phone. He needs the private key to see his local balance. And he sends a public key signed transaction with the qrcode and the amount he has in the balance. The receiver then adds it to his own balance. There is no public distributed ledger.

The user has access to the private key, and whenever he needs to make a transaction the app will sign it with him.
He cant uninstall the app or reset the phone. He needs the private key to see his local balance. And he sends a public key signed transaction with the qrcode and the amount he has in the balance. The receiver then adds it to his own balance. There is no public distributed ledger.

Upgrading to SDK 53
The following packages should be updated for best compatibility with the installed expo version:
  @react-native-async-storage/async-storage@1.23.1 - expected version: 2.1.2
  expo-application@6.0.2 - expected version: ~6.1.4
  expo-camera@16.0.18 - expected version: ~16.1.6
  expo-constants@17.0.8 - expected version: ~17.1.6
  expo-crypto@14.0.2 - expected version: ~14.1.4
  expo-dev-client@5.0.20 - expected version: ~5.1.8
  expo-device@7.0.3 - expected version: ~7.1.4
  expo-image-picker@16.0.6 - expected version: ~16.1.4
  expo-linking@7.0.5 - expected version: ~7.1.5
  expo-router@4.0.20 - expected version: ~5.0.7
  expo-secure-store@14.0.1 - expected version: ~14.2.3
  expo-status-bar@2.0.1 - expected version: ~2.2.3
  expo-system-ui@4.0.9 - expected version: ~5.0.7
  expo-web-browser@14.0.2 - expected version: ~14.1.6
  react@18.3.1 - expected version: 19.0.0
  react-dom@18.3.1 - expected version: 19.0.0
  react-native@0.76.9 - expected version: 0.79.2
  react-native-gesture-handler@2.20.2 - expected version: ~2.24.0
  react-native-reanimated@3.16.2 - expected version: ~3.17.4
  react-native-safe-area-context@4.12.0 - expected version: 5.4.0
  react-native-screens@4.4.0 - expected version: ~4.10.0
  react-native-svg@15.8.0 - expected version: 15.11.2
  react-native-web@0.19.13 - expected version: ^0.20.0
  @types/react@18.3.20 - expected version: ~19.0.10
  typescript@5.3.3 - expected version: ~5.8.3
Your project may not work correctly until you install the expected versions of the packages.

Steps to Implement MFA with Android Unique ID + Passphrase
Retrieve Android Unique ID as the first authentication factor.

User enters their passphrase, which is securely validated.

Secure storage & authentication methods ensure safety.

Implementation in React Native (Expo)
We’ll use the expo-device package to get the Android Unique ID and verify it alongside a passphrase.

1. Install Required Dependencies
sh
expo install expo-device expo-secure-store



import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';

// Mock secure storage (Replace this with backend verification)
const mockUserData = {
  deviceId: "mock_unique_android_id", // Replace with actual ID retrieval
  passphraseHash: "hashed_example_passphrase",
};

// Hashing function (Replace with secure hash in production)
const hashPassphrase = (passphrase) => passphrase.split("").reverse().join("");

const MFAComponent = () => {
  const [passphrase, setPassphrase] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  // Step 1: Get Android Unique ID
  const deviceId = Device.osInternalBuildId || "unknown_device";

  // Step 2: Validate Device ID
  const validateDevice = () => {
    if (deviceId === mockUserData.deviceId) {
      console.log("Device ID validated. Proceed to passphrase entry.");
    } else {
      Alert.alert("Error", "Invalid device authentication!");
    }
  };

  // Step 3: Validate Passphrase
  const validatePassphrase = async () => {
    const storedHash = hashPassphrase(passphrase);
    if (storedHash === mockUserData.passphraseHash) {
      setAuthenticated(true);
      Alert.alert("Success", "Authentication complete!");
    } else {
      Alert.alert("Error", "Invalid passphrase.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>🔒 Device ID: {deviceId}</Text>
      <Button title="Validate Device" onPress={validateDevice} />

      <Text>Enter Passphrase:</Text>
      <TextInput
        value={passphrase}
        onChangeText={setPassphrase}
        placeholder="Enter Passphrase"
        secureTextEntry
      />
      <Button title="Validate Passphrase" onPress={validatePassphrase} />

      {authenticated && <Text>✔ Authentication Successful!</Text>}
    </View>
  );
};

export default MFAComponent;
