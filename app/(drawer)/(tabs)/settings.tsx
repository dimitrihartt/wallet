import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { ScrollView, View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { Container } from '~/components/Container';
import * as SecureStore from 'expo-secure-store';

const SettingsPage = () => {
  const [useBiometrics, setUseBiometrics] = useState(false);

const deleteWallet = async () => {
  //console.log(typeof SecureStore.deleteItemAsync); // Should log "function"
  
  try {
    const storedKey = await SecureStore.getItemAsync('encryptedPrivateKey');
    if (storedKey) {
      await SecureStore.deleteItemAsync('encryptedPrivateKey');
      console.log('🔐 Wallet deleted! 🔐');
    } else {
      console.log('No wallet found to delete.');
    }
  } catch (error) {
    console.error('Error deleting wallet:', error);
  }
};

  const handleDeleteWallet = () => {
    Alert.alert(
      'Delete Wallet',
      'Are you sure you want to delete your wallet? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: async () => deleteWallet() },
      ]
    );
  };

  const handleChangePin = () => {
    Alert.alert('Change PIN', 'Redirecting to change PIN screen...');
    console.log('Change PIN Pressed');
  };

  const toggleBiometrics = () => {
    setUseBiometrics((prev) => !prev);
    console.log('Use Biometrics:', !useBiometrics);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView contentContainerClassName="bg-white dark:bg-gray-900">
        <Container>
          <View className="flex-1 bg-gray-100 p-4">
            <Text className="mb-6 text-2xl font-bold text-gray-800">Settings</Text>

            {/* Delete Wallet Button */}
            <TouchableOpacity
              onPress={handleDeleteWallet}
              className="mb-4 rounded-lg bg-red-500 p-4">
              <Text className="text-center font-semibold text-white">Delete Your Wallet</Text>
            </TouchableOpacity>

            {/* Change PIN Button */}
            <TouchableOpacity onPress={handleChangePin} className="mb-4 rounded-lg bg-blue-500 p-4">
              <Text className="text-center font-semibold text-white">Change Your PIN</Text>
            </TouchableOpacity>

            {/* Use Biometrics Switch */}
            <View className="flex-row items-center justify-between rounded-lg bg-white p-4">
              <Text className="font-medium text-gray-800">Use Biometrics</Text>
              <Switch
                value={useBiometrics}
                onValueChange={toggleBiometrics}
                thumbColor={useBiometrics ? '#4CAF50' : '#f4f3f4'}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
              />
            </View>
          </View>
        </Container>
      </ScrollView>
    </>
  );
};

export default SettingsPage;
