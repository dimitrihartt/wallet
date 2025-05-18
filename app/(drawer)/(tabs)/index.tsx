import { useState } from 'react';
import { Stack } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Fab, FabLabel, FabIcon } from "~/components/ui/fab"
import { AddIcon } from "~/components/ui/icon"
import WalletGenerator from '~/components/WalletGenerator';
import { Container } from '~/components/Container';

import { Text } from '~/components/ui/text';
import { Center } from '~/components/ui/center';
import { Scroll, Wallet } from 'lucide-react-native'; // Use any Lucide icon
import { Grid, GridItem } from '~/components/ui/grid';

export default function Home() {
  const [showComponent, setShowComponent] = useState(false);
  const [cryptoAddress, setCryptoAddress] = useState<string | null>(null);

  const handleFabPress = () => {
    //const address = WalletGenerator();
    //setCryptoAddress(address);
    setShowComponent(true);
  };

  const noWalletUI = () => {
    return (
      <Center className="flex-1 bg-white p-4">
        <View className="items-center space-y-4">
          <Wallet size={48} color="#787878" />
          <Text className="text-lg text-gray-500 font-medium">
            You don't have a wallet set yet.
          </Text>
        </View>
      </Center>
    );
  }

  const askForPinUI = () => {
    return (
      <Center className="flex-1 bg-white p-4">
        <View className="items-center space-y-4">
          <Wallet size={48} color="#787878" />
          <Text className="text-lg text-gray-500 font-medium">
            We have just created your Wallet!
          </Text>
          <Text className="text-lg text-gray-500 font-medium">
            This is your 12-word-mnemonic that represents your wallet.
          </Text>
          <Text className="text-lg text-gray-500 font-medium pb-8">
            Please carefully write all of those words down somewhere safe.
          </Text>
        </View>
      </Center>
    );
  }

  const twelvePinGrid = () => {
    return (
      <ScrollView>
        <Grid
          className="gap-y-2 gap-x-4"
          _extra={{
            className: "grid-cols-6",
          }}
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <GridItem
              key={index}
              className="bg-background-50 p-4 rounded-md text-center"
              _extra={{
                className: "col-span-2",
              }}
            >
              <Text className="text-sm">{index + 1}</Text>
            </GridItem>
          ))
          }
        </Grid>
      </ScrollView>

    );
  }

  return (
    <Container>
      <View className="flex-1">
        <Stack.Screen options={{ title: 'Wallet' }} />
        {showComponent? twelvePinGrid() : noWalletUI()}
        <Fab          
          size="md"
          placement="bottom right"
          isHovered={false}
          isDisabled={false}
          isPressed={false}
          onPress={handleFabPress}>
          <FabIcon as={AddIcon} />
          <FabLabel>Quick start</FabLabel>
        </Fab>
      </View>
    </Container>

  );
}
