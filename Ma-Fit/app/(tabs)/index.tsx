import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const QUOTES = [
  "Een gezonde geest in een gezond lichaam.",
  "Kleine stappen leiden tot grote veranderingen.",
  "Vandaag is de beste dag om te beginnen.",
];

export default function HomeTab() {
  const [userName, setUserName] = useState<string>("");
  const [klas, setKlas] = useState<string>("–");
  const [loading, setLoading] = useState(true);
  const [quote] = useState(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)]
  );

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name =
            (user.user_metadata?.full_name as string) ||
            (user.user_metadata?.name as string) ||
            (user.email ? user.email.split("@")[0] : "Gebruiker");
          setUserName(name);
          setKlas((user.user_metadata?.klas as string) || "–");
        }
      } catch {
        setUserName("Gebruiker");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hallo, {userName}</Text>
        <Text style={styles.klas}>Klas: {klas}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quotes & weetjes</Text>
        <View style={styles.card}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#666" />
          <Text style={styles.quote}>{quote}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dagelijkse motivatie</Text>
        <View style={styles.card}>
          <Ionicons name="flash" size={20} color="#666" />
          <Text style={styles.cardText}>
            Hier komt je dagelijkse motivatie. Blijf in beweging en focus op
            kleine winsten.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Korte status / voortgang</Text>
        <View style={styles.card}>
          <Ionicons name="trending-up" size={20} color="#666" />
          <Text style={styles.cardText}>
            Je voortgang en status verschijnen hier. Check-in wekelijks voor het
            beste overzicht.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: "bold", color: "#000" },
  klas: { fontSize: 14, color: "#666", marginTop: 4 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  quote: { flex: 1, fontSize: 15, color: "#333", fontStyle: "italic" },
  cardText: { flex: 1, fontSize: 14, color: "#555", lineHeight: 20 },
});
