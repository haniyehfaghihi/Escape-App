// app/_layout.tsx
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  DevSettings,
  I18nManager,
  Text,
  TextInput,
  View,
} from "react-native";
import "../global.css";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { YEKAN_FANUM } from "../src/constants/yekanFonts";

void SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoaded, userToken } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const setRTLAndReload = async () => {
      if (!I18nManager.isRTL) {
        try {
          I18nManager.allowRTL(true);
          I18nManager.forceRTL(true);

          if (__DEV__) {
            DevSettings.reload();
          } else {
            await Updates.reloadAsync();
          }
        } catch (e) {
          console.error("Failed to set RTL and reload:", e);
        }
      }
    };

    setRTLAndReload();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOwnerGroup = segments[0] === "(owner)";

    if (!userToken) {
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else if (inAuthGroup || !inOwnerGroup) {
      router.replace("/(owner)");
    }
  }, [isLoaded, userToken, segments]);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Slot />
    </View>
  );
}

type HostWithDefaults = {
  defaultProps?: { style?: unknown; [key: string]: unknown };
};

function assignDefaultFontFamily(C: HostWithDefaults, fontFamily: string) {
  const base = { fontFamily };
  const prev = C.defaultProps?.style;
  C.defaultProps = {
    ...C.defaultProps,
    style: prev != null ? [prev, base] : base,
  };
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    [YEKAN_FANUM.regular]: require("../assets/fonts/yekan-bakh/yekan-bakh-regular.ttf"),
    [YEKAN_FANUM.medium]: require("../assets/fonts/yekan-bakh/yekan-bakh-medium.ttf"),
    [YEKAN_FANUM.bold]: require("../assets/fonts/yekan-bakh/yekan-bakh-bold.ttf"),
    [YEKAN_FANUM.heavy]: require("../assets/fonts/yekan-bakh/yekan-bakh-heavy.ttf"),
    [YEKAN_FANUM.light]: require("../assets/fonts/yekan-bakh/yekan-bakh-light.ttf"),
    [YEKAN_FANUM.fat]: require("../assets/fonts/yekan-bakh/yekan-bakh-fat.ttf"),
  });

  const defaultFontApplied = useRef(false);

  useEffect(() => {
    if (!fontsLoaded || defaultFontApplied.current) return;
    defaultFontApplied.current = true;
    assignDefaultFontFamily(Text as HostWithDefaults, YEKAN_FANUM.regular);
    assignDefaultFontFamily(TextInput as HostWithDefaults, YEKAN_FANUM.regular);
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
