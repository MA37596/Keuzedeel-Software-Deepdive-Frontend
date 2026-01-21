

import { supabase } from "./supabase";

const ADMIN_EMAILS: string[] = (
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_ADMIN_EMAILS) || ""
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function isAdmin(userId: string | undefined, email?: string | null): Promise<boolean> {
  if (!userId) return false;
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) return true;
  try {
    const { data } = await supabase.from("profiles").select("role").eq("id", userId).single();
    if (data?.role === "admin") return true;
  } catch {}
  return false;
}

export function canDeletePost(_postId: string, isAdmin: boolean): boolean {
  return isAdmin;
}
