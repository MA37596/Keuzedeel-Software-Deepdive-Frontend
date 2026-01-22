import { uploadAvatar } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type AppThemePreset = "green" | "blue" | "purple" | "orange";
const THEME_OPTIONS: { id: AppThemePreset; label: string }[] = [
  { id: "green", label: "Groen" },
  { id: "blue", label: "Blauw" },
  { id: "purple", label: "Paars" },
  { id: "orange", label: "Oranje" },
];

export default function ProfileScreen() {
  const { colors, isDark, setTheme, appTheme, setAppTheme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [klas, setKlas] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("display_name, klas, avatar_url, app_theme").eq("id", user.id).single();
      if (profile) {
        setDisplayName(profile.display_name || "");
        setKlas(profile.klas || "");
        setAvatarUrl(profile.avatar_url || null);
        const t = profile.app_theme as AppThemePreset;
        if (t && THEME_OPTIONS.some((o) => o.id === t)) setAppTheme(t);
      } else {
        setDisplayName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [setAppTheme]);

  useEffect(() => { load(); }, [load]);

  const saveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await supabase.from("profiles").upsert({ id: userId, display_name: displayName.trim() || null, klas: klas.trim() || null, updated_at: new Date().toISOString() }, { onConflict: "id" });
      Alert.alert("Opgeslagen", "Je gegevens zijn bijgewerkt.");
    } catch (e: any) {
      Alert.alert("Fout", e?.message || "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const pickAndUploadAvatar = async () => {
    if (!userId) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Toestemming", "Toegang tot de galerij is nodig voor een profielfoto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1] });
    if (result.canceled || !result.assets[0]) return;
    setSaving(true);
    try {
      const url = await uploadAvatar(userId, result.assets[0].uri);
      await supabase.from("profiles").update({ avatar_url: url, updated_at: new Date().toISOString() }).eq("id", userId);
      setAvatarUrl(url);
    } catch (e: any) {
      Alert.alert("Fout", e?.message || "Upload mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const changeAppTheme = async (t: AppThemePreset) => {
    if (!userId) return;
    setAppTheme(t);
    try {
      await supabase.from("profiles").update({ app_theme: t, updated_at: new Date().toISOString() }).eq("id", userId);
    } catch {}
  };


  // hier wordt wachtwoord gewijzigd, als pw niet gelijk = aan pwconfirm dan Fout", "Nieuw wachtwoord en bevestiging komen niet overeen.""
  const changePassword = async () => {
    if (!pwNew || pwNew.length < 6) {
      Alert.alert("Fout", "Nieuw wachtwoord moet minstens 6 tekens zijn.");
      return;
    }
    if (pwNew !== pwConfirm) {
      Alert.alert("Fout", "Nieuw wachtwoord en bevestiging komen niet overeen.");
      return;
    }
    setPwSaving(true);
    try {
      await supabase.auth.updateUser({ password: pwNew });
      Alert.alert("Gelukt", "Wachtwoord is gewijzigd.");
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
    } catch (e: any) {
      Alert.alert("Fout", e?.message || "Wachtwoord wijzigen mislukt.");
    } finally {
      setPwSaving(false);
    }
  };


  // hier 
  const handleLogout = () => {
    Alert.alert("Uitloggen", "Weet je het zeker?", [
      { text: "Annuleren", style: "cancel" },
      { text: "Uitloggen", style: "destructive", onPress: async () => { await supabase.auth.signOut(); router.replace("/"); } },
    ]);
  };

  const dynamic = { container: { backgroundColor: colors.background }, card: { backgroundColor: colors.card, borderColor: colors.cardBorder }, text: { color: colors.text }, text2: { color: colors.textSecondary }, btnDanger: { backgroundColor: "#C62828" } };

  if (loading) {
    return (
      <View style={[styles.centered, dynamic.container]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }


  // alles hier onderin is de styling 
  return (
    <ScrollView style={[styles.container, dynamic.container]} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={pickAndUploadAvatar} disabled={saving} style={styles.avatarTouch}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="person" size={48} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.changePhoto, { color: colors.primary }]}>Foto wijzigen</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, dynamic.card]}>
        <Text style={[styles.label, dynamic.text]}>Naam</Text>
        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.backgroundSecondary }]} value={displayName} onChangeText={setDisplayName} placeholder="Je weergavenaam" placeholderTextColor={colors.textSecondary} selectionColor={colors.primary} underlineColorAndroid="transparent" />
      </View>
      <View style={[styles.card, dynamic.card]}>
        <Text style={[styles.label, dynamic.text]}>Klas</Text>
        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.backgroundSecondary }]} value={klas} onChangeText={setKlas} placeholder="bijv. 3A" placeholderTextColor={colors.textSecondary} selectionColor={colors.primary} underlineColorAndroid="transparent" />
      </View>
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={saveProfile} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? "Bezig…" : "Opslaan"}</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, dynamic.text]}>App-kleur</Text>
      <View style={styles.themeRow}>
        {THEME_OPTIONS.map((o) => (
          <TouchableOpacity key={o.id} onPress={() => changeAppTheme(o.id)} style={[styles.themeBtn, dynamic.card, appTheme === o.id && { borderWidth: 3, borderColor: colors.primary }]}>
            <Text style={[styles.themeBtnText, dynamic.text]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, dynamic.text]}>Wachtwoord wijzigen</Text>
      <View style={[styles.card, dynamic.card]}>
        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.backgroundSecondary }]} value={pwNew} onChangeText={setPwNew} placeholder="Nieuw wachtwoord" placeholderTextColor={colors.textSecondary} secureTextEntry selectionColor={colors.primary} underlineColorAndroid="transparent" />
        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.backgroundSecondary, marginTop: 8 }]} value={pwConfirm} onChangeText={setPwConfirm} placeholder="Bevestig nieuw wachtwoord" placeholderTextColor={colors.textSecondary} secureTextEntry selectionColor={colors.primary} underlineColorAndroid="transparent" />
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, marginTop: 8 }]} onPress={changePassword} disabled={pwSaving}>
          <Text style={styles.buttonText}>{pwSaving ? "Bezig…" : "Wachtwoord wijzigen"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, dynamic.text]}>Weergave</Text>
      <View style={[styles.card, dynamic.card]}>
        <View style={styles.settingRow}>
          <Ionicons name="moon" size={22} color={colors.icon} />
          <Text style={[styles.rowText, dynamic.text]}>Donkere modus</Text>
          <Switch value={isDark} onValueChange={(v) => setTheme(v ? "dark" : "light")} trackColor={{ false: colors.cardBorder, true: colors.primaryMuted }} thumbColor={isDark ? colors.primary : "#f4f3f4"} />
        </View>
      </View>

      <TouchableOpacity style={[styles.button, dynamic.btnDanger]} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#FFF" />
        <Text style={styles.buttonText}>Uitloggen</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 36, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarTouch: { alignItems: "center" },
  avatar: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center" },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  changePhoto: { marginTop: 8, fontSize: 14, fontWeight: "600" },
  card: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8, marginTop: 16 },
  themeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  themeBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  themeBtnText: { fontSize: 14, fontWeight: "600" },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowText: { fontSize: 16, fontWeight: "600" },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 12, marginTop: 8, gap: 8 },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
