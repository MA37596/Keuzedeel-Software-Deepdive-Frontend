import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function CheckInTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wekelijkse check-in</Text>
        <View style={styles.card}>
          <Ionicons name="calendar" size={22} color="#666" />
          <Text style={styles.cardText}>
            Doe wekelijks een korte check-in om je voortgang en stemming bij te
            houden.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reflectie</Text>
        <View style={styles.card}>
          <Ionicons name="create" size={22} color="#666" />
          <Text style={styles.cardText}>
            Neem de tijd om te reflecteren op je week. Wat ging goed? Wat wil je
            anders?
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notities</Text>
        <View style={styles.card}>
          <Ionicons name="document-text" size={22} color="#666" />
          <Text style={styles.cardText}>
            Bewaar hier notities en gedachten voor jezelf.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  content: { padding: 16, paddingBottom: 32 },
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
  cardText: { flex: 1, fontSize: 14, color: "#555", lineHeight: 20 },
});
