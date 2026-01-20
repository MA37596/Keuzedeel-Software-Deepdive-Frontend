import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ChallengesTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Challenges</Text>
        <View style={styles.card}>
          <Ionicons name="trophy" size={22} color="#666" />
          <Text style={styles.cardText}>
            Neem deel aan challenges en blijf gemotiveerd. Werk aan doelen met
            anderen.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gamification</Text>
        <View style={styles.card}>
          <Ionicons name="star" size={22} color="#666" />
          <Text style={styles.cardText}>Punten</Text>
        </View>
        <View style={[styles.card, { marginTop: 8 }]}>
          <Ionicons name="medal" size={22} color="#666" />
          <Text style={styles.cardText}>Badges</Text>
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
