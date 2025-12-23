// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hizthellicbqudkmoksa.supabase.co";
const supabaseAnonKey = "sb_publishable_X-2l8DdlCpV6eIcYoS6IYw_p_cLi5bs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
