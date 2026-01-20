import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [faqVisible, setFaqVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Fout", "Vul alstublieft e-mail en wachtwoord in");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert("Inlogfout", error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        router.replace("/welcome");
      }
    } catch (error: any) {
      Alert.alert("Fout", error.message || "Er is een fout opgetreden");
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailAddress = "wachtwoordvergeten.mediacollege@gmail.com";
    const subject = "Wachtwoord vergeten - Ma-Fit";
    const body = "Beste beheerder,\n\nIk ben mijn wachtwoord vergeten en zou graag een nieuw wachtwoord willen aanvragen.\n\nMet vriendelijke groet";
    
    const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        console.log("Kan e-mail app niet openen");
      }
    } catch (error) {
      console.error("Fout bij openen van e-mail app:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Ma-Fit Login</Text>
        <Text style={styles.subtitle}>Welkom terug!</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Jouw-mail@mediacollege.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Wachtwoord</Text>
            <TextInput
              style={styles.input}
              placeholder="Jouw Wachtwoord"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>Wachtwoord vergeten?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Inloggen</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.faqButton}
        onPress={() => setFaqVisible(true)}
      >
        <Ionicons name="help-circle" size={24} color="#000000" />
      </TouchableOpacity>

      <Modal
        visible={faqVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFaqVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Veelgestelde Vragen</Text>
              <TouchableOpacity
                onPress={() => setFaqVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.faqContent}>
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>
                  Hoe log ik in op Ma-Fit?
                </Text>
                <Text style={styles.faqAnswer}>
                  Gebruik je MediaCollege e-mailadres en wachtwoord om in te loggen. Indien je geen inloggegevens hebt neem contact op met Beheerder.mediacollege@gmail.com
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>
                  Wat moet ik doen als ik mijn wachtwoord ben vergeten?
                </Text>
                <Text style={styles.faqAnswer}>
                  Neem contact met ons op door wachtwoordvergeten.mediacollege@gmail.com.
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>
                  Kan ik mijn account op meerdere apparaten gebruiken?
                </Text>
                <Text style={styles.faqAnswer}>
                  Ja, je kunt op meerdere apparaten inloggen met hetzelfde
                  account. Zorg ervoor dat je veilig uitlogt op gedeelde
                  apparaten.
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>
                  Waarom kan ik niet inloggen?
                </Text>
                <Text style={styles.faqAnswer}>
                  Controleer of je e-mailadres en wachtwoord correct zijn. Zorg
                  ervoor dat je een actieve internetverbinding hebt. Als het
                  probleem aanhoudt, neem contact op met de helpdesk. 
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>
                  Is mijn data veilig?
                </Text>
                <Text style={styles.faqAnswer}>
                  Ja, we gebruiken beveiligde verbindingen en volgen de
                  privacyrichtlijnen van MediaCollege. Je gegevens worden
                  versleuteld opgeslagen en verzonden. Wachtwoorden zijn gehashed en alle informatie die gedeeld wordt op de app is anoniem indien gewenst.
                </Text>
              </View>
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>
                  Is mijn data veilig?
                </Text>
                <Text style={styles.faqAnswer}>
                  Ja, we gebruiken beveiligde verbindingen en volgen de
                  privacyrichtlijnen van MediaCollege. Je gegevens worden
                  versleuteld opgeslagen en verzonden. Wachtwoorden zijn gehashed en alle informatie die gedeeld wordt op de app is anoniem indien gewenst.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#000000",
    textDecorationLine: "underline",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  button: {
    backgroundColor: "#000000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  faqButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  closeButton: {
    padding: 4,
  },
  faqContent: {
    padding: 20,
  },
  faqItem: {
    marginBottom: 24,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});
