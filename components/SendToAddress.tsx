import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  address: string;
  onSend: (address: string, amount: string) => void;
};

export default function SendToAddress({ address, onSend }: Props) {
  const [amount, setAmount] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Recipient Address:</Text>
      <Text style={styles.address}>{address}</Text>
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => onSend(address, amount)}
        disabled={!amount}
      >
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 24,
    elevation: 2,
    alignItems: 'stretch',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
  address: {
    marginBottom: 16,
    color: '#444',
    fontSize: 14,
    wordBreak: 'break-all',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 1,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});