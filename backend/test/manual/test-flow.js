// Complete end-to-end test of backend with Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testCompleteFlow() {
  console.log('🧪 TESTING COMPLETE BACKEND FLOW\n');
  console.log('=' .repeat(60));

  // Step 1: List all users to find test user
  console.log('\n1️⃣  Fetching test user from database...');
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Failed to list users:', listError.message);
    return;
  }

  const testUser = users.users.find(u => u.email === 'test@soonic.ai');
  if (!testUser) {
    console.error('❌ Test user not found. Please create test@soonic.ai in Supabase dashboard.');
    return;
  }

  console.log('✅ Found test user:', testUser.id);

  // Step 2: Set password for test user
  console.log('\n2️⃣  Setting password for test user...');
  const { error: pwdError } = await supabaseAdmin.auth.admin.updateUserById(
    testUser.id,
    { password: 'TestPassword123!' }
  );

  if (pwdError) {
    console.error('❌ Failed to set password:', pwdError.message);
    return;
  }

  console.log('✅ Password set successfully');

  // Step 3: Sign in to get JWT token
  console.log('\n3️⃣  Signing in to get JWT token...');
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'test@soonic.ai',
    password: 'TestPassword123!',
  });

  if (signInError) {
    console.error('❌ Sign in failed:', signInError.message);
    return;
  }

  const token = authData.session.access_token;
  console.log('✅ Signed in successfully');
  console.log('   User ID:', authData.user.id);
  console.log('   Token:', token.substring(0, 30) + '...');

  // Step 4: Test health endpoint (public)
  console.log('\n4️⃣  Testing health endpoint (public)...');
  try {
    const healthResponse = await axios.get('http://localhost:3001/analysis/health');
    console.log('✅ Health check:', healthResponse.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return;
  }

  // Step 5: Test user stats endpoint (protected)
  console.log('\n5️⃣  Testing user stats endpoint (protected)...');
  try {
    const statsResponse = await axios.get('http://localhost:3001/analysis/me/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User stats:', statsResponse.data);
  } catch (error) {
    console.error('❌ Stats endpoint failed:', error.response?.data || error.message);
  }

  // Step 6: Test user analyses endpoint (protected)
  console.log('\n6️⃣  Testing user analyses endpoint (protected)...');
  try {
    const analysesResponse = await axios.get('http://localhost:3001/analysis/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User analyses:', analysesResponse.data);
  } catch (error) {
    console.error('❌ Analyses endpoint failed:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ END-TO-END TEST COMPLETE\n');
  console.log('📋 Your JWT token for manual testing:');
  console.log(token);
  console.log('\n📝 Try this command:');
  console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3001/analysis/me/stats`);
}

testCompleteFlow().catch(console.error);
