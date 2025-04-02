import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "../../config.js";
const url = SUPABASE_URL;
const anonKey = SUPABASE_KEY;

export const supabase = createClient(url, anonKey);
