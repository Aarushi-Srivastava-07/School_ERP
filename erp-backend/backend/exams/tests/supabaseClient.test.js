const test = require('node:test');
const assert = require('node:assert/strict');

const { runQuery, getSupabaseClient } = require('../utils/supabaseClient');

test('runQuery normalizes thrown query errors into a response-like object', async () => {
  const response = await runQuery({
    then(resolve, reject) {
      reject(new Error('supabase exploded'));
    },
  });

  assert.equal(response.data, null);
  assert.equal(response.error instanceof Error, true);
  assert.match(response.error.message, /supabase exploded/);
});

test('runQuery awaits list queries without forcing single-row mode', async () => {
  let maybeSingleCalled = false;

  const response = await runQuery({
    maybeSingle: async () => {
      maybeSingleCalled = true;
      return { data: null, error: { message: 'should not be called' } };
    },
    then(resolve) {
      resolve({ data: [{ id: '1' }, { id: '2' }], error: null, count: 2 });
    },
  });

  assert.equal(maybeSingleCalled, false);
  assert.equal(response.data.length, 2);
  assert.equal(response.count, 2);
});

test('runQuery preserves existing response objects', async () => {
  const existingResponse = { data: [{ id: '1' }], error: null };
  const response = await runQuery(existingResponse);

  assert.equal(response, existingResponse);
});

test('getSupabaseClient returns null when no token and Supabase is not configured', () => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_ANON_KEY;
  delete globalThis.__examsSupabaseClient;
  delete globalThis.__examsResultSupabaseClient;
  delete globalThis.__examsRelationshipSupabaseClient;

  assert.equal(getSupabaseClient(), null);
});

test('getSupabaseClient creates an authenticated client when user token is provided', () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'anon-key';

  const modulePath = require.resolve('../utils/supabaseClient');
  const databaseServicePath = require.resolve('../../services/database.service');
  delete require.cache[modulePath];
  delete require.cache[databaseServicePath];

  const originalLoad = require('module')._load;
  let captured = null;

  require('module')._load = function patchedLoad(request, parent, isMain) {
    if (request === '../../services/database.service' || request.endsWith('services/database.service')) {
      return {
        getClientForUser: (token) => {
          captured = { token };
          return { token };
        },
      };
    }

    return originalLoad.apply(this, arguments);
  };

  try {
    const { getSupabaseClient } = require('../utils/supabaseClient');
    const client = getSupabaseClient({ token: 'user-jwt-token' });

    assert.equal(client.token, 'user-jwt-token');
    assert.equal(captured.token, 'user-jwt-token');
  } finally {
    require('module')._load = originalLoad;
    delete require.cache[modulePath];
    delete require.cache[databaseServicePath];
    delete globalThis.__examsSupabaseClient;
    delete globalThis.__examsResultSupabaseClient;
    delete globalThis.__examsRelationshipSupabaseClient;
  }
});

test('getSupabaseClient uses injected client in non-production when no token is provided', () => {
  const injectedClient = { injected: true };
  globalThis.__examsRelationshipSupabaseClient = injectedClient;

  assert.equal(getSupabaseClient(), injectedClient);

  delete globalThis.__examsRelationshipSupabaseClient;
});
