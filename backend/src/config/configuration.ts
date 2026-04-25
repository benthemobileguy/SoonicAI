export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    priceSubscription: process.env.STRIPE_PRICE_SUBSCRIPTION || '',
    priceStarter: process.env.STRIPE_PRICE_STARTER || '',
    priceStandard: process.env.STRIPE_PRICE_STANDARD || '',
    priceProPack: process.env.STRIPE_PRICE_PRO_PACK || '',
  },

  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    timeout: 180000, // 3 minutes
  },

  processing: {
    maxDuration: parseInt(process.env.MAX_VIDEO_DURATION || '300', 10),
    tempDir: process.env.TEMP_DIR || '/tmp',
  },
});
