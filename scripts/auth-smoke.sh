#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
EMAIL="${EMAIL:-smoke-$(date +%s)@example.com}"
PASSWORD="${PASSWORD:-correct horse battery staple}"
ACCOUNT_TYPE="${ACCOUNT_TYPE:-PERSONAL}"

TMPDIR="$(mktemp -d)"
COOKIE_JAR="$TMPDIR/cookies.txt"

cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

echo "BASE_URL=$BASE_URL"
echo "EMAIL=$EMAIL"

echo "== Signup"
code=$(curl -sS -o /dev/null -w "%{http_code}" \
  -c "$COOKIE_JAR" \
  -H 'content-type: application/json' \
  -X POST "$BASE_URL/api/auth/signup" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"accountType\":\"$ACCOUNT_TYPE\"}")

echo "signup status=$code"
[[ "$code" == "201" ]] || { echo "Signup failed"; exit 1; }

echo "== Me (should be authed)"
code=$(curl -sS -o /dev/null -w "%{http_code}" \
  -b "$COOKIE_JAR" \
  "$BASE_URL/api/auth/me")

echo "me status=$code"
[[ "$code" == "200" ]] || { echo "Me failed"; exit 1; }

echo "== Logout"
code=$(curl -sS -o /dev/null -w "%{http_code}" \
  -b "$COOKIE_JAR" \
  -c "$COOKIE_JAR" \
  -X POST "$BASE_URL/api/auth/logout")

echo "logout status=$code"
[[ "$code" == "303" || "$code" == "200" ]] || { echo "Logout failed"; exit 1; }

echo "== Me (should be 401)"
code=$(curl -sS -o /dev/null -w "%{http_code}" \
  -b "$COOKIE_JAR" \
  "$BASE_URL/api/auth/me")

echo "me-after-logout status=$code"
[[ "$code" == "401" ]] || { echo "Expected 401 after logout"; exit 1; }

echo "auth-smoke: OK"
