#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PIDS=()

cleanup() {
  echo
  echo "Stopping SentinelForge services..."

  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done

  wait 2>/dev/null || true

  echo "SentinelForge services stopped."
}

trap cleanup EXIT INT TERM

start_service() {
  local name="$1"
  local directory="$2"

  echo "Starting $name..."

  (
    cd "$ROOT_DIR/$directory"
    npm run start
  ) &

  PIDS+=("$!")
}

echo "Starting SentinelForge local environment..."
echo

start_service \
  "Production Simulator" \
  "services/production-simulator"

start_service \
  "Incident Observability MCP" \
  "mcp/incident-observability"

start_service \
  "Deployment Intelligence MCP" \
  "mcp/deployment-intelligence"

start_service \
  "Sandbox Validation MCP" \
  "mcp/sandbox-validation"

start_service \
  "Remediation MCP" \
  "mcp/remediation"

echo
echo "All services started."
echo
echo "Production Simulator:      http://localhost:3010"
echo "Incident Observability:    http://localhost:3001/mcp"
echo "Deployment Intelligence:   http://localhost:3002/mcp"
echo "Sandbox Validation:        http://localhost:3003/mcp"
echo "Remediation:               http://localhost:3004/mcp"
echo
echo "Press Ctrl+C to stop all services."
echo

wait