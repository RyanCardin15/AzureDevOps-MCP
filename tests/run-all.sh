#!/usr/bin/env bash
# Run all tests from the project root
# Usage: bash tests/run-all.sh

set -e
cd "$(dirname "$0")/.."

PASS=0
FAIL=0
TESTS=(
  "tests/test-file-search.ts"
  "tests/test-work-item-types.ts"
  "tests/test-pull-requests.ts"
)

for TEST in "${TESTS[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "▶ $TEST"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if npx ts-node "$TEST" 2>/dev/null; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
  fi
done

echo "════════════════════════════════════════"
echo "  Suites passed: $PASS"
echo "  Suites failed: $FAIL"
echo "════════════════════════════════════════"

[ $FAIL -eq 0 ]
