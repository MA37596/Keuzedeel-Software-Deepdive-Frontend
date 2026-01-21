import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import { Stack } from "expo-router";

function RootStack() {
  const { colors } = useTheme();
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profiel",
          headerShown: true,
          headerStyle: { backgroundColor: colors.tabBar },
          headerTintColor: colors.text,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}