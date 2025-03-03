import dayjs from "dayjs";
import type { DateLike } from "../types";

const unitMap = {
  year: 365 * 24 * 60 * 60 * 1000, // 年
  month: 30 * 24 * 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000, // 天
  hour: 60 * 60 * 1000, // 小时
  minute: 60 * 1000, // 分钟
  second: 1000, // 秒
  millisecond: 1, // 毫秒
};
type TimeUnit = keyof typeof unitMap;

export type TimeUnitType = `${number}${TimeUnit | Uppercase<TimeUnit>}`;

export const isTimeUnit = (timeUnit: unknown): timeUnit is TimeUnitType => {
  return typeof timeUnit === "string" && /^(\d+)([a-zA-Z]+)$/.test(timeUnit);
};

export function getSecondsByTimeUnit(timeString: TimeUnitType) {
  const match = timeString.match(/^(\d+)([a-zA-Z]+)$/);
  if (!match) {
    throw new Error("Invalid time string format");
  }
  const value = parseInt(match[1]!, 10);
  const unit = match[2]!.toLowerCase();

  if (!(unit in unitMap)) {
    throw new Error("Unknown time unit");
  }
  return value * unitMap[unit as TimeUnit];
}

export const getTimeDifference = (startTime: DateLike, endTime?: DateLike) => {
  const start = dayjs(startTime);
  const now = dayjs(endTime);
  const diffInMinutes = now.diff(start, "minute");
  const diffInDays = now.diff(start, "day");
  const diffInMonths = now.diff(start, "month");

  if (diffInMinutes < 60) {
    return `${diffInMinutes} 分钟`;
  } else if (diffInDays < 30) {
    return `${diffInDays} 天`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} 个月`;
  } else {
    // 相差年数
    return `${now.diff(start, "year")} 年`;
  }
};
