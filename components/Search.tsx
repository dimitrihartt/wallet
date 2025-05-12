import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { ethers } from 'ethers';
import * as Random from 'expo-random';
import { wordList } from '~/utils/wordlist';
import { generateMnemonic, validateMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import * as Crypto from 'expo-crypto';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { pbkdf2Sync } from 'ethereum-cryptography/pbkdf2';
import { utf8ToBytes, hexToBytes, bytesToHex, toHex } from 'ethereum-cryptography/utils';
import { HDKey } from '@scure/bip32';

// Replace with your Infura project ID
const INFURA_PROJECT_ID = '5d21d229dfcd4a3794470a37705bb83f';
const provider = new ethers.InfuraProvider('homestead', INFURA_PROJECT_ID);

// The provider also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, we need the account signer...
const signer = provider.getSigner();

const Search: React.FC = () => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [privateKeyHex, setPrivateKeyHex] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [publicKeyHex, setPublicKeyHex] = useState<string>('');
  const [myAddress, setMyAddress] = useState<string>('');

  const checkBalance = async (address: string) => {
    try {
      // Validate the Ethereum address
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid Ethereum address');
      }

      // Get the balance in wei (smallest unit of Ether)
      const balanceWei = await provider.getBalance(address);

      // Convert the balance from wei to Ether
      const balanceEther = ethers.formatEther(balanceWei);

      console.log(`Balance of ${address}: ${balanceEther} ETH`);
      return balanceEther;
    } catch (error) {
      console.error('Error checking balance:', error);
      throw error;
    }
  };

  // Function to generate random numbers and map them to words
  const generateRandomNumbers = async () => {
    try {
      setError(null);
      // Generate 24 random bytes (2 bytes per number for 12 numbers)
      const byteArray = new Uint8Array(24);
      const randomBytes = Crypto.getRandomValues(byteArray);      
      
      const randomNumbers = [];
      for (let i = 0; i < randomBytes.length; i += 2) {
        // Combine two bytes to form a 16-bit number
        const combined = (randomBytes[i] << 8) | randomBytes[i + 1];
        // Map the 16-bit number to the range 1–2048
        randomNumbers.push((combined % 2048) + 1);
      }      
      // Map the numbers to words from the word list
      const mnemonic = randomNumbers.map((num) => wordList[(num - 1) % wordList.length]);
      setSelectedWords(mnemonic);      
      
      setMnemonic(mnemonic.join(' '));
      // Validate the mnemonic
      const isValid = validateMnemonic(mnemonic.join(' '), wordList);
      if (isValid) {
        console.log('Valid mnemonic:', mnemonic.join(' '));
        // Convert mnemonic to seed
        const seed = mnemonicToSeedSync(mnemonic.join(' '));

        
        const root = HDKey.fromMasterSeed(seed); // Create HDKey from seed
        const child = root.derive("m/44'/60'/0'/0/0"); // Ethereum path

        const privateKey = child.privateKey; // Get the private key
        if (!privateKey) {
          throw new Error('❌ Private key is null.');
        }
        const privateKeyHex = toHex(privateKey); // Convert to hex
        setPrivateKeyHex(privateKeyHex); // Set the private key in state
        console.log('Private key Hex:', privateKeyHex);

        const publicKey = child.publicKey; // Get the public key
        if (!publicKey) {
          throw new Error('❌ Public key is null.');
        }

        const publicKeyHex = toHex(publicKey); // Convert to hex
        setPublicKey(publicKeyHex); // Set the public key in state

        const pubKey =
          publicKey.length === 65 && publicKey[0] === 0x04 ? publicKey.slice(1) : publicKey; // Remove the first byte (0x04) from uncompressed key
        const cryptoAddress = '0x' + toHex(keccak256(pubKey).slice(-20)); // Convert to hex and prefix with "0x"
        setMyAddress(cryptoAddress); // Set the address in state

        console.log('🔐 Address created! 🔐', cryptoAddress); // Log the address

        try {
          const balance = await checkBalance(cryptoAddress);

          // Convert balance to a numeric value for comparison
          const balanceInEther = parseFloat(balance);

          if (balanceInEther > 0.1) {
            console.log('🔐🔐🔐🔐 Balance is greater than 0.1 ETH:', balanceInEther);
          } else {
            //generateRandomNumbers();
            console.log('🔐🔐🔐🔐 Balance is less than 0.1 ETH:', balanceInEther);
          }
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        }
      } else {
        // generateRandomNumbers();
      }
    } catch (err) {
      setError('Failed to generate random numbers.');
    }
  };

  const connectToInfura = async () => {
    try {
      const network = await provider.getNetwork();
      console.log('Connected to network:', network.name);
    } catch (err) {
      setError('Failed to connect to Infura.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Random Word Search</Text>
      <Button title="Generate Words" onPress={generateRandomNumbers} />
      <Button title="Connect to Infura" onPress={connectToInfura} />
      {selectedWords.length > 0 && (
        <View style={styles.wordList}>
          <Text style={styles.subtitle}>Selected Words:</Text>
          {selectedWords.map((word, index) => (
            <Text key={index} style={styles.word}>
              {word}
            </Text>
          ))}
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  wordList: {
    marginTop: 10,
  },
  word: {
    fontSize: 16,
    marginVertical: 2,
  },
  error: {
    color: 'red',
    marginTop: 20,
  },
});

export default Search;
