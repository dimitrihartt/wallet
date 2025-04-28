import { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
import { Transaction } from './Transaction';

import * as Crypto from 'expo-crypto';
import * as secp from '@noble/secp256k1';

import QRCode from 'react-native-qrcode-svg';

// const ec = new EC('secp256k1');

export function Wallet({ blockchain }: { blockchain: any }) {
  const [UUID, setUUID] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [publicKeyCompressed, setPublicKeyCompressed] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);

  const generateWallet = async () => {
    // Generate a random UUID
    const UUID = Crypto.randomUUID();
    // Generate a random 256-bit number    
    const byteArray = new Uint8Array(32); // 32 bytes = 256 bits
    // Fill the byte array with random values
    // Use the getRandomValues method to fill the byte array with cryptographically strong random values
    const randomData = await Crypto.getRandomValues(byteArray);
    
    // Create the hash of the random data
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, randomData);
    // Convert the hash to a byte array
    const privateKeyBytes = Uint8Array.from(Buffer.from(hash, 'hex'));
    // Convert the byte array to a hex string
    const privateKeyHex = Buffer.from(privateKeyBytes).toString('hex');
    // Get the public key from the private key
    const publicKeyBytes = secp.getPublicKey(privateKeyBytes, false); // compressed = true by default
    // Convert the public key to a hex string
    const publicKeyHex = Buffer.from(publicKeyBytes).toString('hex');
    // Convert the public key to a compressed format
    const publicKeyCompressed = secp.getPublicKey(privateKeyBytes, true); // compressed = true

    setUUID(UUID);
    setPrivateKey(privateKeyHex);
    setPublicKey(publicKeyHex);
    setPublicKeyCompressed(Buffer.from(publicKeyCompressed).toString('hex'));

    // const key = ec.genKeyPair();

    // const privateKeyGenerated = key.getPrivate('hex');
    // const publicKeyGenerated = key.getPublic('hex');

    // setPrivateKey(privateKeyGenerated);
    // setPublicKey(publicKeyGenerated);

    //const newBalance = blockchain.getBalanceOfAddress(publicKeyGenerated);
    //setBalance(newBalance);
  };

  const sendTransaction = () => {
    if (!privateKey || !publicKey || !recipientAddress || !amount) {
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

  return (
    <View className="mb-2 rounded-md bg-white p-4 shadow-md">
      <Text className="mb-4 text-center text-2xl font-bold">Wallet</Text>

      <Button title="Generate Wallet" onPress={generateWallet} />

      {publicKey ? (
        <>
          <Text className="mt-4 font-bold">UUID:</Text>
          <Text selectable className="mb-2 text-xs">
            {UUID}
          </Text>

          <Text className="mt-4 font-bold">Public Key:</Text>
          <Text selectable className="mb-2 text-xs">
            {publicKey}
          </Text>

          <Text className="mt-4 font-bold">Public Key Compressed:</Text>
          <Text selectable className="mb-2 text-xs">
            {publicKeyCompressed}
          </Text>

          <View className="mb-2 h-40 w-40 items-center justify-center rounded-md border border-gray-300 bg-white pt-4">
            <QRCode value={publicKeyCompressed} />
            <Text className="mb-2 text-xs italic text-gray-500">Scan to send funds</Text>
          </View>

          <Text className="font-bold">Private Key:</Text>
          <Text selectable className="mb-2 text-xs">
            {privateKey}
          </Text>

          <Text className="mt-2 font-bold">Balance: {balance}</Text>

          <Button title="Refresh Balance" onPress={refreshBalance} />

          <View className="mt-4 space-y-2">
            <TextInput
              className="rounded-md border border-gray-300 bg-white p-2"
              placeholder="Recipient Address"
              value={recipientAddress}
              onChangeText={setRecipientAddress}
            />
            <TextInput
              className="rounded-md border border-gray-300 bg-white p-2"
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <Button title="Send Transaction" onPress={sendTransaction} />
          </View>
        </>
      ) : (
        <Text className="mt-4 text-center italic text-gray-500">
          Create or load a wallet to begin.
        </Text>
      )}
    </View>
  );
}
