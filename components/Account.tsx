import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { StyleSheet, View, Alert } from 'react-native';

import { Session } from '@supabase/supabase-js';
import ProfileAvatar from './ProfileAvatar';

import { Box } from '@/components/ui/box';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ArrowLeftIcon } from '@/components/ui/icon';

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, firstname, lastname, website, avatar_url`)
        .eq('id', session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setFirstname(data.firstname);
        setLastname(data.lastname);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    firstname,
    lastname,
    website,
    avatar_url,
  }: {
    username: string;
    firstname: string;
    lastname: string;
    website: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session?.user.id,
        username,
        firstname,
        lastname,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Center>
      <Box className="m-1 w-full rounded-lg border border-background-300 p-5">
        <VStack className="pb-4" space="xs">
          <Heading className="leading-[30px]">My Profile</Heading>
          <Text className="mb-2 text-sm">FYI: The below data is on our servers.</Text>
          <ProfileAvatar
            size={200}
            url={avatarUrl}
            onUpload={(url: string) => {
              setAvatarUrl(url);
              updateProfile({ username, firstname, lastname, website, avatar_url: url });
            }}
          />
        </VStack>
        <VStack space="xl" className="py-2">
          <Text className="text-typography-500">E-mail</Text>
          <Input variant="outline" size="md" isDisabled={true}>
            <InputField className="py-2" placeholder="Email" value={session?.user?.email} />
          </Input>
          <Text className="text-typography-500">Username</Text>
          <Input variant="outline" size="md" isDisabled={false}>
            <InputField
              className="py-2"
              placeholder="Username"
              value={username || ''}
              onChange={e => setUsername(e.nativeEvent.text)}
            />
          </Input>

          <Text className="text-typography-500">Firstname</Text>
          <Input variant="outline" size="md" isDisabled={false}>
            <InputField
              className="py-2"
              placeholder="Firstname"
              value={firstname || ''}
              onChange={e => setFirstname(e.nativeEvent.text)}
            />
          </Input>

          <Text className="text-typography-500">Lastname</Text>
          <Input variant="outline" size="md" isDisabled={false}>
            <InputField
              className="py-2"
              placeholder="Lastname"
              value={lastname || ''}
              onChange={e => setLastname(e.nativeEvent.text)}
            />
          </Input>

          <Text className="text-typography-500">Website</Text>
          <Input variant="outline" size="md" isDisabled={false}>
            <InputField
              className="py-2"
              placeholder="Website"
              value={website || ''}
              onChange={e => setWebsite(e.nativeEvent.text)}
            />
          </Input>
          {/* <Text className="text-typography-500">Change password</Text>
            <Input>
              <InputField className="py-2" placeholder="New password" />
            </Input>
            <Input>
              <InputField className="py-2" placeholder="Confirm new password" />
            </Input> */}
        </VStack>
        <VStack space="lg" className="pt-4">
          <Button
            size="sm"
            isDisabled={loading}
            onPress={() =>
              updateProfile({ username, firstname, lastname, website, avatar_url: avatarUrl })
            }>
            <ButtonText>{loading ? 'Loading ...' : 'Update'}</ButtonText>
          </Button>
          <Box className="flex flex-row">
            <Button
              variant="link"
              size="sm"
              className="p-0"
              onPress={() => supabase.auth.signOut()}>
              <ButtonIcon className="mr-1" size="md" as={ArrowLeftIcon} />
              <ButtonText>Sign Out</ButtonText>
            </Button>
          </Box>
        </VStack>
      </Box>
    </Center>
  );
}