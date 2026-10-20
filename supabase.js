
const SUPABASE_URL = "https://qtgensheyztoxvulemrf.supabase.co";

// এখানে আপনার Supabase Publishable Key বসাবেন
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Zc6KCF6le-Xpe4LkyzjiKw_ABvWt8PK";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
