import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function BewegenTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stappenteller</Text>
        <View style={styles.card}>
          <Ionicons name="phone-portrait" size={22} color="#666" />
          <Text style={styles.cardText}>
            Stappen via je telefoon. Zet bewegingsrechten aan voor nauwkeurige
            telling.
          </Text>
        </View>
        <View style={[styles.card, { marginTop: 8 }]}>
          <Ionicons name="watch" size={22} color="#666" />
          <Text style={styles.cardText}>
            Stappen via je horloge. Koppel je Apple Watch voor automatische
            sync.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pedometer</Text>
        <View style={styles.card}>
          <Ionicons name="walk" size={22} color="#666" />
          <Text style={styles.cardText}>
            Een pedometer die gekoppeld kan worden met je Apple Watch. Houd je
            dagelijkse beweging eenvoudig bij.
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
