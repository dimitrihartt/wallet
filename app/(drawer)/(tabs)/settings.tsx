import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { ScrollView, View, TouchableOpacity, Switch } from 'react-native';
import { Container } from '~/components/Container';
import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';

import { Box } from "~/components/ui/box"
import { HStack } from "@/components/ui/hstack"
import { Button, ButtonText, ButtonIcon } from "~/components/ui/button"
import { Heading } from "~/components/ui/heading"
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "~/components/ui/modal"
import { Text } from "@/components/ui/text"
import { Icon, TrashIcon } from "~/components/ui/icon"
import { Input, InputField } from "@/components/ui/input"
import { Link, LinkText } from "~/components/ui/link"
import { ArrowLeftIcon } from "@/components/ui/icon"


const SettingsPage = () => {
  const [useBiometrics, setUseBiometrics] = useState(false);

  const [showModal, setShowModal] = React.useState(false)
  const [showModalPin, setShowModalPin] = React.useState(false)
  const [showModalNewPin, setShowModalNewPin] = React.useState(false)
  const [showModalFinish, setShowModalFinish] = React.useState(false)

  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const [privateKeyHex, setPrivateKeyHex] = useState('');
  const [isPinProvidedWorking, setIsPinProvidedWorking] = React.useState(false);
  const [isEncryptedPrivateKeyStored, setIsEncryptedPrivateKeyStored] = React.useState(false);


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

  const checkPin = async () => {
    // 1. Get Android ID (acts like a device UUID)
    const androidId = Application.getAndroidId() || 'fallback-id';
    if (!androidId) throw new Error('Failed to get Android ID');
    console.log('🔐 AndroidID:', androidId);

    // 2. Create the final passphrase
    const finalPassword = pin + androidId;
    console.log('Final Password:', finalPassword);

    // 3. Hash the password to create a key for encryption
    const key = CryptoJS.SHA256(finalPassword).toString(); // Derive AES key from finalPassword
    console.log('Key:', key);

    // 4. Restore the encrypted privateKey from Secure Storage
    const encryptedPrivateKey = await SecureStore.getItemAsync('encryptedPrivateKey');
    if (!encryptedPrivateKey) {
      throw new Error('❌ Encrypted private key not found.');
    }

    // 5. Try to decrypt the EncryptedPrivateKey with the pin provided
    const decrypted = CryptoJS.AES.decrypt(encryptedPrivateKey, key); // Decrypt AES
    if (!decrypted) {
      throw new Error('❌ Decryption failed. Possibly wrong pin provided.');
    }

    // 6. Restore the PK in Hex
    const privateKeyHex = decrypted.toString(CryptoJS.enc.Utf8); // Decode to UTF-8
    if (!privateKeyHex) {
      throw new Error('❌ Decryption failed. Possibly wrong pin or corrupted data.');
    }
    setPrivateKeyHex(privateKeyHex);
    setIsPinProvidedWorking(true);
  }

  const changePin = async () => {
    // 1. Get Android ID (acts like a device UUID)
    const androidId = Application.getAndroidId() || 'fallback-id';
    if (!androidId) throw new Error('Failed to get Android ID');
    console.log('🔐 AndroidID:', androidId);

    // 2. Create the final passphrase
    const finalPin = pin + androidId;
    console.log('Final Pin:', finalPin);

    // 3. Create a newKey with the newPin
    const newKey = CryptoJS.SHA256(finalPin).toString(); // Hash the new pin to create a key for encryption

    // 4. Encrypt the privateKey with the new PIN
    const encrypted = CryptoJS.AES.encrypt(privateKeyHex, newKey).toString();

    // 5 Store the encrypted private key in secure storage
    await SecureStore.setItemAsync('encryptedPrivateKey', encrypted);

    setIsEncryptedPrivateKeyStored(true); // Update the state to indicate that the private key is stored
    console.log(
      '🔐 Password changed and your Private key was encrypted and saved again! 🔐',
      encrypted
    );
  }

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
              onPress={() => setShowModal(true)}
              className="mb-4 rounded-lg bg-red-500 p-4">
              <Text className="text-center font-semibold text-white">Delete Your Wallet</Text>
            </TouchableOpacity>

            {/* Change PIN Button */}
            <TouchableOpacity onPress={() => setShowModalPin(true)} className="mb-4 rounded-lg bg-blue-500 p-4">
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

            <Modal
              isOpen={showModal}
              onClose={() => {
                setShowModal(false)
              }}
            >
              <ModalBackdrop />
              <ModalContent className="max-w-[305px] items-center">
                <ModalHeader>
                  <Box className="w-[56px] h-[56px] rounded-full bg-background-error items-center justify-center">
                    <Icon as={TrashIcon} className="stroke-error-600" size="xl" />
                  </Box>
                </ModalHeader>
                <ModalBody className="mt-0 mb-4">
                  <Heading size="md" className="text-typography-950 mb-2 text-center">
                    Delete your Wallet
                  </Heading>
                  <Text size="sm" className="text-typography-500 text-center">
                    Are you sure you want to delete your wallet? This action cannot be
                    undone.
                  </Text>
                </ModalBody>
                <ModalFooter className="w-full">
                  <Button
                    variant="outline"
                    action="secondary"
                    size="sm"
                    onPress={() => {
                      setShowModal(false)
                    }}
                    className="flex-grow"
                  >
                    <ButtonText>Cancel</ButtonText>
                  </Button>
                  <Button
                    onPress={async () => {
                      deleteWallet()
                      setShowModal(false)
                    }}
                    size="sm"
                    className="flex-grow"
                  >
                    <ButtonText>Delete</ButtonText>
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Modal
              isOpen={showModal}
              onClose={() => {
                setShowModalPin(false)
              }}
            >
              <ModalBackdrop />
              <ModalContent>
                <ModalHeader className="flex-col items-start gap-0.5">
                  <Heading>Change your Pin</Heading>
                  <Text size="sm">Please, enter your current Pin</Text>
                </ModalHeader>
                <ModalBody className="mb-4">
                  <Input>
                    <InputField placeholder="Enter your current pin" />
                  </Input>
                </ModalBody>
                <ModalFooter className="flex-col items-start">
                  <Button
                    onPress={() => {
                      setShowModalNewPin(true)
                    }}
                    className="w-full"
                  >
                    <ButtonText>Submit</ButtonText>
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    onPress={() => {
                      setShowModalPin(false)
                    }}
                    className="gap-1"
                  >
                    <ButtonIcon as={ArrowLeftIcon} />
                    <ButtonText>Back to login</ButtonText>
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Modal
              isOpen={showModalNewPin}
              onClose={() => {
                setShowModalNewPin(false)
              }}
            >
              <ModalBackdrop />
              <ModalContent>
                <ModalHeader className="flex-col items-start gap-0.5">
                  <Heading>Set new Pin</Heading>
                  <Text size="sm">
                    Almost done. Don't forget to also write it down somewhere safe.
                  </Text>
                </ModalHeader>
                <ModalBody className="" contentContainerClassName="gap-3">
                  <Input>
                    <InputField placeholder="New Pin" />
                  </Input>
                  <Input>
                    <InputField placeholder="Confirm new Pin" />
                  </Input>
                </ModalBody>
                <ModalFooter className="flex-col items-start">
                  <Button
                    onPress={() => {
                      changePin
                      setShowModalPin(false)
                      setShowModalNewPin(false)
                    }}
                    className="w-full"
                  >
                    <ButtonText>Submit</ButtonText>
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    onPress={() => {
                      setShowModalNewPin(false)
                    }}
                    className="gap-1"
                  >
                    <ButtonIcon as={ArrowLeftIcon} />
                    <ButtonText>Back to login</ButtonText>
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Modal
              isOpen={showModalNewPin}
              onClose={() => {
                setShowModalFinish(false)
              }}
            >
              <ModalBackdrop />
              <ModalContent>
                <ModalHeader className="flex-col items-start gap-0.5">
                  <Heading>New Pin was set!</Heading>
                  <Text size="sm">
                    All done! Your new Pin was set successfully!
                  </Text>
                </ModalHeader>
                <ModalBody className="" contentContainerClassName="gap-3">

                </ModalBody>
                <ModalFooter className="flex-col items-start">
                  <Button
                    onPress={() => {
                      setShowModalPin(false)
                      setShowModalNewPin(false)
                      setShowModalFinish(false)
                    }}
                    className="w-full"
                  >
                    <ButtonText>Submit</ButtonText>
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    onPress={() => {
                      setShowModalPin(false)
                    }}
                    className="gap-1"
                  >
                    <ButtonIcon as={ArrowLeftIcon} />
                    <ButtonText>Back to login</ButtonText>
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </View>
        </Container>
      </ScrollView>
    </>
  );
};

export default SettingsPage;
