//This client is admin/principal only and must never be used for student or teacher routes
const { createClient } = require('@supabase/supabase-js');

const DATABASE_CONFIG = require('../config/database.config');

const supabaseUrl = DATABASE_CONFIG.SUPABASE.URL;
const supabaseKey = DATABASE_CONFIG.SUPABASE.ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
