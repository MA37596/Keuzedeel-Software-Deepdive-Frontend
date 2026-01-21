import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pedometer } from "expo-sensors";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function BewegenTab() {
  const { colors } = useTheme();
  const [userId, setUserId] = useState<string | null>(null);
  const [stepsSession, setStepsSession] = useState(0);
  const [sessionAtLastSave, setSessionAtLastSave] = useState(0);
  const [stepsToday, setStepsToday] = useState<number | null>(null);
  const [stepsWeek, setStepsWeek] = useState<number | null>(null);
  const [stepsMonth, setStepsMonth] = useState<number | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFromDb = useCallback(async (uid: string) => {
    const today = todayISO();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);
    const { data: rows } = await supabase.from("steps").select("date, steps").eq("user_id", uid).gte("date", monthStart.toISOString().slice(0, 10));
    const byDate = new Map((rows || []).map((r) => [r.date, r.steps]));
    const todayDb = byDate.get(today) ?? 0;
    setStepsToday(todayDb);
    let w = 0, m = 0;
    byDate.forEach((s, d) => {
      if (d >= weekStart.toISOString().slice(0, 10)) w += s;
      m += s;
    });
    setStepsWeek(w);
    setStepsMonth(m);
  }, []);

  const fetchFromDeviceAndPersist = useCallback(async (uid: string) => {
    const today = todayISO();
    let toSave = 0;
    if (Platform.OS === "ios" && available) {
      try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const res = await Pedometer.getStepCountAsync(start, new Date());
        toSave = res.steps;
        setStepsToday(toSave);
      } catch { toSave = (stepsToday ?? 0) + Math.max(0, stepsSession - sessionAtLastSave); }
    } else {
      const delta = Math.max(0, stepsSession - sessionAtLastSave);
      toSave = (stepsToday ?? 0) + delta;
      setStepsToday(toSave);
      setSessionAtLastSave(stepsSession);
    }
    if (toSave >= 0) {
      await supabase.from("steps").upsert({ user_id: uid, date: today, steps: toSave, updated_at: new Date().toISOString() }, { onConflict: "user_id,date" });
    }
    await fetchFromDb(uid);
  }, [available, stepsToday, stepsSession, sessionAtLastSave, fetchFromDb]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await fetchFromDeviceAndPersist(user.id);
    }
    setRefreshing(false);
  }, [fetchFromDeviceAndPersist]);

  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
        const isAvail = await Pedometer.isAvailableAsync();
        setAvailable(isAvail);
        if (!isAvail) { setLoading(false); return; }
        try {
          const perm = await Pedometer.requestPermissionsAsync();
          if (perm?.status === "denied") {
            Alert.alert("Toestemming", "Bewegingsrechten zijn nodig voor de stappenteller.");
            setLoading(false);
            return;
          }
        } catch {}
        sub = Pedometer.watchStepCount((r) => setStepsSession(r.steps));
        if (user) await fetchFromDb(user.id);
      } catch { setAvailable(false); }
      finally { setLoading(false); }
    })();
    return () => { if (sub?.remove) sub.remove(); };
  }, [fetchFromDb]);

  useEffect(() => {
    if (!userId || !available) return;
    const t = setInterval(() => { fetchFromDeviceAndPersist(userId); }, 60000);
    return () => clearInterval(t);
  }, [userId, available, fetchFromDeviceAndPersist]);

  const cardStyle = { backgroundColor: colors.card, borderColor: colors.cardBorder };
  const sessionDelta = Math.max(0, stepsSession - sessionAtLastSave);
  const displayToday = (stepsToday ?? 0) + (Platform.OS === "android" ? sessionDelta : 0);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Stappen</Text>
        {available ? (
          <>
            <View style={[styles.stepsCard, cardStyle]}>
              <Ionicons name="walk" size={32} color={colors.primary} />
              <View>
                <Text style={[styles.bigNumber, { color: colors.primary }]}>{displayToday}</Text>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Vandaag</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.smallCard, cardStyle]}>
                <Text style={[styles.smallNumber, { color: colors.text }]}>{stepsWeek ?? 0}</Text>
                <Text style={[styles.smallLabel, { color: colors.textSecondary }]}>Deze week</Text>
              </View>
              <View style={[styles.smallCard, cardStyle]}>
                <Text style={[styles.smallNumber, { color: colors.text }]}>{stepsMonth ?? 0}</Text>
                <Text style={[styles.smallLabel, { color: colors.textSecondary }]}>Deze maand</Text>
              </View>
            </View>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>Trek naar beneden om te verversen. Op Android tellen we stappen zolang de app open is.</Text>
          </>
        ) : (
          <View style={[styles.card, cardStyle]}>
            <Ionicons name="warning" size={22} color={colors.accent} />
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>De stappenteller is op dit apparaat niet beschikbaar.</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Stappenteller</Text>
        <View style={[styles.card, cardStyle]}>
          <Ionicons name="phone-portrait" size={22} color={colors.icon} />
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>Stappen via je telefoon. Zet bewegingsrechten aan.</Text>
        </View>
        <View style={[styles.card, { ...cardStyle, marginTop: 8 }]}>
          <Ionicons name="watch" size={22} color={colors.icon} />
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>Koppel je Apple Watch voor automatische sync via Health op iOS.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 36, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  stepsCard: { flexDirection: "row", alignItems: "center", gap: 16, borderRadius: 12, padding: 20, borderWidth: 1 },
  bigNumber: { fontSize: 28, fontWeight: "bold" },
  label: { fontSize: 14, marginTop: 2 },
  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  smallCard: { flex: 1, borderRadius: 12, padding: 16, borderWidth: 1 },
  smallNumber: { fontSize: 20, fontWeight: "bold" },
  smallLabel: { fontSize: 12, marginTop: 2 },
  hint: { fontSize: 12, marginTop: 12, lineHeight: 18 },
  card: { borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 12, borderWidth: 1 },
  cardText: { flex: 1, fontSize: 14, lineHeight: 22 },
});
