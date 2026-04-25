// Test credit and duration limit logic
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCreditLogic() {
  console.log('🧪 TESTING CREDIT & DURATION LOGIC\n');
  console.log('='.repeat(70));

  // Get test user
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'test@soonic.ai',
    password: 'TestPassword123!',
  });

  const token = authData.session.access_token;
  const userId = authData.user.id;

  // Test 1: Free user stats
  console.log('\n📊 TEST 1: Free User Stats');
  console.log('-'.repeat(70));

  const stats1 = await axios.get('http://localhost:3001/analysis/me/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log('Current stats:', JSON.stringify(stats1.data, null, 2));

  console.log('\n✅ Verification:');
  console.log(`   - creditsRemaining = ${stats1.data.creditsRemaining} (should be 0)`);
  console.log(`   - maxDuration = ${stats1.data.maxDuration}s (should be 60)`);
  console.log(`   - canAnalyze = ${stats1.data.canAnalyze} (should be true)`);
  console.log(`   - analysesLimit = ${stats1.data.analysesLimit} (should be 3)`);

  // Test 2: Simulate credit purchase (update user to have credits)
  console.log('\n\n💳 TEST 2: Simulating Credit Purchase');
  console.log('-'.repeat(70));

  await supabaseAdmin
    .from('profiles')
    .update({
      plan: 'credits',
      credits_remaining: 10
    })
    .eq('id', userId);

  console.log('✅ Updated user to have 10 credits');

  const stats2 = await axios.get('http://localhost:3001/analysis/me/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log('\nNew stats:', JSON.stringify(stats2.data, null, 2));

  console.log('\n✅ Verification:');
  console.log(`   - plan = ${stats2.data.plan} (should be 'credits')`);
  console.log(`   - creditsRemaining = ${stats2.data.creditsRemaining} (should be 10)`);
  console.log(`   - maxDuration = ${stats2.data.maxDuration}s (should be 300)`);
  console.log(`   - canAnalyze = ${stats2.data.canAnalyze} (should be true)`);

  // Test 3: Simulate Pro user
  console.log('\n\n⭐ TEST 3: Simulating Pro User');
  console.log('-'.repeat(70));

  await supabaseAdmin
    .from('profiles')
    .update({
      plan: 'pro',
      stripe_subscription_id: 'sub_test_123'
    })
    .eq('id', userId);

  console.log('✅ Updated user to Pro plan');

  const stats3 = await axios.get('http://localhost:3001/analysis/me/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log('\nPro user stats:', JSON.stringify(stats3.data, null, 2));

  console.log('\n✅ Verification:');
  console.log(`   - plan = ${stats3.data.plan} (should be 'pro')`);
  console.log(`   - maxDuration = ${stats3.data.maxDuration}s (should be 300)`);
  console.log(`   - canAnalyze = ${stats3.data.canAnalyze} (should be true)`);

  // Test 4: Restore to free user
  console.log('\n\n🔄 TEST 4: Restoring to Free User');
  console.log('-'.repeat(70));

  await supabaseAdmin
    .from('profiles')
    .update({
      plan: 'free',
      credits_remaining: 0,
      analyses_used: 0,
      stripe_subscription_id: null
    })
    .eq('id', userId);

  console.log('✅ Restored user to free plan');

  const stats4 = await axios.get('http://localhost:3001/analysis/me/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log('\nFinal stats:', JSON.stringify(stats4.data, null, 2));

  // Test 5: Test free user at limit
  console.log('\n\n🚫 TEST 5: Free User at Limit');
  console.log('-'.repeat(70));

  await supabaseAdmin
    .from('profiles')
    .update({
      analyses_used: 3  // Used all 3 free analyses
    })
    .eq('id', userId);

  console.log('✅ Set analyses_used to 3 (at limit)');

  const stats5 = await axios.get('http://localhost:3001/analysis/me/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log('\nStats at limit:', JSON.stringify(stats5.data, null, 2));

  console.log('\n✅ Verification:');
  console.log(`   - analysesUsed = ${stats5.data.analysesUsed} (should be 3)`);
  console.log(`   - canAnalyze = ${stats5.data.canAnalyze} (should be false)`);

  // Restore user to clean state
  await supabaseAdmin
    .from('profiles')
    .update({
      plan: 'free',
      analyses_used: 0,
      credits_remaining: 0
    })
    .eq('id', userId);

  console.log('\n' + '='.repeat(70));
  console.log('✅ ALL TESTS COMPLETE - User restored to free plan\n');
}

testCreditLogic().catch(console.error);
