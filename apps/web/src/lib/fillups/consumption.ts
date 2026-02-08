export type FillUpLike = {
  occurredAt: Date;
  odometer: number; // km or miles (consistent per vehicle)
  fuelAmount: number; // liters or gallons (consistent per vehicle)
  isFullTank: boolean;
};

export type ConsumptionResult = {
  distance: number;
  fuelUsed: number;
  consumptionPer100: number; // L/100km or gal/100mi
};

/**
 * Full-tank method:
 * - Only compute consumption between two fill-ups that are both marked full-tank.
 * - Distance is odometer delta.
 * - Fuel used is the sum of fuel amounts of fill-ups AFTER the previous full-tank up to and including the current full-tank.
 *
 * Assumptions (MVP):
 * - Odometer increases monotonically.
 * - Units are consistent per vehicle.
 * - If there are partial fill-ups, they are included in fuelUsed if they are between full-tank events.
 */
export function computeFullTankConsumption(fillUps: FillUpLike[]): ConsumptionResult[] {
  // Sort ascending by time.
  const sorted = [...fillUps].sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());

  const results: ConsumptionResult[] = [];

  let lastFull: FillUpLike | null = null;
  let fuelSinceLastFull = 0;

  for (const f of sorted) {
    if (lastFull) fuelSinceLastFull += f.fuelAmount;

    if (f.isFullTank) {
      if (lastFull) {
        const distance = f.odometer - lastFull.odometer;
        if (distance > 0) {
          const fuelUsed = fuelSinceLastFull;
          const consumptionPer100 = (fuelUsed / distance) * 100;
          results.push({ distance, fuelUsed, consumptionPer100 });
        }
      }
      lastFull = f;
      fuelSinceLastFull = 0;
    }
  }

  return results;
}
