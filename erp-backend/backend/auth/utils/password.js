"use strict";



async function hashPassword() {
    throw new Error(
        "hashPassword() is deprecated. Password hashing is handled by Supabase Authentication."
    );
}

async function comparePassword() {
    throw new Error(
        "comparePassword() is deprecated. Password verification is handled by Supabase Authentication."
    );
}

module.exports = Object.freeze({
    hashPassword,
    comparePassword,
});