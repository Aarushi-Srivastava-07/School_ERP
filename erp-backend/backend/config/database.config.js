"use strict";

const DATABASE_CONFIG = Object.freeze({
    SUPABASE: {
        URL: process.env.SUPABASE_URL,
        ANON_KEY: process.env.SUPABASE_ANON_KEY,
        SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
});

if (!DATABASE_CONFIG.SUPABASE.URL) {
    throw new Error("SUPABASE_URL environment variable is not configured.");
}

if (!DATABASE_CONFIG.SUPABASE.ANON_KEY) {
    throw new Error("SUPABASE_ANON_KEY environment variable is not configured.");
}

module.exports = DATABASE_CONFIG;