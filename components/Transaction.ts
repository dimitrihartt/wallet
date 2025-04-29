import * as Crypto from 'expo-crypto';
import * as secp from '@noble/secp256k1';

export class Transaction {
  fromAddress: string | null;
  toAddress: string;
  amount: number;
  timestamp: number;
  signature?: string;

  constructor(fromAddress: string | null, toAddress: string, amount: number) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  /**
   * Computes the SHA256 hash of the transaction data.
   */
  async calculateHash(): Promise<string> {
    const data = `${this.fromAddress}${this.toAddress}${this.amount}${this.timestamp}`;
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
  }

  /**
   * Signs the transaction with the given private key.
   * The method checks that the public key derived from the provided
   * private key matches the fromAddress.
   *
   * @param privateKey - The signing private key as a hex string.
   */
  async signTransaction(privateKey: string): Promise<void> {
    // Ensure the public key derived from the private key matches the fromAddress.
    // Here, we use compressed format (pass `true`).
    if (Buffer.from(secp.getPublicKey(privateKey, true)).toString('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }

    const hashTx = await this.calculateHash();
    const signature = await secp.sign(hashTx, privateKey);
    this.signature = signature.toCompactHex();
  }

  /**
   * Verifies the signature of this transaction.
   * Uses the fromAddress (assumed to be the compressed public key) to verify.
   *
   * @returns a Promise that resolves to true if the transaction is valid.
   */
  async isValid(): Promise<boolean> {
    // If fromAddress is null, we assume it's a mining reward.
    if (this.fromAddress === null) {
      return true;
    }

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const hashTx = await this.calculateHash();
    return await secp.verify(this.signature, hashTx, this.fromAddress);
  }
}
