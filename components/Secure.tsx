import { useEffect, useState } from 'react';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import { ethers } from 'ethers';

const PRIVATE_KEY = '0xYOUR_PRIVATE_KEY_HERE'; // Replace with your private key
const USER_PASSWORD = 'user-secret-password';
const STORAGE_KEY = 'encryptedWallet';

// EXAMPLE USAGE
useEffect(() => {
  (async () => {
    await Secure();

    const decryptedWallet = await decryptWalletFromStore();
    if (decryptedWallet) {
      console.log('Decrypted Address:', decryptedWallet.address);
    }
  })();
}, []);

const Secure = async (): Promise<void> => {
  try {
    // 1. Get Android UUID
    const androidId = Application.getAndroidId() || 'fallback-id';

    // 2. Combine password + UUID to make encryption passphrase
    const finalPassword = USER_PASSWORD + androidId;

    // 3. Create a Wallet instance from private key
    const wallet = new ethers.Wallet(PRIVATE_KEY);

    // 4. Encrypt the wallet (this returns a JSON string)
    const encryptedJson = await wallet.encrypt(finalPassword);

    // 5. Store in SecureStore
    await SecureStore.setItemAsync(STORAGE_KEY, encryptedJson);

    console.log('Encrypted wallet stored securely!');
  } catch (err) {
    console.error('Encryption error:', err);
  }
};

export default Secure;

const decryptWalletFromStore = async (): Promise<ethers.Wallet | null> => {
  try {
    const androidId = Application.getAndroidId() || 'fallback-id';
    const finalPassword = USER_PASSWORD + androidId;

    const encryptedJson = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!encryptedJson) throw new Error('No wallet stored');

    const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, finalPassword) as ethers.Wallet;
    return wallet;
    
  } catch (err) {
    console.error('Decryption error:', err);
    return null;
  }
};
