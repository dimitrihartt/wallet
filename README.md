The user has access to the private key, and whenever he needs to make a transaction the app will sign it with him.
He cant uninstall the app or reset the phone. He needs the private key to see his local balance. And he sends a public key signed transaction with the qrcode and the amount he has in the balance. The receiver then adds it to his own balance. There is no public distributed ledger.

The user has access to the private key, and whenever he needs to make a transaction the app will sign it with him.
He cant uninstall the app or reset the phone. He needs the private key to see his local balance. And he sends a public key signed transaction with the qrcode and the amount he has in the balance. The receiver then adds it to his own balance. There is no public distributed ledger.



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
