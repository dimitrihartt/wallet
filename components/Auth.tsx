import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState } from 'react-native'
import { supabase } from '../utils/supabase'

import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { FormControl } from '@/components/ui/form-control'
import { VStack } from '@/components/ui/vstack'
import { Text } from '@/components/ui/text'
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon"


// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  const handleState = () => {
    setShowPassword((showState) => {
      return !showState
    })
  }

  return (
    <FormControl className="p-4 border rounded-lg border-outline-300">
      <VStack space="xl">
        <Heading className="text-typography-900">Login</Heading>
        <VStack space="xs">
          <Text className="text-typography-500">Email</Text>

          <Input className="min-w-[250px]">
            <InputField 
              type="text"
              placeholder="email@example.com"
              value={email}
              onChangeText={(text) => setEmail(text)}              
            />
          </Input>

        </VStack>
        <VStack space="xs">
          <Text className="text-typography-500">Password</Text>
          <Input className="text-center">
            <InputField
              placeholder="password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              type={showPassword ? "text" : "password"} />
            <InputSlot className="pr-3" onPress={handleState}>
              <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
            </InputSlot>
          </Input>
        </VStack>
        <Button
          className="ml-auto"
          disabled={loading}
          onPress={() => {
            signInWithEmail()
          }}
        >
          <ButtonText className="text-typography-0">Sign in</ButtonText>
        </Button>
        <Button
          className="ml-auto"
          disabled={loading}
          onPress={() => {
            signUpWithEmail()
          }}
        >
          <ButtonText className="text-typography-0">Sign up</ButtonText>
        </Button>
      </VStack>
    </FormControl>
  )
}