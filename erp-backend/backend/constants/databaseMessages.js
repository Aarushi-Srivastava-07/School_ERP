"use strict";

const DATABASE_MESSAGES = Object.freeze({
    SUPABASE_URL_REQUIRED:
        "SUPABASE_URL is not configured.",

    SUPABASE_ANON_KEY_REQUIRED:
        "SUPABASE_ANON_KEY is not configured.",

    USER_TOKEN_REQUIRED:
        "User authentication token is required.",
});

module.exports = DATABASE_MESSAGES;