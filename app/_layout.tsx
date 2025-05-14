import '../global.css';

import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(drawer)',
};

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light"><GestureHandlerRootView style={{ flex: 1}}>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        <Stack>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ title: 'Modal', presentation: 'modal' }} />
        </Stack>
      </GestureHandlerRootView></GluestackUIProvider>
  );
}
