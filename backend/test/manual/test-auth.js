// Quick test script to get auth token from Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testAuth() {
  console.log('🔐 Testing Supabase authentication...\n');

  // First, try using the service key to update the user's password directly
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log('Setting password for test@soonic.ai...');
  const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    '2f46602e-c28d-433e-8236-3c97f4323dea',
    { password: 'testpassword123' }
  );

  if (updateError) {
    console.error('❌ Failed to set password:', updateError.message);
    return;
  }

  console.log('✅ Password set successfully!\n');

  // Now try to sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@soonic.ai',
    password: 'testpassword123',
  });

  if (error) {
    console.error('❌ Sign in failed:', error.message);
    return;
  }

  console.log('✅ Authentication successful!');
  console.log('\nUser ID:', data.user.id);
  console.log('Email:', data.user.email);
  console.log('\n🎟️  Access Token (JWT):');
  console.log(data.session.access_token);
  console.log('\n📋 To test API endpoints, use:');
  console.log(`\ncurl -H "Authorization: Bearer ${data.session.access_token}" http://localhost:3001/analysis/me/stats`);
  console.log('\n---\n');
}

testAuth();
