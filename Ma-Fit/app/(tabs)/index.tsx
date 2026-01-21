import { isAdmin } from "@/lib/admin";
import { uploadPostImage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Profile = { id: string; display_name: string | null; avatar_url: string | null };
type Post = { id: string; user_id: string; content: string | null; image_url: string | null; created_at: string };
type Comment = { id: string; user_id: string; content: string; created_at: string; profile?: Profile };

export default function HomeTab() {
  const { colors } = useTheme();
  const [myName, setMyName] = useState("");
  const [myKlas, setMyKlas] = useState("–");
  const [posts, setPosts] = useState<(Post & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileMap, setProfileMap] = useState<Record<string, Profile>>({});
  const [isAdminUser, setIsAdminUser] = useState(false);

  const [postModal, setPostModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImageUri, setPostImageUri] = useState<string | null>(null);
  const [postSaving, setPostSaving] = useState(false);

  const [commentsModal, setCommentsModal] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);

  const loadProfiles = useCallback(async (ids: string[]) => {
    const u = [...new Set(ids)].filter(Boolean);
    if (u.length === 0) return {};
    const { data } = await supabase.from("profiles").select("id, display_name, avatar_url").in("id", u);
    const map: Record<string, Profile> = {};
    (data || []).forEach((p) => { map[p.id] = p; });
    return map;
  }, []);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      setIsAdminUser(await isAdmin(user.id, user.email ?? undefined));
      const { data: prof } = await supabase.from("profiles").select("display_name, klas").eq("id", user.id).single();
      setMyName(prof?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Gebruiker");
      setMyKlas(prof?.klas || "–");
    }
    const { data: postsData } = await supabase.from("posts").select("id, user_id, content, image_url, created_at").order("created_at", { ascending: false });
    const list = (postsData || []) as (Post & { profile?: Profile })[];
    const ids = list.map((p) => p.user_id);
    const pm = await loadProfiles(ids);
    setProfileMap((m) => ({ ...m, ...pm }));
    list.forEach((p) => { p.profile = pm[p.user_id]; });
    setPosts(list);
    setLoading(false);
  }, [loadProfiles]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Toestemming", "Galerij toegang is nodig."); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3] });
    if (!r.canceled && r.assets[0]) setPostImageUri(r.assets[0].uri);
  };

  const createPost = async () => {
    if (!userId) return;
    const content = postContent.trim() || null;
    if (!content && !postImageUri) { Alert.alert("Fout", "Voeg tekst en/of een foto toe."); return; }
    setPostSaving(true);
    try {
      let imageUrl: string | null = null;
      if (postImageUri) imageUrl = await uploadPostImage(userId, postImageUri);
      await supabase.from("posts").insert({ user_id: userId, content, image_url: imageUrl });
      setPostModal(false);
      setPostContent("");
      setPostImageUri(null);
      load();
    } catch (e: any) {
      Alert.alert("Fout", e?.message || "Plaatsen mislukt.");
    } finally { setPostSaving(false); }
  };

  const openComments = async (post: Post) => {
    setCommentsModal(post);
    setComments([]);
    setCommentText("");
    const { data } = await supabase.from("post_comments").select("id, user_id, content, created_at").eq("post_id", post.id).order("created_at", { ascending: true });
    const list = (data || []) as Comment[];
    const ids = list.map((c) => c.user_id);
    const pm = await loadProfiles(ids);
    list.forEach((c) => { c.profile = pm[c.user_id]; });
    setComments(list);
  };

  const deletePost = (p: Post) => {
    if (!isAdminUser) return;
    Alert.alert("Post verwijderen", "Weet je het zeker? Deze actie is onomkeerbaar.", [
      { text: "Annuleren", style: "cancel" },
      { text: "Verwijderen", style: "destructive", onPress: async () => {
        try {
          await supabase.from("posts").delete().eq("id", p.id);
          load();
        } catch (e: any) {
          Alert.alert("Fout", e?.message || "Verwijderen mislukt.");
        }
      } },
    ]);
  };

  const addComment = async () => {
    if (!commentsModal || !userId || !commentText.trim()) return;
    setCommentSaving(true);
    try {
      const { data } = await supabase.from("post_comments").insert({ post_id: commentsModal.id, user_id: userId, content: commentText.trim() }).select("id, user_id, content, created_at").single();
      const { data: pro } = await supabase.from("profiles").select("id, display_name, avatar_url").eq("id", userId).single();
      setComments((c) => [...c, { ...data, profile: pro || undefined } as Comment]);
      setCommentText("");
    } catch (e: any) {
      Alert.alert("Fout", e?.message || "Reactie plaatsen mislukt.");
    } finally { setCommentSaving(false); }
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListHeaderComponent={
          <View style={[styles.headerCard, cardStyle]}>
            <Text style={[styles.greeting, { color: colors.text }]}>Hallo, {myName}</Text>
            <Text style={[styles.klas, { color: colors.textSecondary }]}>Klas: {myKlas}</Text>
          </View>
        }
        renderItem={({ item: p }) => (
          <View style={[styles.post, cardStyle]}>
            <View style={styles.postHeader}>
              {p.profile?.avatar_url ? (
                <Image source={{ uri: p.profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlce, { backgroundColor: colors.primaryMuted }]}>
                  <Ionicons name="person" size={18} color={colors.primary} />
                </View>
              )}
              <View style={styles.postMeta}>
                <Text style={[styles.postName, { color: colors.text }]}>{p.profile?.display_name || "Gebruiker"}</Text>
                <Text style={[styles.postDate, { color: colors.textSecondary }]}>{new Date(p.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</Text>
              </View>
              {isAdminUser && (
                <TouchableOpacity onPress={() => deletePost(p)} hitSlop={8} style={styles.postDelBtn}>
                  <Ionicons name="trash-outline" size={20} color="#C62828" />
                </TouchableOpacity>
              )}
            </View>
            {p.content ? <Text style={[styles.postContent, { color: colors.text }]}>{p.content}</Text> : null}
            {p.image_url ? <Image source={{ uri: p.image_url }} style={styles.postImg} resizeMode="cover" /> : null}
            <TouchableOpacity style={styles.reactRow} onPress={() => openComments(p)}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.reactText, { color: colors.textSecondary }]}>Reacties</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setPostModal(true)}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={postModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Nieuwe post</Text>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.backgroundSecondary }]} value={postContent} onChangeText={setPostContent} placeholder="Wat wil je delen?" placeholderTextColor={colors.textSecondary} multiline selectionColor={colors.primary} underlineColorAndroid="transparent" />
            {postImageUri ? <Image source={{ uri: postImageUri }} style={styles.previewImg} /> : null}
            <TouchableOpacity style={[styles.secBtn, { borderColor: colors.primary }]} onPress={pickImage}>
              <Ionicons name="image" size={20} color={colors.primary} />
              <Text style={[styles.secBtnText, { color: colors.primary }]}>Foto toevoegen</Text>
            </TouchableOpacity>
            <View style={styles.modalRow}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.cardBorder }]} onPress={() => { setPostModal(false); setPostImageUri(null); }}>
                <Text style={[styles.btnText, { color: colors.text }]}>Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={createPost} disabled={postSaving}>
                <Text style={styles.btnText}>{postSaving ? "Bezig…" : "Plaatsen"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!commentsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, styles.commentsBox, { backgroundColor: colors.card }]}>
            <View style={styles.commentsHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Reacties</Text>
              <TouchableOpacity onPress={() => setCommentsModal(null)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <FlatList data={comments} keyExtractor={(c) => c.id} style={styles.commentsList} renderItem={({ item: c }) => (
              <View style={styles.comment}>
                <Text style={[styles.commentName, { color: colors.primary }]}>{c.profile?.display_name || "Gebruiker"}</Text>
                <Text style={[styles.commentContent, { color: colors.text }]}>{c.content}</Text>
              </View>
            )} />
            <View style={styles.commentInputRow}>
              <TextInput style={[styles.commentInput, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.backgroundSecondary }]} value={commentText} onChangeText={setCommentText} placeholder="Schrijf een reactie…" placeholderTextColor={colors.textSecondary} onSubmitEditing={addComment} returnKeyType="send" selectionColor={colors.primary} underlineColorAndroid="transparent" />
              <TouchableOpacity onPress={addComment} disabled={commentSaving || !commentText.trim()} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
                <Ionicons name="send" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingTop: 36, paddingBottom: 90 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerCard: { padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1 },
  greeting: { fontSize: 18, fontWeight: "bold" },
  klas: { fontSize: 14, marginTop: 2 },
  post: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarPlce: { justifyContent: "center", alignItems: "center" },
  postMeta: { marginLeft: 10, flex: 1 },
  postName: { fontSize: 15, fontWeight: "600" },
  postDelBtn: { padding: 4 },
  postDate: { fontSize: 12 },
  postContent: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  postImg: { width: "100%", height: 200, borderRadius: 8, marginBottom: 8 },
  reactRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  reactText: { fontSize: 14 },
  fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalBox: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, minHeight: 80, textAlignVertical: "top" },
  previewImg: { width: "100%", height: 160, borderRadius: 8, marginTop: 8 },
  secBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 8, alignSelf: "flex-start" },
  secBtnText: { fontSize: 14, fontWeight: "600" },
  modalRow: { flexDirection: "row", gap: 12, marginTop: 16, justifyContent: "flex-end" },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  btnText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  commentsBox: { maxHeight: "80%" },
  commentsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  commentsList: { maxHeight: 300 },
  comment: { marginBottom: 10 },
  commentName: { fontSize: 13, fontWeight: "600" },
  commentContent: { fontSize: 14, marginTop: 2 },
  commentInputRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 12 },
  commentInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
});
