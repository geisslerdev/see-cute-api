require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const bucketName = process.env.SUPABASE_BUCKET;

module.exports = { supabase, bucketName };
