import React, { useEffect, useState } from 'react';
import {
  Alert,
  TouchableOpacity,
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import { keccak256 } from 'ethereum-cryptography/keccak';
import * as secp from '@noble/secp256k1';
import {
  generateMnemonic,
  entropyToMnemonic,
  mnemonicToSeedSync,
  validateMnemonic,
} from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import Icon from 'react-native-vector-icons/MaterialIcons';
import QRCode from 'react-native-qrcode-svg';
import CryptoJS from 'crypto-js';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { Box } from './ui/box';
import { VStack } from './ui/vstack';


const WalletGenerator = () => {
  // Replace this with the user's input mnemonic
  const existingMnemonic =
    'nature uncover antenna orbit tank business nominee robot mix burst stamp slab';
  const [mnemonic, setMnemonic] = useState('');

  const [privateKey, setPrivateKey] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const [password, setPassword] = useState('');
  const [isEncryptedPrivateKeyStored, setIsEncryptedPrivateKeyStored] = useState(false);
  const [error, setError] = useState('');

  const ADDRESS_PATH = "m/44'/60'/0'/0/0";
  const STORAGE_KEY = 'encryptedPrivateKey';

  // Trigger the countdown when the modal is visible
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (modalVisible) {
      setCountdown(5); // Reset countdown
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            //setModalVisible(false); // Close modal after countdown ends
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer); // Cleanup timer on unmount or modal close
  }, [modalVisible]);

  // Check if the private key is stored in SecureStore
  const checkPrivateKey = async () => {
    try {
      const storedKey = await SecureStore.getItemAsync(STORAGE_KEY);
      setIsEncryptedPrivateKeyStored(!!storedKey); // Update state based on whether the key exists
      if (!!storedKey === false) {
        deleteWallet();
      }
      console.log('Private key stored:', !!storedKey);
    } catch (error) {
      console.error('Error checking SecureStore:', error);
    }
  };

  // Use useEffect to check the key when the component mounts
  useEffect(() => {
    checkPrivateKey();
  }, []);

  // Use useFocusEffect to recheck the key whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      checkPrivateKey();
    }, [])
  );

  const generateWallet = async () => {
    try {
      console.log('🔑 Generating Wallet...');
      const randomBytes = await Crypto.getRandomBytesAsync(16);
      const entropy = new Uint8Array(randomBytes);

      const mnemonicPhrase = entropyToMnemonic(entropy, wordlist);
      const isValid = validateMnemonic(mnemonicPhrase, wordlist);
      if (!isValid) {
        throw new Error('Invalid mnemonic');
      }

      const seed = mnemonicToSeedSync(mnemonicPhrase);
      const root = HDKey.fromMasterSeed(seed);
      const child = root.derive(ADDRESS_PATH);

      const privKey = child.privateKey
        ? Buffer.from(child.privateKey).toString('hex')
        : 'Private key not available';
      console.log('Private key:', privKey);

      const publicKey = secp.getPublicKey(privKey, false);
      const pubKey = publicKey.slice(1);

      const address = keccak256(pubKey);
      const addressHex = Buffer.from(address).toString('hex');
      const cryptoAddress = '0x' + addressHex.slice(-40);

      setMnemonic(mnemonicPhrase);
      setPrivateKey(privKey);
      setCryptoAddress(cryptoAddress);

      console.log('Wallet generated:', cryptoAddress);

      // Show the modal after generating the wallet
      setModalVisible(true);
    } catch (error) {
      console.error('Error generating wallet:', error);
    }
  };

  const securePrivateKey = async () => {
    try {
      console.log('🔐 Encrypting and storing private key...');

      // 1. Get Android ID (acts like a device UUID)
      const androidId = Application.getAndroidId() || 'fallback-id';
      if (!androidId) throw new Error('Failed to get Android ID');
      console.log('🔐 AndroidID:', androidId);

      // 2. Create the final passphrase
      const finalPassword = password + androidId;
      console.log('Final Password:', finalPassword);

      // 3. Hash the password to create a key for encryption
      const key = CryptoJS.SHA256(finalPassword).toString(); // Derive AES key from finalPassword
      console.log('Key:', key);

      // 4. Encrypt the private key using AES
      const encrypted = CryptoJS.AES.encrypt(privateKey, key).toString(); // Encrypt the private key using the password
      console.log('Encrypted Private Key:', encrypted);

      // 5. Store the encrypted private key in SecureStore
      await SecureStore.setItemAsync(STORAGE_KEY, encrypted); // Store the encrypted private key in secure storage

      setIsEncryptedPrivateKeyStored(true);
      console.log('🔐 Private Key Hashed, Encrypted and Stored in SecureStore Android! 🔐');
    } catch (error) {
      console.error('Error generating wallet:', error);
    }
  };

  const deriveWallet = () => {
    if (!validateMnemonic(existingMnemonic, wordlist)) {
      setError('Invalid mnemonic.');
      return;
    }

    const seed = mnemonicToSeedSync(existingMnemonic);
    const root = HDKey.fromMasterSeed(seed);
    const child = root.derive(ADDRESS_PATH);
    const privKey = child.privateKey
      ? Buffer.from(child.privateKey).toString('hex')
      : 'Private key not available';
    setPrivateKey(privKey);
  };

  async function deleteWallet() {
    try {
      console.log('🗑️ Deleting wallet...');
      setMnemonic('');
      setPrivateKey('');
      setCryptoAddress('');
      setPassword('');
      setError('');
      console.log('Wallet deleted successfully.');
    } catch (error) {
      console.error('Error deleting wallet:', error);
    }
  }

  // Encrypt and Secure store
  // 1.	Retrieve Android UUID
  // 2.	Combine UUID + user passphrase to derive a key
  // 3.	Use that key to encrypt the mnemonic/private key
  // 4.	Save encrypted data to expo-secure-store
  // 5.	Decrypt it later with the same UUID + passphrase

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          {cryptoAddress ? (
            isEncryptedPrivateKeyStored ? (
              <View className="flex-1 items-center bg-white p-4">
                <Text className="text-lg font-bold">Your Wallet!</Text>
                <View className="my-2 w-full items-center justify-center space-y-2 rounded-xl bg-gray-200 p-4">
                  {/* QR code box */}
                  <View className="h-40 w-40 items-center justify-center rounded-md border border-gray-300 bg-white p-4">
                    <QRCode value={cryptoAddress} />
                  </View>
                  <Text className="mt-2 text-xs italic text-gray-500">Scan to send funds</Text>
                </View>
                <Text className="mt-4 text-center">Address: {cryptoAddress}</Text>
                <View className="my-2 w-full items-center justify-center space-y-2 rounded-xl bg-gray-200 p-4">
                  <Text className="my-2 text-center font-bold">Your Wallet is Secured!</Text>
                  {/* <TouchableOpacity
                    onPress={async () => {
                      await SecureStore.deleteItemAsync(STORAGE_KEY);
                      checkPrivateKey(); // Recheck after deletion
                    }}
                    className="mt-4 bg-red-500 p-4 rounded-lg"
                  >
                    <Text className="text-white text-center">Delete Wallet</Text>
                  </TouchableOpacity> */}
                </View>
              </View>
            ) : (
              <View className="flex-1 items-center bg-white p-4">
                <Text className="text-lg font-bold">Your Wallet!</Text>
                <View className="my-2 w-full items-center justify-center space-y-2 rounded-xl bg-gray-200 p-4">
                  {/* QR code box */}
                  <View className="h-40 w-40 items-center justify-center rounded-md border border-gray-300 bg-white p-4">
                    <QRCode value={cryptoAddress} />
                  </View>
                  <Text className="mt-2 text-xs italic text-gray-500">Scan to send funds</Text>
                </View>
                <Text className="mt-4 text-center">Address: {cryptoAddress}</Text>
                <View className="my-2 w-full items-center justify-center space-y-2 rounded-xl bg-gray-200 p-4">
                  <Text className="mt-4 text-center font-bold">Secure your Wallet!</Text>
                  <View className="mt-4 w-full">
                    <TextInput
                      className="mb-2 rounded-md border border-gray-300 bg-white p-2"
                      placeholder="Enter your password to secure your wallet"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={async () => {
                      securePrivateKey();
                      checkPrivateKey(); // Recheck after storing
                    }}>
                    <Icon name="vpn-key" size={56} color="gray" />
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                    onPress={async () => {
                      await SecureStore.setItemAsync(STORAGE_KEY, 'dummy-encrypted-key');
                      checkPrivateKey(); // Recheck after storing
                    }}
                    className="mt-4 bg-blue-500 p-4 rounded-lg"
                  >
                    <Text className="text-white text-center">Secure Wallet</Text>
                  </TouchableOpacity> */}
                </View>
              </View>
            )
          ) : (
            <Box className="max-h-full justify-center items-center">
              <VStack space="md" reversed={false}>
                <Text className="text-lg font-bold">Create your Wallet</Text>
                <TouchableOpacity onPress={generateWallet}>
                  <Icon name="wallet" size={56} color="gray" />
                </TouchableOpacity>
                <Text className="mt-4 text-center">Tap the Wallet Icon to start!</Text>                              
              </VStack>
            </Box>
          )}

          {/* Custom Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}>
            <View className="flex-1 items-center justify-center bg-gray-200 bg-opacity-50">
              <View className="w-11/12 rounded-lg bg-white p-6">
                <Text className="mb-4 text-lg font-bold">
                  Please write down your Mnemonic somewhere safe!
                </Text>
                <Text className="mb-6 text-gray-600">{mnemonic}</Text>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  disabled={countdown > 0}
                  className={`rounded-lg bg-blue-500 p-4 ${
                    countdown > 0 ? 'opacity-50' : 'opacity-100'
                  }`}>
                  <Text className="text-center text-lg text-white">
                    {countdown > 0 ? `OK (${countdown}s)` : 'OK'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  error: {
    fontSize: 16,
    color: 'red',
  },
});

export default WalletGenerator;
