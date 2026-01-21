import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

type Preventive = { id: string; title: string; content: string; category: string | null };

const BRAIN_BALANCE_PIJLERS = [
  { icon: "body" as const, title: "Fysiek", text: "Beweging, sport en lichamelijke activiteit. Een actief lichaam ondersteunt een scherpe geest." },
  { icon: "restaurant" as const, title: "Voeding", text: "Gezond en regelmatig eten. Goede voeding geeft energie en helpt je concentreren." },
  { icon: "moon" as const, title: "Slaap", text: "Voldoende en rustgevende slaap. Slaap is essentieel voor herstel en mentale veerkracht." },
  { icon: "heart" as const, title: "Mentaal & stress", text: "Omgaan met druk, piekeren en emoties. Ontspanning en rustmomenten horen erbij." },
  { icon: "people" as const, title: "Sociaal", text: "Contact met anderen, vriendschappen en steun. Een goed netwerk geeft houvast." },
];

export default function HulpTab() {
  const { colors } = useTheme();
  const [preventive, setPreventive] = useState<Preventive[]>([]);
  const [preventiveLoading, setPreventiveLoading] = useState(true);

  const loadPreventive = useCallback(async () => {
    const { data } = await supabase.from("preventive_content").select("id, title, content, category").order("sort_order", { ascending: true });
    setPreventive((data as Preventive[]) || []);
    setPreventiveLoading(false);
  }, []);

  useEffect(() => { loadPreventive(); }, [loadPreventive]);

  const cardStyle = { backgroundColor: colors.card, borderColor: colors.cardBorder };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Brain Balance-pijlers
        </Text>
        <Text style={[styles.intro, { color: colors.textSecondary }]}>
          Deze vijf pijlers vormen de basis voor een goede balans tussen hoofd
          en lichaam. Werk er dagelijks aan, in kleine stappen.
        </Text>
        {BRAIN_BALANCE_PIJLERS.map((p) => (
          <View key={p.title} style={[styles.pillarCard, cardStyle]}>
            <Ionicons name={p.icon} size={22} color={colors.primary} />
            <View style={styles.pillarText}>
              <Text style={[styles.pillarTitle, { color: colors.text }]}>{p.title}</Text>
              <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                {p.text}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Preventieve ondersteuning
        </Text>
        <Text style={[styles.intro, { color: colors.textSecondary }]}>
          Informatie die kan helpen als je het mentaal even zwaar hebt.
        </Text>
        {preventiveLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
        ) : preventive.length === 0 ? (
          <View style={[styles.card, cardStyle]}>
            <Ionicons name="shield-checkmark" size={22} color={colors.icon} />
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>Er is nog geen extra ondersteuning toegevoegd. Vraag hulp bij je vertrouwenspersoon of mentor.</Text>
          </View>
        ) : (
          preventive.map((p) => (
            <View key={p.id} style={[styles.pillarCard, cardStyle]}>
              <Ionicons name="heart" size={22} color={colors.primary} />
              <View style={styles.pillarText}>
                <Text style={[styles.pillarTitle, { color: colors.text }]}>{p.title}</Text>
                <Text style={[styles.cardText, { color: colors.textSecondary }]}>{p.content}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Links naar hulpverleners
        </Text>
        <View style={[styles.card, cardStyle]}>
          <Ionicons name="link" size={22} color={colors.icon} />
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            Handige links naar hulpverleners en ondersteuning wanneer je die
            nodig hebt.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Communicatie / info
        </Text>
        <View style={[styles.card, cardStyle]}>
          <Ionicons name="chatbubbles" size={22} color={colors.icon} />
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            Communicatiekanalen en algemene informatie over Ma-Fit.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 36, paddingBottom: 40 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  pillarCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  pillarText: { flex: 1 },
  pillarTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  card: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
  },
  cardText: { fontSize: 14, lineHeight: 22 },
});
