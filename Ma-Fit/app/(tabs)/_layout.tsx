import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { TouchableOpacity } from "react-native";

function HeaderProfileButton() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={() => router.push("/profile")} style={{ padding: 8, marginRight: 8 }}>
      <Ionicons name="person-circle" size={28} color={colors.primary} />
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const { colors, setAppTheme } = useTheme();
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("app_theme").eq("id", user.id).single();
      const t = data?.app_theme as "green"|"blue"|"purple"|"orange";
      if (t && ["green","blue","purple","orange"].includes(t)) setAppTheme(t);
    })();
  }, [setAppTheme]);
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.tabBar },
        headerTintColor: colors.text,
        headerRight: () => <HeaderProfileButton />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.tabBarBorder },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="checkin"
        options={{
          title: "Check-in",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: "Challenges",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bewegen"
        options={{
          title: "Bewegen",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="walk" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hulp"
        options={{
          title: "Hulp",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-buoy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
