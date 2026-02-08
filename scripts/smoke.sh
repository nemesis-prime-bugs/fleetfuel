#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
EMAIL="${SMOKE_EMAIL:-smoke@example.com}"
PASS="${SMOKE_PASSWORD:-correct horse battery staple}"

COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT

echo "== FleetFuel smoke =="
echo "BASE_URL=$BASE_URL"

echo "-- signup (may 409 if already exists)"
set +e
curl -sS -i -X POST "$BASE_URL/api/auth/signup" \
  -H 'content-type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"accountType\":\"PERSONAL\"}" \
  | head -n 5
set -e

echo "-- login"
curl -sS -i -c "$COOKIE_JAR" -X POST "$BASE_URL/api/auth/login" \
  -H 'content-type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" \
  | head -n 20

echo "-- vehicles: create + list"
VEHICLE_ID=$(curl -sS -b "$COOKIE_JAR" -X POST "$BASE_URL/api/vehicles" \
  -H 'content-type: application/json' \
  -d '{"name":"Smoke Car","fuelType":"GASOLINE","unitSystem":"METRIC"}' \
  | node -pe 'JSON.parse(fs.readFileSync(0,"utf8")).vehicle.id')
echo "VEHICLE_ID=$VEHICLE_ID"

curl -sS -b "$COOKIE_JAR" "$BASE_URL/api/vehicles" | node -pe 'const j=JSON.parse(fs.readFileSync(0,"utf8")); console.log("vehicles:", (j.vehicles||[]).length)'

echo "-- fillups: create + list"
FILLUP_ID=$(curl -sS -b "$COOKIE_JAR" -X POST "$BASE_URL/api/fillups" \
  -H 'content-type: application/json' \
  -d "{\"vehicleId\":\"$VEHICLE_ID\",\"occurredAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"odometer\":120000,\"fuelAmount\":45.2,\"totalCost\":7040,\"currency\":\"EUR\",\"isFullTank\":true}" \
  | node -pe 'JSON.parse(fs.readFileSync(0,"utf8")).fillUp.id')
echo "FILLUP_ID=$FILLUP_ID"

curl -sS -b "$COOKIE_JAR" "$BASE_URL/api/fillups?vehicleId=$VEHICLE_ID" | node -pe 'const j=JSON.parse(fs.readFileSync(0,"utf8")); console.log("fillUps:", (j.fillUps||[]).length)'

echo "-- driver + trip"
DRIVER_ID=$(curl -sS -b "$COOKIE_JAR" -X POST "$BASE_URL/api/drivers" \
  -H 'content-type: application/json' \
  -d '{"name":"Driver A"}' \
  | node -pe 'JSON.parse(fs.readFileSync(0,"utf8")).driver.id')
echo "DRIVER_ID=$DRIVER_ID"

TRIP_ID=$(curl -sS -b "$COOKIE_JAR" -X POST "$BASE_URL/api/trips" \
  -H 'content-type: application/json' \
  -d "{\"vehicleId\":\"$VEHICLE_ID\",\"driverId\":\"$DRIVER_ID\",\"startedAt\":\"$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ)\",\"endedAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"odometerStart\":120000,\"odometerEnd\":120100,\"notes\":\"smoke\"}" \
  | node -pe 'JSON.parse(fs.readFileSync(0,"utf8")).trip.id')
echo "TRIP_ID=$TRIP_ID"

curl -sS -b "$COOKIE_JAR" "$BASE_URL/api/trips?vehicleId=$VEHICLE_ID" | node -pe 'const j=JSON.parse(fs.readFileSync(0,"utf8")); console.log("trips:", (j.trips||[]).length)'

echo "-- reports/monthly"
curl -sS -b "$COOKIE_JAR" "$BASE_URL/api/reports/monthly?vehicleId=$VEHICLE_ID" | node -pe 'const j=JSON.parse(fs.readFileSync(0,"utf8")); console.log("months:", (j.months||[]).length)'

echo "OK"
