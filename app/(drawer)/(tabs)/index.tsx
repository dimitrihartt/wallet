import { Stack } from 'expo-router';
import { Container } from '~/components/Container';
import WalletGenerator from '~/components/WalletGenerator';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Wallet' }} />
      <Container>
        <WalletGenerator />
      </Container>
    </>
  );
}
