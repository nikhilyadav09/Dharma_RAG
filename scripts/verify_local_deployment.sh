#!/usr/bin/env bash
# Local deployment verification checklist for Render production image.
set -euo pipefail

IMAGE="${IMAGE:-dharma-api}"
PORT="${PORT:-8000}"
CONTAINER="dharma-verify-$$"

cleanup() {
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "==> Building image: $IMAGE"
docker build -t "$IMAGE" .

echo "==> Starting container on port $PORT"
docker run -d --name "$CONTAINER" -p "${PORT}:${PORT}" -e "PORT=${PORT}" "$IMAGE" >/dev/null

echo "==> Waiting for health (max 30s)"
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "==> Container logs (startup)"
docker logs "$CONTAINER" 2>&1 | head -20

echo "==> GET /health"
HEALTH=$(curl -sf "http://127.0.0.1:${PORT}/health")
echo "$HEALTH"
echo "$HEALTH" | grep -q '"status":"ok"'

echo "==> GET /ready (expect 503 before first chat)"
READY_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/ready" || true)
echo "HTTP $READY_CODE"
test "$READY_CODE" = "503"

echo "==> Verify uvicorn bound 0.0.0.0"
docker logs "$CONTAINER" 2>&1 | grep -q "Uvicorn running on http://0.0.0.0:${PORT}"

echo "==> Verify no torch import required for startup"
docker logs "$CONTAINER" 2>&1 | grep -q "Application startup complete"

echo ""
echo "All checks passed. Image is ready for Render deploy."
echo "Remember: set DB_*, LLM_API_KEY_1, CORS_ORIGINS, DB_SSLMODE=require, ENABLE_RERANKER=false on Render."
