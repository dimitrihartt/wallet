import { Stack } from 'expo-router';

import { Container } from '~/components/Container';

import { Wallet } from '~/components/Wallet';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Transactions' }} />
      <Container>
        {/* <ScreenContent path="app/(drawer)/(tabs)/two.tsx" title="Tab Two" /> */}
        <Wallet blockchain={undefined} />
        {/* <Transaction fromAddress={null} toAddress={''} amount={0} />
            <Block timestamp={0} transactions={[]} difficulty={0} /> */}
      </Container>
    </>
  );
}
