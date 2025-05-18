import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';

import { Container } from '~/components/Container';

import Auth from '~/components/Auth';
import Account from '~/components/Account';

import { Button, ButtonText } from '~/components/ui/button';

import { Session } from '@supabase/supabase-js';
import { supabase } from '~/utils/supabase';

import { useRouter } from 'expo-router';

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener?.subscription?.unsubscribe();
  }, []);

  return (
    <Container>
      <Stack.Screen options={{ title: 'Home' }} />
      <ScrollView contentContainerClassName="bg-white dark:bg-gray-900">
        {session && session.user ? <Account key={session.user.id} session={session} /> : <Auth />}
      </ScrollView>
    </Container>
  );
}
