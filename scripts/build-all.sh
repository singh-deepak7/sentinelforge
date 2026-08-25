#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

build() {
  local name="$1"
  local directory="$2"

  echo
  echo "Building $name..."

  cd "$ROOT_DIR/$directory"
  npm run build
}

echo "Building SentinelForge..."

build \
  "Production State" \
  "shared/production-state"

build \
  "Production Simulator" \
  "services/production-simulator"

build \
  "Incident Observability MCP" \
  "mcp/incident-observability"

build \
  "Deployment Intelligence MCP" \
  "mcp/deployment-intelligence"

build \
  "Sandbox Validation MCP" \
  "mcp/sandbox-validation"

build \
  "Remediation MCP" \
  "mcp/remediation"

echo
echo "All SentinelForge packages built successfully."