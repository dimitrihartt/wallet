import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  GluestackIcon,
  GluestackIconDark,
} from "./assets/icons/gluestack-icon";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";

export const SplashScreen = () => {
  const { colorScheme } = useColorScheme();
  const router = useRouter();

  return (
    <VStack
      className="flex-1 w-full max-w-[440px] items-center justify-center px-5"
      space="lg"
    >
      {colorScheme === "dark" ? (
        <Icon as={GluestackIconDark} className="w-[219px] h-10" />
      ) : (
        <Icon as={GluestackIcon} className="w-[219px] h-10" />
      )}
      <VStack className="w-full" space="lg">
        <Button
          className="w-full"
          onPress={() => router.push("/")}>
          <ButtonText className="font-medium">Log in</ButtonText>
        </Button>
        <Button
          onPress={() => router.push("/")}>
          <ButtonText className="font-medium">Sign Up</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
};