import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Container } from '~/components/Container';
import { Fab, FabLabel, FabIcon } from "~/components/ui/fab"
import { AddIcon } from "~/components/ui/icon"
import WalletGenerator from '~/components/WalletGenerator';


export default function Home() {
  const handleFabPress = () => {
    // Your action here
    console.log('FAB pressed!');
  };
  
  return (
    <View className="flex-1">
      <Stack.Screen options={{ title: 'Wallet' }} />
      <Container>
        <WalletGenerator />
        <Fab
          size="md"
          placement="bottom right"
          isHovered={false}
          isDisabled={false}
          isPressed={false}>
          <FabIcon as={AddIcon} />
          <FabLabel>Quick start</FabLabel>
        </Fab>
      </Container>
    </View>
  );
}
