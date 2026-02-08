export function formatDistance(km: number, isMetric: boolean): string {
  if (isMetric) {
    return `${km.toFixed(2)} km`;
  } else {
    const miles = km * 0.621371;
    return `${miles.toFixed(2)} mi`;
  }
}

export function formatWeight(kg: number, isMetric: boolean): string {
  if (isMetric) {
    return `${kg.toFixed(1)} kg`;
  } else {
    const lbs = kg * 2.20462;
    return `${lbs.toFixed(1)} lbs`;
  }
}

export function convertWeight(value: number, fromMetric: boolean, toMetric: boolean): number {
  if (fromMetric === toMetric) return value;
  if (fromMetric && !toMetric) return value * 2.20462; // kg to lbs
  return value / 2.20462; // lbs to kg
}

export function convertDistance(value: number, fromMetric: boolean, toMetric: boolean): number {
  if (fromMetric === toMetric) return value;
  if (fromMetric && !toMetric) return value * 0.621371; // km to miles
  return value / 0.621371; // miles to km
}
