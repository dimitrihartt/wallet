import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Drawer } from 'expo-router/drawer';

import { QRCodeButton } from '~/components/QRCodeButton';
import { SettingsButton } from '~/components/SettingsButton';
import { HStack } from '~/components/ui/hstack';


const DrawerLayout = () => {

  function HeaderLinks() {
    return (
      <HStack className='gap-x-4'>
        <Link href="/qrcode-modal" asChild>
          <QRCodeButton />
        </Link>
        <Link href="/settings-modal" asChild>
          <SettingsButton />
        </Link>
      </HStack>
    );
  }

  return (
    <Drawer>
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: 'Home',
          drawerLabel: 'Home',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: 'Ascend Wallet',
          drawerLabel: 'Wallet',
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="wallet" size={size} color={color} />
          ),
          headerRight: () => <HeaderLinks />,
        }}
      />      
    </Drawer>
  );
};

export default DrawerLayout;
