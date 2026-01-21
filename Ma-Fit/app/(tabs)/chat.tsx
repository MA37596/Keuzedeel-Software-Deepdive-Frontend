import { uploadChatImage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Msg = { id: string; user_id: string; content: string | null; image_url: string | null; created_at: string; profile?: { display_name: string | null } };

const ALGEMEEN_ID = "00000000-0000-0000-0000-000000000001";

export default function ChatTab() {
  const { colors } = useTheme();
  const [userId, setUserId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [imgUri, setImgUri] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const ensureJoined = useCallback(async (rid: string, uid: string) => {
    await supabase.from("chat_room_members").upsert({ room_id: rid, user_id: uid }, { onConflict: "room_id,user_id" });
  }, []);

  const loadProfiles = useCallback(async (ids: string[]) => {
    const u = [...new Set(ids)].filter(Boolean);
    if (u.length === 0) return {};
    const { data } = await supabase.from("profiles").select("id, display_name").in("id", u);
    const m: Record<string, { display_name: string | null }> = {};
    (data || []).forEach((p) => { m[p.id] = { display_name: p.display_name }; });
    return m;
  }, []);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);
    let rid = ALGEMEEN_ID;
    const { data: rooms } = await supabase.from("chat_rooms").select("id").eq("name", "Algemeen").limit(1);
    if (rooms?.[0]?.id) rid = rooms[0].id;
    setRoomId(rid);
    await ensureJoined(rid, user.id);
    const { data: msgs } = await supabase.from("chat_messages").select("id, user_id, content, image_url, created_at").eq("room_id", rid).order("created_at", { ascending: true });
    const list = (msgs || []) as Msg[];
    const pm = await loadProfiles(list.map((m) => m.user_id));
    list.forEach((m) => { m.profile = pm[m.user_id]; });
    setMessages(list);
    setLoading(false);
  }, [ensureJoined, loadProfiles]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!roomId) return;
    const ch = supabase.channel("chat:" + roomId).on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: "room_id=eq." + roomId }, async (p) => {
      const n = p.new as Msg;
      if (n.user_id && n.user_id !== userId) {
        const pm = await loadProfiles([n.user_id]);
        n.profile = pm[n.user_id];
        setMessages((m) => [...m, n]);
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
      }
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roomId, userId, loadProfiles]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Toestemming", "Galerij toegang is nodig."); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3] });
    if (!r.canceled && r.assets[0]) setImgUri(r.assets[0].uri);
  };

  const send = async () => {
    if (!roomId || !userId) return;
    const content = text.trim() || null;
    if (!content && !imgUri) return;
    setSending(true);
    try {
      let imageUrl: string | null = null;
      if (imgUri) imageUrl = await uploadChatImage(userId, imgUri);
      const { data } = await supabase.from("chat_messages").insert({ room_id: roomId, user_id: userId, content, image_url: imageUrl }).select("id, user_id, content, image_url, created_at").single();
      const { data: pro } = await supabase.from("profiles").select("display_name").eq("id", userId).single();
      setMessages((m) => [...m, { ...data, profile: pro ? { display_name: pro.display_name } : undefined } as Msg]);
      setText("");
      setImgUri(null);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      Alert.alert("Fout", e?.message || "Versturen mislukt.");
    } finally { setSending(false); }
  };

  const cardStyle = { backgroundColor: colors.card, borderColor: colors.cardBorder };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: m }) => (
          <View style={[styles.msg, m.user_id === userId ? styles.msgOwn : {}, cardStyle]}>
            {m.user_id !== userId && <Text style={[styles.msgName, { color: colors.primary }]}>{m.profile?.display_name || "Gebruiker"}</Text>}
            {m.content ? <Text style={[styles.msgContent, { color: colors.text }]}>{m.content}</Text> : null}
            {m.image_url ? <Image source={{ uri: m.image_url }} style={styles.msgImg} resizeMode="cover" /> : null}
            <Text style={[styles.msgTime, { color: colors.textSecondary }]}>{new Date(m.created_at).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</Text>
          </View>
        )}
      />
      <View style={[styles.inputRow, { backgroundColor: colors.tabBar, borderTopColor: colors.tabBarBorder }]}>
        {imgUri ? <Image source={{ uri: imgUri }} style={styles.thumb} /> : null}
        <TouchableOpacity onPress={pickImage} style={[styles.icoBtn, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="image" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]} value={text} onChangeText={setText} placeholder="Bericht…" placeholderTextColor={colors.textSecondary} onSubmitEditing={send} returnKeyType="send" selectionColor={colors.primary} underlineColorAndroid="transparent" />
        <TouchableOpacity onPress={send} disabled={sending || (!text.trim() && !imgUri)} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingTop: 36, paddingBottom: 8 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  msg: { maxWidth: "80%", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, alignSelf: "flex-start" },
  msgOwn: { alignSelf: "flex-end", backgroundColor: "rgba(46,125,50,0.12)" },
  msgName: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  msgContent: { fontSize: 15 },
  msgImg: { width: 200, height: 120, borderRadius: 8, marginTop: 6 },
  msgTime: { fontSize: 11, marginTop: 4 },
  inputRow: { flexDirection: "row", alignItems: "flex-end", padding: 12, gap: 8, borderTopWidth: 1 },
  thumb: { width: 36, height: 36, borderRadius: 8 },
  icoBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
});
