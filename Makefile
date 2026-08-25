.PHONY: help install build test start reset state clean demo

ROOT_DIR := $(shell pwd)

help:
	@echo "SentinelForge Commands"
	@echo ""
	@echo "  make install   Install dependencies for all packages"
	@echo "  make build     Build all packages and services"
	@echo "  make test      Run all tests"
	@echo "  make start     Start simulator and all MCP servers"
	@echo "  make reset     Reset simulated production state"
	@echo "  make state     Show current simulated production state"
	@echo "  make clean     Remove generated build output"
	@echo "  make demo      Build, reset, and start SentinelForge"

install:
	cd shared/production-state && npm install
	cd services/production-simulator && npm install
	cd mcp/incident-observability && npm install
	cd mcp/deployment-intelligence && npm install
	cd mcp/sandbox-validation && npm install
	cd mcp/remediation && npm install

build:
	./scripts/build-all.sh

test:
	@echo "Testing production-state..."
	cd shared/production-state && npm test

	@echo "Testing production-simulator..."
	cd services/production-simulator && npm test

	@echo "Testing incident-observability..."
	cd mcp/incident-observability && npm test

	@echo "Testing deployment-intelligence..."
	cd mcp/deployment-intelligence && npm test

	@echo "Testing sandbox-validation..."
	cd mcp/sandbox-validation && npm test

	@echo "Testing remediation..."
	cd mcp/remediation && npm test

	@echo ""
	@echo "All SentinelForge tests passed."

start:
	./scripts/start-local.sh

reset:
	@echo "Resetting simulated production environment..."
	@curl -s -X POST http://localhost:3010/reset
	@echo

state:
	@curl -s http://localhost:3010/state
	@echo

clean:
	rm -rf shared/production-state/dist
	rm -rf services/production-simulator/dist
	rm -rf mcp/incident-observability/dist
	rm -rf mcp/deployment-intelligence/dist
	rm -rf mcp/sandbox-validation/dist
	rm -rf mcp/remediation/dist
	@echo "Build artifacts removed."

demo: build
	@echo ""
	@echo "Starting SentinelForge demo environment..."
	@echo ""
	./scripts/start-local.sh