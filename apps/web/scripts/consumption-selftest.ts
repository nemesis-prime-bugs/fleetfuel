import { computeFullTankConsumption } from "@/lib/fillups/consumption";

function main() {
  const fillUps = [
    { occurredAt: new Date("2026-01-01"), odometer: 1000, fuelAmount: 40, isFullTank: true },
    { occurredAt: new Date("2026-01-10"), odometer: 1200, fuelAmount: 10, isFullTank: false },
    { occurredAt: new Date("2026-01-20"), odometer: 1400, fuelAmount: 35, isFullTank: true },
  ];

  const r = computeFullTankConsumption(fillUps);
  if (r.length !== 1) throw new Error("expected 1 result");
  const c = r[0]!;
  // Distance 400, fuelUsed = (10 + 35) = 45, consumption = 11.25/100
  if (Math.abs(c.distance - 400) > 0.001) throw new Error("distance mismatch");
  if (Math.abs(c.fuelUsed - 45) > 0.001) throw new Error("fuel mismatch");
  if (Math.abs(c.consumptionPer100 - 11.25) > 0.01) throw new Error("consumption mismatch");

  // eslint-disable-next-line no-console
  console.log("consumption-selftest: OK");
}

try {
  main();
} catch (err) {
  // eslint-disable-next-line no-console
  console.error("consumption-selftest: FAIL", err);
  process.exit(1);
}
