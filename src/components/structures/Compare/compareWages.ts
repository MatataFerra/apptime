export type CompareInput = {
  itemValue?: string;
  itemQuantity?: string;
  hourlyWage?: string;
  hoursWorked?: string;
  minutesWorked?: string;
};

export type CompareResult = {
  production: number;
  hourly: number;
  /** "production" | "hourly" | "even", or null when nothing is filled in. */
  winner: "production" | "hourly" | "even" | null;
  difference: number;
  /** Pieces needed to match the hourly pay; null without a price per piece or hourly pay. */
  piecesToMatch: number | null;
};

function num(v?: string) {
  return Number(v) || 0;
}

export function compareWages(input: CompareInput): CompareResult {
  const production = num(input.itemValue) * num(input.itemQuantity);
  const hours = num(input.hoursWorked) + num(input.minutesWorked) / 60;
  const hourly = Math.round(num(input.hourlyWage) * hours * 100) / 100;
  const price = num(input.itemValue);

  const winner =
    production === 0 && hourly === 0
      ? null
      : production === hourly
        ? "even"
        : production > hourly
          ? "production"
          : "hourly";

  return {
    production,
    hourly,
    winner,
    difference: Math.abs(production - hourly),
    piecesToMatch: price > 0 && hourly > 0 ? Math.ceil(hourly / price) : null,
  };
}
