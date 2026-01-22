import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView as RNScrollView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Preventive = { id: string; title: string; content: string; category: string | null };

const BRAIN_BALANCE_PIJLERS = [
  {
    icon: "body" as const,
    title: "Fysiek",
    text: "Beweging, sport en lichamelijke activiteit. Een actief lichaam ondersteunt een scherpe geest. Probeer dagelijks 30 minuten te bewegen - wandelen, fietsen, sporten of simpelweg dansen op je favoriete muziek. Beweging helpt niet alleen je lichaam, maar geeft ook endorfines vrij die je stemming verbeteren.",
  },
  {
    icon: "restaurant" as const,
    title: "Voeding",
    text: "Gezond en regelmatig eten. Goede voeding geeft energie en helpt je concentreren. Eet gebalanceerd met groente, fruit, volkoren producten en eiwitten. Vermijd te veel suiker en bewerkte snacks. Drink voldoende water gedurende de dag.",
  },
  {
    icon: "moon" as const,
    title: "Slaap",
    text: "Voldoende en rustgevende slaap. Slaap is essentieel voor herstel en mentale veerkracht. Streef naar 7-9 uur slaap per nacht. Creëer een vast ritme met bedtijd en opsta-tijd. Vermijd schermen een uur voor het slapengaan.",
  },
  {
    icon: "heart" as const,
    title: "Mentaal & stress",
    text: "Omgaan met druk, piekeren en emoties. Ontspanning en rustmomenten horen erbij. Probeer ademhalingsoefeningen, meditatie of journaling. Plan bewust pauzes in tijdens je dag. Praat over je gevoelens met iemand die je vertrouwt.",
  },
  {
    icon: "people" as const,
    title: "Sociaal",
    text: "Contact met anderen, vriendschappen en steun. Een goed netwerk geeft houvast. Bel een vriend, spreek af met klasgenoten of doe mee aan groepsactiviteiten. Deel je gedachten en ervaringen - verbinding helpt echt.",
  },
];

export default function HulpTab() {
  const { colors } = useTheme();
  const [preventive, setPreventive] = useState<Preventive[]>([]);
  const [preventiveLoading, setPreventiveLoading] = useState(true);

  // Modal state voor pijler details
  const [pillarModal, setPillarModal] = useState<{
    title: string;
    text: string;
  } | null>(null);

  const loadPreventive = useCallback(async () => {
    const { data } = await supabase
      .from("preventive_content")
      .select("id, title, content, category")
      .order("sort_order", { ascending: true });
    setPreventive((data as Preventive[]) || []);
    setPreventiveLoading(false);
  }, []);

  useEffect(() => {
    loadPreventive();
  }, [loadPreventive]);

  const openPillarModal = (title: string, text: string) => {
    setPillarModal({ title, text });
  };

  const cardStyle = {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Brain Balance-pijlers
        </Text>
        <Text style={[styles.intro, { color: colors.textSecondary }]}>
          Deze vijf pijlers vormen de basis voor een goede balans tussen hoofd en
          lichaam. Tik op een pijler voor meer informatie.
        </Text>
        {BRAIN_BALANCE_PIJLERS.map((p) => (
          <TouchableOpacity
            key={p.title}
            style={[styles.pillarCard, cardStyle]}
            onPress={() => openPillarModal(p.title, p.text)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={p.icon} size={26} color={colors.primary} />
            </View>
            <View style={styles.pillarText}>
              <Text style={[styles.pillarTitle, { color: colors.text }]}>
                {p.title}
              </Text>
              <Text
                style={[styles.cardTextShort, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {p.text.split('.')[0] + '.'}
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={colors.primary}
              />
            </View>
          </TouchableOpacity>
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
            <Ionicons name="shield-checkmark" size={26} color={colors.icon} />
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>
              Er is nog geen extra ondersteuning toegevoegd. Vraag hulp bij je
              vertrouwenspersoon of mentor.
            </Text>
          </View>
        ) : (
          preventive.map((p) => (
            <View key={p.id} style={[styles.pillarCard, cardStyle]}>
              <Ionicons name="heart" size={26} color={colors.primary} />
              <View style={styles.pillarText}>
                <Text style={[styles.pillarTitle, { color: colors.text }]}>
                  {p.title}
                </Text>
                <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                  {p.content}
                </Text>
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
          <Ionicons name="link" size={26} color={colors.icon} />
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
          <Ionicons name="chatbubbles" size={26} color={colors.icon} />
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            Communicatiekanalen en algemene informatie over Ma-Fit.
          </Text>
        </View>
      </View>

      <Modal
        visible={!!pillarModal}
        transparent
        animationType="slide"
        onRequestClose={() => setPillarModal(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlayFull}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setPillarModal(null)}
          />
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {pillarModal?.title}
              </Text>
              <TouchableOpacity
                onPress={() => setPillarModal(null)}
                hitSlop={12}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <RNScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.modalText, { color: colors.text }]}>
                {pillarModal?.text}
              </Text>
            </RNScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 36, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  intro: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  pillarCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "rgba(59,130,246,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  pillarText: { flex: 1 },
  pillarTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  cardTextShort: { fontSize: 15, lineHeight: 22 },
  cardText: { fontSize: 15, lineHeight: 22 },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  modalOverlayFull: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    marginTop: "15%",
    marginHorizontal: 16,
    borderRadius: 20,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: { flex: 1 },
  modalContentContainer: {
    padding: 20,
    paddingTop: 8,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
