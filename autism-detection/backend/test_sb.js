require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase
    .from('analyses')
    .insert([
      { filename: 'test.mp4', results: { test: true } }
    ])
    .select()
    .single();
  
  const fs = require('fs');
  fs.writeFileSync('test_err.txt', JSON.stringify({data, error}, null, 2));
}

test();
