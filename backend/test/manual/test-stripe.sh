#!/bin/bash

# Stripe Integration Test Script
# Run this after configuring Stripe products

echo "🧪 TESTING STRIPE INTEGRATION"
echo "============================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "1️⃣  Checking if backend is running..."
if curl -s http://localhost:3001/analysis/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running. Start it with: npm run start:dev${NC}"
    exit 1
fi

echo ""
echo "2️⃣  Getting available credit packages..."
PACKAGES=$(curl -s http://localhost:3001/stripe/packages)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Packages endpoint working${NC}"
    echo "$PACKAGES" | jq '.'
else
    echo -e "${RED}❌ Failed to get packages${NC}"
    exit 1
fi

echo ""
echo "3️⃣  Getting auth token..."
TOKEN=$(node test-flow.js 2>/dev/null | grep "eyJ" | tail -1 | tr -d '[:space:]')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get auth token${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Got auth token${NC}"
    echo "   ${TOKEN:0:30}..."
fi

echo ""
echo "4️⃣  Creating checkout session for Standard Pack..."
CHECKOUT=$(curl -s -X POST http://localhost:3001/stripe/checkout/credits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"packageId": "standard"}')

if echo "$CHECKOUT" | jq -e '.url' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Checkout session created${NC}"
    CHECKOUT_URL=$(echo "$CHECKOUT" | jq -r '.url')
    echo ""
    echo "   📋 Checkout URL (open in browser):"
    echo "   $CHECKOUT_URL"
else
    echo -e "${RED}❌ Failed to create checkout session${NC}"
    echo "$CHECKOUT" | jq '.'

    # Check if it's because of missing price IDs
    if echo "$CHECKOUT" | grep -q "Price ID not configured"; then
        echo ""
        echo -e "${YELLOW}⚠️  You need to configure Stripe price IDs${NC}"
        echo "   1. Go to: https://dashboard.stripe.com/test/products"
        echo "   2. Create the products as per docs/04-setup/STRIPE_SETUP.md"
        echo "   3. Add price IDs to backend/.env"
    fi

    exit 1
fi

echo ""
echo "5️⃣  Creating subscription checkout..."
SUB_CHECKOUT=$(curl -s -X POST http://localhost:3001/stripe/checkout/subscription \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$SUB_CHECKOUT" | jq -e '.url' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Subscription checkout created${NC}"
    SUB_URL=$(echo "$SUB_CHECKOUT" | jq -r '.url')
    echo ""
    echo "   📋 Subscription URL (open in browser):"
    echo "   $SUB_URL"
else
    echo -e "${RED}❌ Failed to create subscription checkout${NC}"
    echo "$SUB_CHECKOUT" | jq '.'
    exit 1
fi

echo ""
echo "============================================================"
echo -e "${GREEN}✅ STRIPE INTEGRATION TEST COMPLETE${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Open one of the checkout URLs above in your browser"
echo "   2. Use test card: 4242 4242 4242 4242"
echo "   3. Complete the payment"
echo "   4. Check webhook received in backend logs"
echo "   5. Verify credits added: curl -H \"Authorization: Bearer $TOKEN\" http://localhost:3001/analysis/me/stats"
echo ""
