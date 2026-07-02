#!/bin/sh
set -e

PORT="${PORT:-8000}"

echo "=========================================="
echo "DHARMA API starting"
echo "Host: 0.0.0.0  Port: ${PORT}"
echo "Python: $(python --version 2>&1)"
echo "=========================================="

exec uvicorn api.main:app \
  --host 0.0.0.0 \
  --port "${PORT}" \
  --log-level info \
  --timeout-keep-alive 75
