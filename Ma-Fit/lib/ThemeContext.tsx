import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

const STORAGE_KEY = "@mafit_darkmode";

export type AppThemePreset = "green" | "blue" | "purple" | "orange";

type Theme = "light" | "dark" | "system";

type Colors = {
  background: string;
  backgroundSecondary: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryMuted: string;
  accent: string;
  accentMuted: string;
  success: string;
  tabBar: string;
  tabBarBorder: string;
  icon: string;
};

const PRESETS: Record<AppThemePreset, { light: Colors; dark: Colors }> = {
  green: {
    light: { background: "#F1F8E9", backgroundSecondary: "#E8F5E9", card: "#FFF", cardBorder: "#C8E6C9", text: "#1B5E20", textSecondary: "#2E7D32", primary: "#2E7D32", primaryMuted: "#81C784", accent: "#FF8F00", accentMuted: "#FFB74D", success: "#43A047", tabBar: "#FFF", tabBarBorder: "#C8E6C9", icon: "#388E3C" },
    dark:  { background: "#121212", backgroundSecondary: "#1E1E1E", card: "#1E1E1E", cardBorder: "#2D2D2D", text: "#E8F5E9", textSecondary: "#A5D6A7", primary: "#66BB6A", primaryMuted: "#4CAF50", accent: "#FFB74D", accentMuted: "#FF8F00", success: "#66BB6A", tabBar: "#1E1E1E", tabBarBorder: "#2D2D2D", icon: "#81C784" },
  },
  blue: {
    light: { background: "#E3F2FD", backgroundSecondary: "#BBDEFB", card: "#FFF", cardBorder: "#90CAF9", text: "#0D47A1", textSecondary: "#1565C0", primary: "#1565C0", primaryMuted: "#64B5F6", accent: "#FF6F00", accentMuted: "#FFB74D", success: "#1976D2", tabBar: "#FFF", tabBarBorder: "#90CAF9", icon: "#1976D2" },
    dark:  { background: "#0D1117", backgroundSecondary: "#161B22", card: "#21262D", cardBorder: "#30363D", text: "#E6EDF3", textSecondary: "#8B949E", primary: "#58A6FF", primaryMuted: "#388BFD", accent: "#FFA657", accentMuted: "#FF8F00", success: "#3FB950", tabBar: "#161B22", tabBarBorder: "#30363D", icon: "#58A6FF" },
  },
  purple: {
    light: { background: "#F3E5F5", backgroundSecondary: "#E1BEE7", card: "#FFF", cardBorder: "#CE93D8", text: "#4A148C", textSecondary: "#6A1B9A", primary: "#7B1FA2", primaryMuted: "#BA68C8", accent: "#FF6F00", accentMuted: "#FFB74D", success: "#6A1B9A", tabBar: "#FFF", tabBarBorder: "#CE93D8", icon: "#7B1FA2" },
    dark:  { background: "#1A1A2E", backgroundSecondary: "#16213E", card: "#0F3460", cardBorder: "#533483", text: "#E8E0F0", textSecondary: "#B39DDB", primary: "#B39DDB", primaryMuted: "#9575CD", accent: "#FFB74D", accentMuted: "#FF8F00", success: "#81C784", tabBar: "#16213E", tabBarBorder: "#533483", icon: "#B39DDB" },
  },
  orange: {
    light: { background: "#FFF3E0", backgroundSecondary: "#FFE0B2", card: "#FFF", cardBorder: "#FFCC80", text: "#E65100", textSecondary: "#EF6C00", primary: "#E65100", primaryMuted: "#FF9800", accent: "#2E7D32", accentMuted: "#66BB6A", success: "#43A047", tabBar: "#FFF", tabBarBorder: "#FFCC80", icon: "#EF6C00" },
    dark:  { background: "#1C1917", backgroundSecondary: "#292524", card: "#44403C", cardBorder: "#57534E", text: "#FEF3C7", textSecondary: "#FCD34D", primary: "#FB923C", primaryMuted: "#F97316", accent: "#86EFAC", accentMuted: "#4ADE80", success: "#4ADE80", tabBar: "#292524", tabBarBorder: "#57534E", icon: "#FB923C" },
  },
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;
  colors: Colors;
  appTheme: AppThemePreset;
  setAppTheme: (t: AppThemePreset) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("system");
  const [appTheme, setAppThemeState] = useState<AppThemePreset>("green");

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(STORAGE_KEY);
        if (v === "light" || v === "dark" || v === "system") setThemeState(v);
      } catch {}
    })();
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    AsyncStorage.setItem(STORAGE_KEY, t).catch(() => {});
  };

  const setAppTheme = (t: AppThemePreset) => {
    setAppThemeState(t);
  };

  const isDark = theme === "dark" || (theme === "system" && system === "dark");
  const colors = PRESETS[appTheme][isDark ? "dark" : "light"];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, colors, appTheme, setAppTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const c = useContext(ThemeContext);
  if (!c) throw new Error("useTheme must be used within ThemeProvider");
  return c;
}
