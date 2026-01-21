import { supabase } from "@/lib/supabase";

const BUCKETS = { avatars: "avatars", postImages: "post-images", chatImages: "chat-images" } as const;

function getPublicUrl(bucket: string, path: string): string {
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

async function uploadImage(bucket: string, path: string, localUri: string, upsert = false): Promise<string> {
  const res = await fetch(localUri);
  const blob = await res.blob();
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: "image/jpeg",
    upsert: !!upsert,
  });
  if (error) throw error;
  return getPublicUrl(bucket, path);
}

export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
  const path = `${userId}/avatar-${Date.now()}.jpg`;
  return uploadImage(BUCKETS.avatars, path, localUri, true);
}

export async function uploadPostImage(userId: string, localUri: string): Promise<string> {
  const path = `${userId}/${Date.now()}.jpg`;
  return uploadImage(BUCKETS.postImages, path, localUri);
}

export async function uploadChatImage(userId: string, localUri: string): Promise<string> {
  const path = `${userId}/${Date.now()}.jpg`;
  return uploadImage(BUCKETS.chatImages, path, localUri);
}

export { getPublicUrl };
