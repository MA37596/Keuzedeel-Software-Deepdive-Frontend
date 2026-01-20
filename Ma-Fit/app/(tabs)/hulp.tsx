import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function HulpTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Brain Balance-pijlers</Text>
        <View style={styles.card}>
          <Ionicons name="bulb" size={22} color="#666" />
          <Text style={styles.cardText}>
            Informatie over de Brain Balance-pijlers en hoe je ze inzet voor
            balans en welzijn.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preventieve ondersteuning</Text>
        <View style={styles.card}>
          <Ionicons name="shield-checkmark" size={22} color="#666" />
          <Text style={styles.cardText}>
            Tips en tools voor preventieve ondersteuning van je mentale en
            fysieke gezondheid.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Links naar hulpverleners</Text>
        <View style={styles.card}>
          <Ionicons name="link" size={22} color="#666" />
          <Text style={styles.cardText}>
            Handige links naar hulpverleners en ondersteuning wanneer je die
            nodig hebt.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Communicatie / info</Text>
        <View style={styles.card}>
          <Ionicons name="chatbubbles" size={22} color="#666" />
          <Text style={styles.cardText}>
            Communicatiekanalen en algemene informatie over Ma-Fit.
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
