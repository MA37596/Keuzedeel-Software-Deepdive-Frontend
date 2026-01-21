import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Note = { id: string; content: string; created_at: string };

export default function CheckInTab() {
  const { colors } = useTheme();
  const [userId, setUserId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [noteModal, setNoteModal] = useState<"off" | "new" | "edit">("off");
  const [noteContent, setNoteContent] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [reflectModal, setReflectModal] = useState(false);
  const [mood, setMood] = useState(3);
  const [whatWentWell, setWhatWentWell] = useState("");
  const [whatToImprove, setWhatToImprove] = useState("");
  const [extra, setExtra] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reflectSaving, setReflectSaving] = useState(false);

  const loadNotes = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await supabase.from("notes").select("id, content, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
    setNotes(data || []);
    setNotesLoading(false);
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const openNewNote = () => { setNoteId(null); setNoteContent(""); setNoteModal("new"); };
  const openEditNote = (n: Note) => { setNoteId(n.id); setNoteContent(n.content); setNoteModal("edit"); };

  const saveNote = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      if (noteModal === "new") {
        await supabase.from("notes").insert({ user_id: userId, content: noteContent.trim() || "(Lege notitie)" });
      } else if (noteId) {
        await supabase.from("notes").update({ content: noteContent.trim() || "(Lege notitie)", updated_at: new Date().toISOString() }).eq("id", noteId);
      }
      setNoteModal("off");
      loadNotes();
    } catch (e: any) {
      Alert.alert("Fout", e?.message || "Opslaan mislukt.");
    } finally { setSaving(false); }
  };

  const deleteNote = (id: string) => {
    Alert.alert("Verwijderen", "Weet je het zeker?", [
      { text: "Nee", style: "cancel" },
      { text: "Ja", style: "destructive", onPress: async () => {
        await supabase.from("notes").delete().eq("id", id);
        loadNotes();
        if (noteModal === "edit" && noteId === id) setNoteModal("off");
      }},
    ]);
  };

  const submitReflect = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setReflectSaving(true);
    try {
      await supabase.from("reflections").insert({
        user_id: user.id,
        is_anonymous: isAnonymous,
        mood,
        what_went_well: whatWentWell.trim() || null,
        what_to_improve: whatToImprove.trim() || null,
        extra: extra.trim() || null,
      });
      setReflectModal(false);
      setMood(3); setWhatWentWell(""); setWhatToImprove(""); setExtra(""); setIsAnonymous(false);
      Alert.alert("Bedankt", "Je reflectie is opgeslagen. Een beheerder kan de statistieken inzien.");
    } catch (e: any) {
      Alert.alert("Fout", e?.message || "Opslaan mislukt.");
    } finally { setReflectSaving(false); }
  };

  const cardStyle = { backgroundColor: colors.card, borderColor: colors.cardBorder };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Wekelijkse check-in</Text>
        <View style={[styles.card, cardStyle]}>
          <Ionicons name="calendar" size={22} color={colors.icon} />
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>Doe wekelijks een korte check-in om je voortgang en stemming bij te houden.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reflectie</Text>
        <View style={[styles.card, cardStyle]}>
          <Ionicons name="create" size={22} color={colors.icon} />
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>Neem de tijd om te reflecteren op je week. Wat ging goed? Wat wil je anders?</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setReflectModal(true)}>
            <Text style={styles.btnText}>Invullen</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notities</Text>
          <TouchableOpacity onPress={openNewNote} style={[styles.addBtn, { borderColor: colors.primary }]}>
            <Ionicons name="add" size={20} color={colors.primary} />
            <Text style={[styles.addBtnText, { color: colors.primary }]}>Nieuwe notitie</Text>
          </TouchableOpacity>
        </View>
        {notesLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
        ) : notes.length === 0 ? (
          <View style={[styles.card, cardStyle]}>
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>Nog geen notities. Maak er een met de knop hierboven.</Text>
          </View>
        ) : (
          notes.map((n) => (
            <TouchableOpacity key={n.id} onPress={() => openEditNote(n)} style={[styles.noteCard, cardStyle]}>
              <Text style={[styles.notePreview, { color: colors.text }]} numberOfLines={2}>{n.content}</Text>
              <Text style={[styles.noteDate, { color: colors.textSecondary }]}>{new Date(n.created_at).toLocaleDateString("nl-NL")}</Text>
              <TouchableOpacity onPress={() => deleteNote(n.id)} hitSlop={8} style={styles.delBtn}>
                <Ionicons name="trash-outline" size={18} color="#C62828" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Modals */}
      <Modal visible={noteModal !== "off"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{noteModal === "new" ? "Nieuwe notitie" : "Notitie bewerken"}</Text>
            <TextInput style={[styles.textArea, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.backgroundSecondary }]} value={noteContent} onChangeText={setNoteContent} placeholder="Schrijf hier…" placeholderTextColor={colors.textSecondary} multiline numberOfLines={4} selectionColor={colors.primary} underlineColorAndroid="transparent" />
            <View style={styles.modalRow}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.cardBorder }]} onPress={() => setNoteModal("off")}><Text style={[styles.btnText, { color: colors.text }]}>Annuleren</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={saveNote} disabled={saving}><Text style={styles.btnText}>{saving ? "Bezig…" : "Opslaan"}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={reflectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Reflectie invullen</Text>
              <Text style={[styles.label, { color: colors.text }]}>Hoe voel je je? (1=slecht, 5=fantastisch)</Text>
              <View style={styles.moodRow}>
                {[1,2,3,4,5].map((i) => (
                  <TouchableOpacity key={i} onPress={() => setMood(i)} style={[styles.moodBtn, { backgroundColor: mood === i ? colors.primary : colors.backgroundSecondary }]}>
                    <Text style={[styles.moodBtnText, { color: mood === i ? "#FFF" : colors.text }]}>{i}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.label, { color: colors.text }]}>Wat ging goed?</Text>
              <TextInput style={[styles.textArea, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.backgroundSecondary }]} value={whatWentWell} onChangeText={setWhatWentWell} placeholder="…" placeholderTextColor={colors.textSecondary} multiline selectionColor={colors.primary} underlineColorAndroid="transparent" />
              <Text style={[styles.label, { color: colors.text }]}>Wat wil je anders?</Text>
              <TextInput style={[styles.textArea, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.backgroundSecondary }]} value={whatToImprove} onChangeText={setWhatToImprove} placeholder="…" placeholderTextColor={colors.textSecondary} multiline selectionColor={colors.primary} underlineColorAndroid="transparent" />
              <Text style={[styles.label, { color: colors.text }]}>Extra (optioneel)</Text>
              <TextInput style={[styles.textArea, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.backgroundSecondary }]} value={extra} onChangeText={setExtra} placeholder="…" placeholderTextColor={colors.textSecondary} multiline selectionColor={colors.primary} underlineColorAndroid="transparent" />
              <TouchableOpacity onPress={() => setIsAnonymous(!isAnonymous)} style={styles.anonRow}>
                <Ionicons name={isAnonymous ? "checkbox" : "square-outline"} size={24} color={colors.primary} />
                <Text style={[styles.anonLabel, { color: colors.text }]}>Anoniem invullen (beheerder ziet dan geen naam)</Text>
              </TouchableOpacity>
              <View style={styles.modalRow}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.cardBorder }]} onPress={() => setReflectModal(false)}><Text style={[styles.btnText, { color: colors.text }]}>Annuleren</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={submitReflect} disabled={reflectSaving}><Text style={styles.btnText}>{reflectSaving ? "Bezig…" : "Versturen"}</Text></TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 36, paddingBottom: 40 },
  section: { marginBottom: 20 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap" },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 8 },
  addBtnText: { fontSize: 14, fontWeight: "600" },
  card: { borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 12, borderWidth: 1 },
  cardText: { flex: 1, fontSize: 14, lineHeight: 22 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignSelf: "flex-start", marginTop: 8 },
  btnText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  noteCard: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 8, position: "relative" },
  notePreview: { fontSize: 15, flex: 1 },
  noteDate: { fontSize: 12, marginTop: 4 },
  delBtn: { position: "absolute", top: 12, right: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalScroll: { paddingBottom: 40 },
  modalBox: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 8 },
  textArea: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, minHeight: 80, textAlignVertical: "top" },
  modalRow: { flexDirection: "row", gap: 12, marginTop: 16, justifyContent: "flex-end" },
  moodRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  moodBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  moodBtnText: { fontSize: 16, fontWeight: "bold" },
  anonRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  anonLabel: { fontSize: 14 },
});
