// Direct Stripe checkout test
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function createCheckout() {
  console.log('🔐 Getting auth token...\n');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@soonic.ai',
    password: 'TestPassword123!',
  });

  if (error) {
    console.error('❌ Auth failed:', error.message);
    return;
  }

  const token = data.session.access_token;
  console.log('✅ Got token\n');

  console.log('💳 Creating Stripe checkout session...\n');

  try {
    const response = await axios.post(
      'http://localhost:3001/stripe/checkout/credits',
      { packageId: 'standard' },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ SUCCESS!\n');
    console.log('Checkout URL:');
    console.log(response.data.url);
    console.log('\n📋 Open this URL in your browser:');
    console.log(response.data.url);
    console.log('\n💳 Use test card: 4242 4242 4242 4242');
    console.log('   Expiry: 12/34');
    console.log('   CVC: 123\n');

  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
  }
}

createCheckout();
