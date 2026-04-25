// Stripe Product Setup Script
// This script creates all Stripe products and updates .env with price IDs

require('dotenv').config();
const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  console.log('🚀 Setting up Stripe products...\n');

  const products = [];

  try {
    // 1. Create Starter Pack
    console.log('1️⃣  Creating Starter Pack...');
    const starter = await stripe.products.create({
      name: 'Starter Pack',
      description: '5 chord analyses for worship pianists',
    });
    const starterPrice = await stripe.prices.create({
      product: starter.id,
      unit_amount: 990, // $9.90 in cents
      currency: 'usd',
    });
    console.log(`   ✅ Created: ${starterPrice.id}`);
    products.push({ name: 'STRIPE_PRICE_STARTER', id: starterPrice.id });

    // 2. Create Standard Pack
    console.log('\n2️⃣  Creating Standard Pack...');
    const standard = await stripe.products.create({
      name: 'Standard Pack',
      description: '17 chord analyses (15 + 2 bonus) for regular church musicians',
    });
    const standardPrice = await stripe.prices.create({
      product: standard.id,
      unit_amount: 2490, // $24.90 in cents
      currency: 'usd',
    });
    console.log(`   ✅ Created: ${standardPrice.id}`);
    products.push({ name: 'STRIPE_PRICE_STANDARD', id: standardPrice.id });

    // 3. Create Pro Pack
    console.log('\n3️⃣  Creating Pro Pack...');
    const proPack = await stripe.products.create({
      name: 'Pro Pack',
      description: '40 chord analyses (35 + 5 bonus) for music directors',
    });
    const proPackPrice = await stripe.prices.create({
      product: proPack.id,
      unit_amount: 4990, // $49.90 in cents
      currency: 'usd',
    });
    console.log(`   ✅ Created: ${proPackPrice.id}`);
    products.push({ name: 'STRIPE_PRICE_PRO_PACK', id: proPackPrice.id });

    // 4. Create Pro Subscription
    console.log('\n4️⃣  Creating Pro Subscription...');
    const subscription = await stripe.products.create({
      name: 'Pro Subscription',
      description: 'Unlimited chord analyses for professional worship musicians',
    });
    const subscriptionPrice = await stripe.prices.create({
      product: subscription.id,
      unit_amount: 1990, // $19.90 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });
    console.log(`   ✅ Created: ${subscriptionPrice.id}`);
    products.push({ name: 'STRIPE_PRICE_SUBSCRIPTION', id: subscriptionPrice.id });

    // 5. Update .env file
    console.log('\n5️⃣  Updating .env file...');
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Replace each price ID in .env
    products.forEach(({ name, id }) => {
      const regex = new RegExp(`${name}=.*`, 'g');
      envContent = envContent.replace(regex, `${name}=${id}`);
    });

    fs.writeFileSync(envPath, envContent);
    console.log('   ✅ .env updated with all price IDs');

    // 6. Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ STRIPE SETUP COMPLETE!\n');
    console.log('Products created:');
    products.forEach(({ name, id }) => {
      console.log(`   ${name} = ${id}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n📋 Next steps:');
    console.log('1. Set up webhook for local testing:');
    console.log('   stripe listen --forward-to localhost:3001/stripe/webhook');
    console.log('\n2. Run test:');
    console.log('   ./test/manual/test-stripe.sh');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error creating products:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  Invalid API key. Please check your STRIPE_SECRET_KEY in .env');
    }
    process.exit(1);
  }
}

setupStripeProducts();
