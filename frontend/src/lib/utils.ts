import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculatePercentChange(currentValue: number, baselineValue: number) {
  if (
    !Number.isFinite(currentValue) ||
    !Number.isFinite(baselineValue) ||
    baselineValue <= 0
  ) {
    return 0;
  }

  return ((currentValue - baselineValue) / baselineValue) * 100;
}

type SignedPercentOptions = {
  currentValue?: number;
  baselineValue?: number;
};

export function formatSignedPercent(
  value: number,
  { currentValue, baselineValue }: SignedPercentOptions = {},
) {
  const hasComparableValues =
    typeof currentValue === "number" &&
    typeof baselineValue === "number" &&
    Number.isFinite(currentValue) &&
    Number.isFinite(baselineValue) &&
    baselineValue > 0;

  const percent = hasComparableValues
    ? calculatePercentChange(currentValue, baselineValue)
    : Number.isFinite(value)
      ? value
      : 0;

  const sign = hasComparableValues
    ? currentValue > baselineValue
      ? "+"
      : currentValue < baselineValue
        ? "-"
        : ""
    : percent > 0
      ? "+"
      : percent < 0
        ? "-"
        : "";

  const magnitude = Math.abs(percent);
  const decimals =
    magnitude === 0 ? 2 : magnitude < 0.0001 ? 6 : magnitude < 0.01 ? 4 : 2;

  return `${sign}${magnitude.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}
