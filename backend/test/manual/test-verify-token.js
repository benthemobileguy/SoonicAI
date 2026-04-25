// Test Supabase token verification directly
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

async function testTokenVerification() {
  console.log('Testing token verification...\n');

  // First get a token
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'test@soonic.ai',
    password: 'TestPassword123!',
  });

  if (signInError) {
    console.error('❌ Sign in failed:', signInError.message);
    return;
  }

  const token = authData.session.access_token;
  console.log('✅ Got token:', token.substring(0, 30) + '...\n');

  // Now try to verify it using service key (like the backend does)
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Testing verification with service key...');
  const { data, error } = await supabaseService.auth.getUser(token);

  if (error) {
    console.error('❌ Verification failed:', error);
    console.error('   Message:', error.message);
    console.error('   Status:', error.status);
    return;
  }

  if (!data.user) {
    console.error('❌ No user in response');
    return;
  }

  console.log('✅ Verification successful!');
  console.log('   User ID:', data.user.id);
  console.log('   Email:', data.user.email);
}

testTokenVerification().catch(console.error);
