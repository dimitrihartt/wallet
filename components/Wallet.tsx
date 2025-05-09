import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Platform } from 'react-native';
import { Transaction } from './Transaction';

import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';

import { keccak256 } from 'ethereum-cryptography/keccak';
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { utf8ToBytes, hexToBytes, bytesToHex } from 'ethereum-cryptography/utils';

import * as secp from '@noble/secp256k1';

import QRCode from 'react-native-qrcode-svg';

export const Wallet = ({ blockchain }: { blockchain: any }) => {
  const [UUID, setUUID] = useState('');
  const [uniqueId, setUniqueId] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [privateKeyHex, setPrivateKeyHex] = useState(''); // Store the private key in hex format
  const [publicKey, setPublicKey] = useState('');
  const [isEncryptedPrivateKeyStored, setIsEncryptedPrivateKeyStored] = useState(false);

  const [msg, setMsg] = useState('');
  const [signature, setSignature] = useState('');
  const [recoveryBit, setRecoveryBit] = useState<number | null>(null);

  const [myAddress, setMyAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Generate a unique ID for the device
    if (Platform.OS === 'android') {
      setUniqueId(Application.getAndroidId()); // Not ANDROID_ID but works as a unique ID
    } else {
      setUniqueId('Not an Android device');
    }

    // Check if the encrypted private key is stored in SecureStore
    const checkEncryptedPrivateKey = async () => {
      const encryptedKey = await SecureStore.getItemAsync('encryptedPrivateKey');
      if (encryptedKey) {
        setIsEncryptedPrivateKeyStored(true); // Set to true if the encrypted key exists
      } else {
        setIsEncryptedPrivateKeyStored(false); // Set to false if the encrypted key doesn't exist
      }
    };
    checkEncryptedPrivateKey();
  }, []);

  const logout = async () => {
    setUUID(''); // Clear the UUID state
    setPassword(''); // Clear the password state
    setIsPasswordSet(false); // Reset password set state
    setPrivateKeyHex(''); // Clear the private key state
    setIsEncryptedPrivateKeyStored(true); // Update state
    setPublicKey(''); // Clear the public key state
    setMyAddress(''); // Clear the address state
    console.log('🔐 Logged out! Only HashedPrivateKey persists 🔐');
  };

  const decryptPrivateKey = async () => {    
    const encryptedPrivateKey = await SecureStore.getItemAsync('encryptedPrivateKey'); // Restore the encrypted private key from secure storage
    console.log('🔐 Encrypted private key found! 🔐', encryptedPrivateKey); // Log the encrypted private key
    if (!encryptedPrivateKey) {
      throw new Error('❌ Encrypted private key not found.');
    }    
    
    const key = CryptoJS.SHA256(password).toString(); // Derive AES key from password
    console.log('🔐 Key derived from password: 🔐', key); // Log the derived key

    const decrypted = CryptoJS.AES.decrypt(encryptedPrivateKey, key); // Decrypt AES
    console.log('🔐 Decrypted private key: 🔐', decrypted); // Log the decrypted private key

    const privateKeyHex = decrypted.toString(CryptoJS.enc.Hex); // Convert to hex
    console.log('🔐 Private key in hex: 🔐', privateKeyHex); // ✅ Use this Log the private key in hex format
    if (!privateKeyHex) {
      throw new Error('❌ Decryption failed. Possibly wrong password or corrupted data.');
    }

    setPrivateKeyHex(privateKeyHex); // Set the private key in state    
  };

  const generateWalletFromPrivateKey = async () => {    
    await decryptPrivateKey(); // Decrypt the private key from SecureStore and await here    
    console.log("Awaited... PrivateKeyHex:", privateKeyHex); // Log the decrypted private key

    const pub = secp256k1.getPublicKey(privateKeyHex, true); // Get the public key from the private key
    console.log('Came here!');
    
    console.log('🔐 Public key created! 🔐', bytesToHex(pub)); // Log the public key
    setPublicKey(bytesToHex(pub)); // Convert Uint8Array to hex string and set the public key in state

    // Convert uncompressed public key to Ethereum address
    const pubKeyWithoutPrefix = pub.slice(1); // Remove the first byte (0x04) from uncompressed key
    const addressHash = keccak256(pubKeyWithoutPrefix); // Keccak256 hash of the public key
    const addressBytes = addressHash.slice(-20); // Take the last 20 bytes
    const cryptoAddress = '0x' + bytesToHex(addressBytes); // Convert to hex and prefix with "0x"
    setMyAddress(cryptoAddress); // Set the address in state

    console.log('🔐 Address created! 🔐', cryptoAddress);

    setIsPasswordSet(true); // Set to true when the password is set

    // Optionally, you can also generate a balance check with your blockchain system here
    // const newBalance = blockchain.getBalanceOfAddress(publicKeyGenerated);
    // setBalance(newBalance);
  };

  const generateWallet = async () => {
    // Generate a random UUID
    setUUID(Crypto.randomUUID()); // Generate a random UUID

    // Generate a random 256-bit number using Expo Crypto
    const randomBytes = new Uint8Array(32);
    await Crypto.getRandomValues(randomBytes); // Generate random bytes

    const privateKeyHex = Buffer.from(randomBytes).toString('hex'); // Convert the byte array to a hex string
    setPrivateKeyHex(privateKeyHex); // Set the private key in state

    const key = CryptoJS.SHA256(password).toString(); // Hash the password
    const encrypted = CryptoJS.AES.encrypt(privateKeyHex, key).toString(); // Encrypt the private key using the password
    await SecureStore.setItemAsync('encryptedPrivateKey', encrypted); // Store the encrypted private key in SecureStore
    setIsEncryptedPrivateKeyStored(true); // Update state

    console.log('🔐 Private key created, encrypted, and saved! 🔐', encrypted);

    // Generate public keys (compressed and uncompressed)
    const publicKeyCompressed = secp256k1.getPublicKey(randomBytes, true); // Compressed public key
    const publicKeyUncompressed = secp256k1.getPublicKey(randomBytes, false); // Uncompressed public key

    // Convert uncompressed public key to Ethereum address
    const pubKeyWithoutPrefix = publicKeyUncompressed.slice(1); // Remove the first byte (0x04) from uncompressed key
    const addressHash = keccak256(pubKeyWithoutPrefix); // Keccak256 hash of the public key
    const addressBytes = addressHash.slice(-20); // Take the last 20 bytes
    const cryptoAddress = '0x' + bytesToHex(addressBytes); // Convert to hex and prefix with "0x"
    setMyAddress(cryptoAddress); // Set the address in state

    console.log('🔐 Address created! 🔐', cryptoAddress);

    // Set the isPasswordSet in state
    setIsPasswordSet(true); // Set to true when the password is set

    // Optionally, you can also generate a balance check with your blockchain system here
    // const newBalance = blockchain.getBalanceOfAddress(publicKeyGenerated);
    // setBalance(newBalance);
  };

  const deleteMyWallet = async () => {
    await SecureStore.deleteItemAsync('encryptedPrivateKey'); // Delete the encrypted private key from SecureStore
    setIsEncryptedPrivateKeyStored(false); // Update state
    setUUID(''); // Clear the UUID state
    setPassword(''); // Clear the password state
    setIsPasswordSet(false); // Reset password set state
    setPublicKey(''); // Clear the public key state
    setMyAddress(''); // Clear the address state
    setPrivateKeyHex(''); // Clear the private key state
    console.log('🔐 Wallet deleted! 🔐');
  };

  const signMessage = async () => {
    try {
      const msgBytes = utf8ToBytes(msg);
      const hash = keccak256(msgBytes); // or SHA256 if preferred

      const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, 'hex'));

      const { r, s, recovery: recoveryBit } = await secp256k1.sign(hash, privateKey); // Sign the hash with the private key
      const signature = Buffer.concat([
        Uint8Array.from(
          r
            .toString(16)
            .padStart(64, '0')
            .match(/.{1,2}/g)!
            .map((byte) => parseInt(byte, 16))
        ),
        Uint8Array.from(
          s
            .toString(16)
            .padStart(64, '0')
            .match(/.{1,2}/g)!
            .map((byte) => parseInt(byte, 16))
        ),
      ]); // Combine r and s to form the signature

      console.log('✅ Signature:', Buffer.from(signature).toString('hex'));
      setSignature(Buffer.from(signature).toString('hex')); // Store the signature in hex format
      setRecoveryBit(recoveryBit); // Store the recovery bit

      console.log('🧠 Recovery bit:', recoveryBit);
      return { signature, recoveryBit };
    } catch (err) {
      console.error('❌ Error:', err);
    }
  };

  const changePassword = async () => {
    if (oldPassword !== password) {
      throw new Error('❌ The password typed does not match with the one in the registry.');
    } else {
      const encryptedPrivateKey = await SecureStore.getItemAsync('encryptedPrivateKey'); // Restore the encrypted private key from secure storage
      if (!encryptedPrivateKey) {
        throw new Error('❌ Encrypted private key not found.');
      }
      const key = CryptoJS.SHA256(password).toString(); // Derive AES key from password
      const decrypted = CryptoJS.AES.decrypt(encryptedPrivateKey, key); // Decrypt AES
      const privateKeyHex = decrypted.toString(CryptoJS.enc.Utf8); // Decode to UTF-8
      if (!privateKeyHex) {
        throw new Error('❌ Decryption failed. Possibly wrong password or corrupted data.');
      }
      setPrivateKeyHex(privateKeyHex);
      const newKey = CryptoJS.SHA256(newPassword).toString(); // Hash the password to create a key for encryption
      const encrypted = CryptoJS.AES.encrypt(privateKeyHex, newKey).toString(); // Encrypt the private key using the password
      await SecureStore.setItemAsync('encryptedPrivateKey', encrypted); // Store the encrypted private key in secure storage
      setIsEncryptedPrivateKeyStored(true); // Update the state to indicate that the private key is stored
      setPassword(newPassword); // Update the password state
      console.log(
        '🔐 Password changed and your Private key was encrypted and saved again! 🔐',
        encrypted
      );
    }
  };

  const sendTransaction = () => {
    if (!privateKeyHex || !publicKey || !recipientAddress || !amount) {
      alert('Please fill all fields!');
      return;
    }

    // const key = ec.keyFromPrivate(privateKey);
    const transaction = new Transaction(publicKey, recipientAddress, parseFloat(amount));
    transaction.signTransaction(key); // Ensure Transaction has a 'sign' method

    try {
      blockchain.addTransaction(transaction);
      alert('Transaction added! Now mine pending transactions.');
    } catch (error: any) {
      alert('Error sending transaction: ' + error.message);
    }
  };

  const refreshBalance = () => {
    const newBalance = blockchain.getBalanceOfAddress(publicKey);
    setBalance(newBalance);
  };

  const isPrivateKeyValid = (privateKey: string) => {
    // Check if the generated bytes are a valid private key
    // Note: In a real-world scenario, you should also check if the private key is not already in use.
    return secp.utils.isValidPrivateKey(privateKey);
  };

  const isEncryptedPrivateKeyStoredAlready = async () => {
    const encryptedPrivateKey = await SecureStore.getItemAsync('encryptedPrivateKey');
    return encryptedPrivateKey !== null;
  };

  const getEncryptedPrivateKey = async () => {
    const encryptedPrivateKey = await SecureStore.getItemAsync('encryptedPrivateKey');
    return encryptedPrivateKey;
  };

  return (
    <View className="rounded-md bg-white px-2 pb-2 shadow-md">
      {isEncryptedPrivateKeyStored ? (
        isPasswordSet ? (
          <>
            <View className="my-2 rounded-xl bg-gray-200 p-4 shadow-md">
              <Text className="mb-2 text-lg font-bold text-gray-800">Wallet</Text>
              <Text className="text-gray-600">🔓 Return A: Decrypting with password...</Text>
            </View>

            <View className="my-2 w-full items-center justify-center space-y-2 rounded-xl bg-gray-200 p-4">
              {/* QR code box */}
              <View className="h-40 w-40 items-center justify-center rounded-md border border-gray-300 bg-white p-4">
                <QRCode value={myAddress} />
              </View>
              <Text className="mt-2 text-xs italic text-gray-500">Scan to send funds</Text>
            </View>

            <View className="my-2 rounded-xl bg-gray-200 p-4 shadow-md">
              <Text className="font-bold">My Crypto Address:</Text>
              <Text selectable className="mb-2 text-xs">
                {myAddress}
              </Text>
              <Text className="mt-2 font-bold">UniqueID: {uniqueId}</Text>
              <Text className="mt-2 font-bold">PrivateKey: {privateKeyHex}</Text>
            </View>

            <View className="my-2 rounded-xl bg-gray-200 p-4 shadow-md">
              <Text className="mb-2 text-lg font-bold text-gray-800">Change your password</Text>
              <View className="my-4 space-y-2">
                <TextInput
                  className="mb-2 rounded-md border border-gray-300 bg-white p-2"
                  placeholder="Old Password"
                  secureTextEntry
                  value={oldPassword}
                  onChangeText={setOldPassword}
                />
                <TextInput
                  className="mb-2 rounded-md border border-gray-300 bg-white p-2"
                  placeholder="New Password"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <Button title="Change Password" onPress={changePassword} />
                <Text className="mb-2 text-gray-600">Actual password: {password}</Text>
              </View>
            </View>

            <View className="mb-4 space-y-2 rounded-xl bg-gray-200 p-4 shadow-md">
              <Text className="mb-2 text-lg font-bold text-gray-800">Balance: {balance}</Text>
              <Text className="mb-2 text-gray-600">Sum of all transactions</Text>
              <Button title="Refresh Balance" onPress={refreshBalance} />
            </View>

            <View className="mb-4 space-y-2 rounded-xl bg-gray-200 p-4">
              <Text className="mb-2 text-lg font-bold text-gray-800">Transaction</Text>
              <TextInput
                className="mb-2 rounded-md border border-gray-300 bg-white p-2"
                placeholder="Recipient Address"
                value={myAddress}
                onChangeText={setRecipientAddress}
              />
              <TextInput
                className="mb-2 rounded-md border border-gray-300 bg-white p-2"
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <Button title="Send Transaction" onPress={sendTransaction} />
            </View>
            <View className="mb-4 space-y-2 rounded-xl bg-gray-200 p-4">
              <Text className="mb-2 text-lg font-bold text-gray-800">Sign Message</Text>
              <TextInput
                className="mb-2 rounded-md border border-gray-300 bg-white p-2"
                placeholder="Message to sign"
                value={msg}
                onChangeText={setMsg}
              />
              <Button title="Sign" onPress={signMessage} />
              <Text className="mb-2 text-gray-600">Signature: {signature}</Text>
              <Text className="mb-2 text-gray-600">RecoveryBit: {recoveryBit}</Text>
            </View>
            <Button title="Logout" onPress={logout} />
          </>
        ) : (
          <>
            <Text className="mt-4 text-center italic text-gray-500">
              🔐 Return B: Encrypted key found, please enter your password.
            </Text>
            <View className="mt-4">
              <TextInput
                className="mb-2 rounded-md border border-gray-300 bg-white p-2"
                placeholder="Enter your password to regenerate your wallet"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <View className="my-4 space-y-2">
                <Button title="Regenerate Wallet" onPress={generateWalletFromPrivateKey} />
              </View>
              <View>
                <Button title="Delete my Wallet" onPress={deleteMyWallet} />
              </View>
            </View>
          </>
        )
      ) : (
        <>
          <Text className="mt-4 text-center italic text-gray-500">
            🆕 No key stored, generate a new wallet.
          </Text>
          <View className="mt-4 space-y-2">
            <TextInput
              className="mb-2 rounded-md border border-gray-300 bg-white p-2"
              placeholder="Enter a password to secure your wallet"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Button title="Generate Wallet" onPress={generateWallet} />
          </View>
        </>
      )}
    </View>
  );
};
