#!/bin/bash

# Get fresh auth token
TOKEN=$(node test/manual/test-flow.js 2>&1 | grep "eyJ" | tail -1 | sed 's/.*Bearer //' | tr -d '"' | tr -d '\n')

echo "🧪 Testing Stripe Checkout Creation"
echo "===================================="
echo ""

# Create checkout for Standard Pack
echo "Creating checkout session for Standard Pack..."
RESPONSE=$(curl -s -X POST http://localhost:3001/stripe/checkout/credits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"packageId": "standard"}')

echo "$RESPONSE" | jq .

# Extract URL
URL=$(echo "$RESPONSE" | jq -r '.url // empty')

if [ -n "$URL" ]; then
    echo ""
    echo "✅ Checkout session created!"
    echo ""
    echo "📋 Open this URL in your browser to complete payment:"
    echo "$URL"
    echo ""
    echo "💳 Use test card:"
    echo "   Card: 4242 4242 4242 4242"
    echo "   Expiry: 12/34"
    echo "   CVC: 123"
else
    echo "❌ Failed to create checkout session"
fi
