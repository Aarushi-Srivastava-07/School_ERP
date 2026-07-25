"use strict";

const { createClient } = require("@supabase/supabase-js");

const DATABASE_CONFIG = require("../config/database.config");
const DATABASE_MESSAGES = require("../constants/databaseMessages");

const {
    SUPABASE: {
        URL,
        ANON_KEY,
    },
} = DATABASE_CONFIG;


function getClientForUser(userJwt) {
    if (!URL) {
        throw new Error(
            DATABASE_MESSAGES.SUPABASE_URL_REQUIRED
        );
    }

    if (!ANON_KEY) {
        throw new Error(
            DATABASE_MESSAGES.SUPABASE_ANON_KEY_REQUIRED
        );
    }

    if (
        typeof userJwt !== "string" ||
        !userJwt.trim()
    ) {
        throw new Error(
            DATABASE_MESSAGES.USER_TOKEN_REQUIRED
        );
    }

    return createClient(
        URL,
        ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${userJwt}`,
                },
            },
        }
    );
}

module.exports = Object.freeze({
    getClientForUser,
});