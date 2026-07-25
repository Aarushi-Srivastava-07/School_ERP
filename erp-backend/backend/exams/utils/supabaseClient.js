"use strict";

const createSupabaseError = (error) => {
  if (error instanceof Error) return error;
  if (error?.message) return new Error(error.message);
  if (typeof error === "string") return new Error(error);
  return new Error("Unknown Supabase query error");
};

const isResponseLike = (value) =>
  value && typeof value === "object" && ("data" in value || "error" in value);

const normalizeResponse = (result) => {
  if (isResponseLike(result)) return result;
  return { data: result ?? null, error: null };
};

const extractToken = (userOrToken) => {
  if (!userOrToken) return null;
  if (typeof userOrToken === "string") return userOrToken.trim() || null;
  return userOrToken.token?.trim() || null;
};

const getInjectedClient = () => {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    globalThis.__examsSupabaseClient ||
    globalThis.__examsResultSupabaseClient ||
    globalThis.__examsRelationshipSupabaseClient ||
    null
  );
};

const getSupabaseClient = (userOrToken) => {
  const token = extractToken(userOrToken);

  if (token) {
    try {
      const { getClientForUser } = require("../../services/database.service");
      return getClientForUser(token);
    } catch {
      return null;
    }
  }

  return getInjectedClient();
};

const runQuery = async (queryBuilder) => {
  if (!queryBuilder) return { data: [], error: null };

  try {
    if (isResponseLike(queryBuilder)) {
      return queryBuilder;
    }

    if (typeof queryBuilder.then === "function") {
      const res = await queryBuilder;
      return normalizeResponse(res);
    }

    return normalizeResponse(null);
  } catch (error) {
    return {
      data: null,
      error: createSupabaseError(error),
    };
  }
};

module.exports = {
  getSupabaseClient,
  runQuery,
};
