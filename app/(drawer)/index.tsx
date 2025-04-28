import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import Auth from '~/components/Auth';
import Account from '~/components/Account';

import { Session } from '@supabase/supabase-js';
import { supabase } from '~/utils/supabase';

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <ScrollView contentContainerClassName="bg-white dark:bg-gray-900">
        <Container>
          {/* <ScreenContent path="app/(drawer)/index.tsx" title="Home" /> */}

          {session && session.user ? <Account key={session.user.id} session={session} /> : <Auth />}
        </Container>
    
      </ScrollView>
    </>
  );
}
