#!/bin/bash
echo "Testing chatbot message endpoint..."
curl -X POST http://localhost:8000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}' \
  --max-time 10 \
  --silent \
  --show-error || echo "Request failed or timed out"
