import React, { useEffect, useState } from 'react';

import * as Crypto from 'expo-crypto';
import { keccak256 } from 'ethereum-cryptography/keccak';
import * as secp from '@noble/secp256k1';
import {  
  entropyToMnemonic,
  mnemonicToSeedSync,
  validateMnemonic,
} from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';



// This component generates the wallet
const WalletGenerator = () => {
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');  
  const ADDRESS_PATH = "m/44'/60'/0'/0/0";  

  useEffect(() => {
    generateWallet();
  }, []);

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

    } catch (error) {
      console.error('Error generating wallet:', error);
    }
  };

  return {mnemonic, privateKey, cryptoAddress};
};

export default WalletGenerator;
