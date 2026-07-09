export function calculateStopPoints(entry: number, stop: number): number {
  return Math.abs(entry - stop);
}

export function calculateRiskPerContract(stopPoints: number, pointValue: number): number {
  return stopPoints * pointValue;
}

export function calculateContractsAllowed(maxRisk: number, riskPerContract: number): number {
  if (riskPerContract <= 0) return 0;
  return Math.floor(maxRisk / riskPerContract);
}

export function calculatePotentialLoss(contracts: number, riskPerContract: number): number {
  return contracts * riskPerContract;
}
