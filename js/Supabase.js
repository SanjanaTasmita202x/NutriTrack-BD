// Supabase Client Configuration & Initialization
const SUPABASE_URL = "https://skgamxxwytfiibshnjiu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7FfUJarkHM-gid5-i4AFHg_qyy0Gwq2";

/**
 * Initializes and returns the Supabase client instance.
 * Prevents duplicate client initialization and verifies configuration safely.
 * @returns {object|null} The initialized Supabase client or null on failure
 */
function initSupabaseClient() {
    if (window.supabaseClient) {
        return window.supabaseClient;
    }

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
        console.error("Supabase Config Error: Both SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be provided.");
        return null;
    }

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
        console.error("Supabase Library Error: Supabase JS library (@supabase/supabase-js) is not loaded on window.supabase.");
        return null;
    }

    try {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
        window.supabaseClient = client;
        return client;
    } catch (err) {
        console.error("Supabase Initialization Error: Failed to create Supabase client:", err);
        return null;
    }
}

// Initialize client on load and expose globally
const supabaseClient = initSupabaseClient();