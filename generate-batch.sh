#!/bin/bash

# Batch Product Generator — UcfZem Tech
# Usage: ./generate-batch.sh products.json

API_URL="https://ucf-product-gen.vercel.app/api/generate-product"
OUTPUT="results_$(date +%Y%m%d_%H%M%S).json"

if [ -z "$1" ]; then
  echo "Usage: ./generate-batch.sh products.json"
  echo ""
  echo "Format products.json:"
  echo '[{"name":"Product 1","category":"Category","tone":"professional","language":"fr"}]'
  exit 1
fi

INPUT="$1"
COUNT=$(cat "$INPUT" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
echo "📦 Generating $COUNT products..."
echo ""

echo "[" > "$OUTPUT"
FIRST=true

cat "$INPUT" | python3 -c "
import sys, json
products = json.load(sys.stdin)
for p in products:
    print(json.dumps(p))
" | while read -r line; do
  NAME=$(echo "$line" | python3 -c "import sys,json; print(json.load(sys.stdin).get('name','Unknown'))")
  echo -n "  🚀 $NAME... "

  RESULT=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$line")

  SUCCESS=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success',False))")

  if [ "$SUCCESS" = "True" ]; then
    echo "✅"
    if [ "$FIRST" = true ]; then
      FIRST=false
    else
      echo "," >> "$OUTPUT"
    fi
    echo "$RESULT" >> "$OUTPUT"
  else
    echo "❌"
    ERROR=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error','Unknown'))")
    echo "    Error: $ERROR"
  fi

  sleep 1
done

echo "" >> "$OUTPUT"
echo "]" >> "$OUTPUT"

echo ""
echo "✅ Done! Results saved to: $OUTPUT"
