import { Stack } from 'expo-router';
import { Wallet } from '~/components/Wallet';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Transactions' }} />     
      <Wallet blockchain={undefined} />
      {/* <Transaction fromAddress={null} toAddress={''} amount={0} />
            <Block timestamp={0} transactions={[]} difficulty={0} /> */}

    </>
  );
}
