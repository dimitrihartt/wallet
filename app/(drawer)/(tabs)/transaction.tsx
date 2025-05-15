import { Stack } from 'expo-router';

import { Container } from '~/components/Container';
import SendToAddress from '~/components/SendToAddress';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Transactions' }} />
      <Container>
        {/* <ScreenContent path="app/(drawer)/(tabs)/two.tsx" title="Tab Two" />*/}
        <SendToAddress
          address={scannedData}
          onSend={(address, amount) => {
            // handle send logic here
            console.log('Send', amount, 'to', address);
          }}
        />
        
      </Container>
    </>
  );
}
