//前置补0
export function repairStartZero(value: number, length: number) {
  return `${value}`.padStart(length, "0");
}
//后置补0
export function repairEndZero(value: number, length: number) {
  return `${value}`.padEnd(length, "0");
}
