import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

type Challenge = { id: string; title: string; description: string | null; image_url: string | null; points: number; start_date: string | null; end_date: string | null };

export default function ChallengesTab() {
  const { colors } = useTheme();
  const [list, setList] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("challenges").select("id, title, description, image_url, points, start_date, end_date").order("created_at", { ascending: false });
    setList((data as Challenge[]) || []);
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const cardStyle = { backgroundColor: colors.card, borderColor: colors.cardBorder };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Challenges</Text>
      <Text style={[styles.intro, { color: colors.textSecondary }]}>Challenges worden door een beheerder via het CMS toegevoegd. Doe mee en verdien punten en badges.</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
      ) : list.length === 0 ? (
        <View style={[styles.card, cardStyle]}>
          <Ionicons name="trophy" size={28} color={colors.accent} />
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>Er staan nog geen challenges voor je klaar. Check later opnieuw.</Text>
        </View>
      ) : (
        list.map((c) => (
          <View key={c.id} style={[styles.challenge, cardStyle]}>
            {c.image_url ? <Image source={{ uri: c.image_url }} style={styles.chImg} resizeMode="cover" /> : null}
            <Text style={[styles.chTitle, { color: colors.text }]}>{c.title}</Text>
            {c.description ? <Text style={[styles.chDesc, { color: colors.textSecondary }]}>{c.description}</Text> : null}
            {c.points > 0 ? <Text style={[styles.chPoints, { color: colors.accent }]}>{c.points} punten</Text> : null}
          </View>
        ))
      )}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Gamification</Text>
      <View style={[styles.card, cardStyle]}>
        <Ionicons name="star" size={22} color={colors.icon} />
        <Text style={[styles.cardText, { color: colors.textSecondary }]}>Punten – verdien bij challenges</Text>
      </View>
      <View style={[styles.card, { ...cardStyle, marginTop: 8 }]}>
        <Ionicons name="medal" size={22} color={colors.icon} />
        <Text style={[styles.cardText, { color: colors.textSecondary }]}>Badges – ontgrendel prestaties</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 36, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  challenge: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, overflow: "hidden" },
  chImg: { width: "100%", height: 140, borderRadius: 8, marginBottom: 10 },
  chTitle: { fontSize: 16, fontWeight: "600" },
  chDesc: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  chPoints: { fontSize: 13, marginTop: 6, fontWeight: "600" },
  card: { borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 12, borderWidth: 1 },
  cardText: { flex: 1, fontSize: 14, lineHeight: 22 },
});
