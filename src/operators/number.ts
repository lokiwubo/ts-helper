//前置补0
export function repairStartZero(value: number, length: number) {
  return `${value}`.padStart(length, "0");
}
//后置补0
export function repairEndZero(value: number, length: number) {
  return `${value}`.padEnd(length, "0");
}

export function isFloat(value: unknown): boolean {
  return (
    typeof value === "number" && isFinite(value) && Math.floor(value) !== value
  );
}

export function isInteger(value: unknown): boolean {
  return (
    typeof value === "number" && isFinite(value) && Math.floor(value) === value
  );
}

export function isNumber(value: unknown): boolean {
  return typeof value === "number" && isFinite(value);
}
