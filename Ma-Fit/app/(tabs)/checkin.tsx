import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
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

type Note = { id: string; content: string; created_at: string };
type WeeklyCheckIn = {
  id: string;
  mood: number;
  what_went_well: string | null;
  what_to_improve: string | null;
  extra: string | null;
  week_start: string;
  created_at: string;
};

export default function CheckInTab() {
  const [userId, setUserId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [checkins, setCheckins] = useState<WeeklyCheckIn[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [checkinsLoading, setCheckinsLoading] = useState(true);
  const [noteModal, setNoteModal] = useState<"off" | "new" | "edit">("off");
  const [checkinModal, setCheckinModal] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [checkinSaving, setCheckinSaving] = useState(false);

  // Weekly check-in states
  const [mood, setMood] = useState(3);
  const [whatWentWell, setWhatWentWell] = useState("");
  const [whatToImprove, setWhatToImprove] = useState("");
  const [extra, setExtra] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const COLORS = {
    background: "#F9FAFB",
    card: "#FFFFFF",
    cardBorder: "#E5E7EB",
    backgroundSecondary: "#F9FAFB",
    text: "#1F2937",
    textSecondary: "#6B7280",
    primary: "#3B82F6",
  };

  const loadNotes = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await supabase
      .from("notes")
      .select("id, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setNotes(data || []);
    setNotesLoading(false);
  }, []);

  const loadCheckins = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    
    // Bereken huidige week start (maandag)
    const now = new Date();
    const day = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const { data } = await supabase
      .from("weekly_checkins")
      .select("id, mood, what_went_well, what_to_improve, extra, week_start, created_at")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(10);
    setCheckins(data || []);
    setCheckinsLoading(false);
  }, []);

  useEffect(() => { 
    loadNotes(); 
    loadCheckins();
  }, [loadNotes, loadCheckins]);

  const openNewNote = () => { 
    setNoteId(null); 
    setNoteContent(""); 
    setNoteModal("new"); 
  };
  
  const openEditNote = (n: Note) => { 
    setNoteId(n.id); 
    setNoteContent(n.content); 
    setNoteModal("edit"); 
  };

  const saveNote = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      if (noteModal === "new") {
        await supabase.from("notes").insert({ 
          user_id: userId, 
          content: noteContent.trim() || "(Lege notitie)" 
        });
      } else if (noteId) {
        await supabase.from("notes")
          .update({ 
            content: noteContent.trim() || "(Lege notitie)", 
            updated_at: new Date().toISOString() 
          })
          .eq("id", noteId);
      }
      setNoteModal("off");
      loadNotes();
    } catch (e: any) {
      Alert.alert("Fout", e?.message || "Opslaan mislukt.");
    } finally { 
      setSaving(false); 
    }
  };

  const deleteNote = (id: string) => {
    Alert.alert("Verwijderen", "Weet je het zeker?", [
      { text: "Nee", style: "cancel" },
      { 
        text: "Ja", 
        style: "destructive", 
        onPress: async () => {
          await supabase.from("notes").delete().eq("id", id);
          loadNotes();
          if (noteModal === "edit" && noteId === id) setNoteModal("off");
        }
      },
    ]);
  };

  const submitWeeklyCheckin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Bereken week start
    const now = new Date();
    const day = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    weekStart.setHours(0, 0, 0, 0);

    setCheckinSaving(true);
    try {
      await supabase.from("weekly_checkins").insert({
        user_id: user.id,
        mood,
        what_went_well: whatWentWell.trim() || null,
        what_to_improve: whatToImprove.trim() || null,
        extra: extra.trim() || null,
        week_start: weekStart.toISOString(),
        is_anonymous: isAnonymous,
      });
      
      setCheckinModal(false);
      setMood(3); 
      setWhatWentWell(""); 
      setWhatToImprove(""); 
      setExtra(""); 
      setIsAnonymous(false);
      
      Alert.alert("✅ Check-in voltooid!", "Je wekelijkse reflectie is opgeslagen.");
      loadCheckins();
    } catch (e: any) {
      Alert.alert("Fout", e?.message || "Opslaan mislukt.");
    } finally { 
      setCheckinSaving(false); 
    }
  };

  const getMoodEmoji = (m: number) => {
    const emojis = ["😞", "🙁", "😐", "🙂", "😊"];
    return emojis[m - 1];
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: COLORS.background }]} 
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Wekelijkse Check-in */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
          📅 Wekelijkse check-in
        </Text>
        <TouchableOpacity 
          style={[styles.card, styles.checkinCard, { 
            backgroundColor: COLORS.card, 
            borderColor: COLORS.cardBorder 
          }]}
          onPress={() => setCheckinModal(true)}
          activeOpacity={0.9}
        >
          <Ionicons name="calendar-outline" size={28} color={COLORS.primary} />
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: COLORS.text }]}>
              Hoe was je week?
            </Text>
            <Text style={[styles.cardText, { color: COLORS.textSecondary }]}>
              Vul je wekelijkse reflectie in (mood + wat goed ging/anders kan).
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {checkinsLoading ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : checkins.length > 0 && (
          <View style={styles.recentCheckins}>
            <Text style={[styles.subtitle, { color: COLORS.text }]}>
              Vorige check-ins
            </Text>
            {checkins.slice(0, 3).map((c) => (
              <View key={c.id} style={[
                styles.checkinItem, 
                { 
                  backgroundColor: COLORS.card, 
                  borderColor: COLORS.cardBorder 
                }
              ]}>
                <Text style={[styles.checkinMood, { color: COLORS.text }]}>
                  {getMoodEmoji(c.mood)} {c.mood}/5
                </Text>
                <Text style={[styles.checkinDate, { color: COLORS.textSecondary }]}>
                  {new Date(c.week_start).toLocaleDateString("nl-NL", {
                    weekday: "short",
                    month: "short",
                    day: "numeric"
                  })}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Notities */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>📝 Notities</Text>
          <TouchableOpacity 
            onPress={openNewNote} 
            style={[styles.addBtn, { borderColor: COLORS.primary }]}
          >
            <Ionicons name="add" size={20} color={COLORS.primary} />
            <Text style={[styles.addBtnText, { color: COLORS.primary }]}>
              Nieuwe notitie
            </Text>
          </TouchableOpacity>
        </View>
        
        {notesLoading ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : notes.length === 0 ? (
          <View style={[
            styles.card, 
            { 
              backgroundColor: COLORS.card, 
              borderColor: COLORS.cardBorder 
            }
          ]}>
            <Text style={[styles.cardText, { color: COLORS.textSecondary }]}>
              Nog geen notities. Maak er een met de knop hierboven.
            </Text>
          </View>
        ) : (
          notes.map((n) => (
            <TouchableOpacity 
              key={n.id} 
              onPress={() => openEditNote(n)} 
              style={[
                styles.noteCard, 
                { 
                  backgroundColor: COLORS.card, 
                  borderColor: COLORS.cardBorder 
                }
              ]}
            >
              <Text style={[styles.notePreview, { color: COLORS.text }]} numberOfLines={2}>
                {n.content}
              </Text>
              <Text style={[styles.noteDate, { color: COLORS.textSecondary }]}>
                {new Date(n.created_at).toLocaleDateString("nl-NL")}
              </Text>
              <TouchableOpacity 
                onPress={() => deleteNote(n.id)} 
                hitSlop={8} 
                style={styles.delBtn}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Note Modal */}
      <Modal visible={noteModal !== "off"} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: COLORS.card }]}>
              <Text style={[styles.modalTitle, { color: COLORS.text }]}>
                {noteModal === "new" ? "Nieuwe notitie" : "Notitie bewerken"}
              </Text>
              <TextInput
                style={[
                  styles.textArea, 
                  { 
                    color: COLORS.text, 
                    borderColor: COLORS.cardBorder, 
                    backgroundColor: COLORS.backgroundSecondary 
                  }
                ]}
                value={noteContent}
                onChangeText={setNoteContent}
                placeholder="Schrijf hier je gedachten..."
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={4}
                selectionColor={COLORS.primary}
                underlineColorAndroid="transparent"
              />
              <View style={styles.modalRow}>
                <TouchableOpacity 
                  style={[styles.btn, { backgroundColor: COLORS.cardBorder }]} 
                  onPress={() => setNoteModal("off")}
                >
                  <Text style={[styles.btnText, { color: COLORS.text }]}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, { backgroundColor: COLORS.primary }]} 
                  onPress={saveNote} 
                  disabled={saving}
                >
                  <Text style={styles.btnText}>
                    {saving ? "Bezig..." : "Opslaan"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Weekly Check-in Modal */}
      <Modal visible={checkinModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={[styles.modalBox, { backgroundColor: COLORS.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: COLORS.text }]}>
                  📅 Wekelijkse check-in
                </Text>
                <TouchableOpacity 
                  onPress={() => setCheckinModal(false)}
                  hitSlop={20}
                >
                  <Ionicons name="close" size={28} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: COLORS.text }]}>
                Hoe voel je je deze week? (1=😞 slecht, 5=😊 fantastisch)
              </Text>
              <View style={styles.moodRow}>
                {[1,2,3,4,5].map((i) => (
                  <TouchableOpacity 
                    key={i} 
                    onPress={() => setMood(i)} 
                    style={[
                      styles.moodBtn, 
                      { 
                        backgroundColor: mood === i ? COLORS.primary : COLORS.backgroundSecondary,
                        borderColor: mood === i ? COLORS.primary : COLORS.cardBorder
                      }
                    ]}
                  >
                    <Text style={[
                      styles.moodBtnText, 
                      { color: mood === i ? "#FFFFFF" : COLORS.text }
                    ]}>
                      {getMoodEmoji(i)} {i}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: COLORS.text }]}>
                Wat ging goed deze week?
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { 
                    color: COLORS.text, 
                    borderColor: COLORS.cardBorder, 
                    backgroundColor: COLORS.backgroundSecondary 
                  }
                ]}
                value={whatWentWell}
                onChangeText={setWhatWentWell}
                placeholder="Bijv. 'Goed geslapen, leuke lessen...'"
                placeholderTextColor={COLORS.textSecondary}
                multiline
                selectionColor={COLORS.primary}
                underlineColorAndroid="transparent"
              />

              <Text style={[styles.label, { color: COLORS.text }]}>
                Wat wil je anders doen?
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { 
                    color: COLORS.text, 
                    borderColor: COLORS.cardBorder, 
                    backgroundColor: COLORS.backgroundSecondary 
                  }
                ]}
                value={whatToImprove}
                onChangeText={setWhatToImprove}
                placeholder="Bijv. 'Minder gamen, meer bewegen...'"
                placeholderTextColor={COLORS.textSecondary}
                multiline
                selectionColor={COLORS.primary}
                underlineColorAndroid="transparent"
              />

              <Text style={[styles.label, { color: COLORS.text }]}>
                Extra opmerkingen (optioneel)
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { 
                    color: COLORS.text, 
                    borderColor: COLORS.cardBorder, 
                    backgroundColor: COLORS.backgroundSecondary 
                  }
                ]}
                value={extra}
                onChangeText={setExtra}
                placeholder="Alles wat je wilt delen..."
                placeholderTextColor={COLORS.textSecondary}
                multiline
                selectionColor={COLORS.primary}
                underlineColorAndroid="transparent"
              />

              <TouchableOpacity 
                onPress={() => setIsAnonymous(!isAnonymous)} 
                style={[
                  styles.anonRow,
                  { borderColor: COLORS.cardBorder }
                ]}
              >
                <Ionicons 
                  name={isAnonymous ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={COLORS.primary} 
                />
                <Text style={[styles.anonLabel, { color: COLORS.text }]}>
                  Anoniem invullen
                </Text>
              </TouchableOpacity>

              <View style={styles.modalRow}>
                <TouchableOpacity 
                  style={[styles.btn, { backgroundColor: COLORS.cardBorder }]} 
                  onPress={() => setCheckinModal(false)}
                >
                  <Text style={[styles.btnText, { color: COLORS.text }]}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, { backgroundColor: COLORS.primary }]} 
                  onPress={submitWeeklyCheckin} 
                  disabled={checkinSaving}
                >
                  <Text style={styles.btnText}>
                    {checkinSaving ? "Bezig..." : "Check-in voltooien"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 36, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 12, 
    flexWrap: "wrap" 
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  subtitle: { fontSize: 15, fontWeight: "600", marginBottom: 12 },
  checkinCard: { 
    padding: 20, 
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  cardContent: { flex: 1, marginLeft: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  cardText: { fontSize: 14, lineHeight: 20 },
  recentCheckins: { marginTop: 16 },
  checkinItem: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: 16, 
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  checkinMood: { fontSize: 16, fontWeight: "600" },
  checkinDate: { fontSize: 14 },
  card: { 
    borderRadius: 12, 
    padding: 16, 
    flexDirection: "row", 
    alignItems: "flex-start", 
    gap: 12, 
    borderWidth: 1 
  },
  addBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderWidth: 1.5, 
    borderRadius: 10 
  },
  addBtnText: { fontSize: 15, fontWeight: "600" },
  noteCard: { 
    borderRadius: 12, 
    padding: 18, 
    borderWidth: 1, 
    marginBottom: 10, 
    position: "relative" 
  },
  notePreview: { fontSize: 15, lineHeight: 22, flex: 1 },
  noteDate: { fontSize: 12, marginTop: 6 },
  delBtn: { position: "absolute", top: 14, right: 14 },
  loader: { marginVertical: 24 },
  btn: { 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    borderRadius: 12, 
    alignSelf: "flex-start" 
  },
  btnText: { fontSize: 16, fontWeight: "600" },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "flex-end" 
  },
  modalScroll: { flex: 1, paddingBottom: 40 },
  modalBox: { 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 28, 
    maxHeight: "90%" 
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24
  },
  modalTitle: { fontSize: 22, fontWeight: "800" },
  label: { 
    fontSize: 16, 
    fontWeight: "700", 
    marginBottom: 10, 
    marginTop: 20 
  },
  textArea: { 
    borderWidth: 1.5, 
    borderRadius: 14, 
    padding: 16, 
    fontSize: 16, 
    minHeight: 100, 
    textAlignVertical: "top" 
  },
  moodRow: { 
    flexDirection: "row", 
    gap: 12, 
    marginBottom: 24,
    justifyContent: "space-between"
  },
  moodBtn: { 
    flex: 1,
    height: 60, 
    borderRadius: 16, 
    justifyContent: "center", 
    alignItems: "center",
    borderWidth: 2.5
  },
  moodBtnText: { 
    fontSize: 20, 
    fontWeight: "800" 
  },
  anonRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 14, 
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed"
  },
  anonLabel: { fontSize: 16 },
  modalRow: { 
    flexDirection: "row", 
    gap: 16, 
    marginTop: 32, 
    justifyContent: "flex-end",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB"
  },
});
