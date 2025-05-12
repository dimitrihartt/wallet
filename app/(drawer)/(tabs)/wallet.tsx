import { Stack } from 'expo-router';
import { ScrollView } from 'react-native';
import { Block } from '~/components/Block';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import { Wallet } from '~/components/Wallet';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView contentContainerClassName="bg-white dark:bg-gray-900">
        <Container>
          {/* <ScreenContent path="app/(drawer)/(tabs)/two.tsx" title="Tab Two" /> */}
          <Wallet blockchain={undefined} />
          {/* <Transaction fromAddress={null} toAddress={''} amount={0} />
          <Block timestamp={0} transactions={[]} difficulty={0} /> */}
        </Container>
      </ScrollView>
    </>
  );
}
