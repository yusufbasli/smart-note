import React, { useEffect } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "./src/store/authStore";
import AuthStack from "./src/navigation/AuthStack";
import MainTabs from "./src/navigation/MainTabs";

const webStyle = Platform.OS === "web" ? { height: "100vh" as any, overflow: "hidden" as any } : {};

export default function App() {
  const { token, isLoading, loadToken } = useAuthStore();

  useEffect(() => {
    loadToken();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={[{ flex: 1, alignItems: "center", justifyContent: "center" }, webStyle]}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={webStyle}>
      <NavigationContainer>
        <StatusBar style="light" />
        {token ? <MainTabs /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
