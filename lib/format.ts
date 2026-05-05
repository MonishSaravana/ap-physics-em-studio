export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const formatNumber = (
  value: number,
  digits = 2,
  fallback = "0"
): string => {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  if (Math.abs(value) >= 1000) {
    return value.toFixed(0);
  }

  if (Math.abs(value) < 0.01 && value !== 0) {
    return value.toExponential(2);
  }

  return value.toFixed(digits);
};

export const signed = (value: number, digits = 2): string => {
  const formatted = formatNumber(value, digits);
  if (value > 0) {
    return `+${formatted}`;
  }
  return formatted;
};

export const degToRad = (deg: number): number => (deg * Math.PI) / 180;
