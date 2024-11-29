import { get, isArray, set } from "lodash";
import { RecordLike } from "../types/like";
import {
  ExtractParam,
  ExtractUrlQuery,
  ParseRecordUrlQuery,
} from "../types/url";

export function queryStringify<T extends RecordLike>(obj: T) {
  const query = [];
  if (obj) {
    for (const key in obj) {
      const value = obj[key];
      if (value === undefined) continue;
      if (isArray(value)) {
        value.forEach((item: unknown) => {
          query.push("".concat(key, "=", `${item}`));
        });
      } else {
        query.push("".concat(key, "=", `${value}`));
      }
    }
  }
  return query.join("&") as ParseRecordUrlQuery<T>;
}

export function extractQueryString<T extends string>(
  value: T,
): ExtractUrlQuery<T> {
  const param = {};
  value.split("&").forEach((item) => {
    const [key, value] = item.split("=");
    if (key && get(param, key) === undefined) {
      set(param, key, value);
    } else {
      if (key) set(param, key, [get(param, key), value].flat());
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return param as any;
}

export function fillPathWithParams<T extends string, U extends ExtractParam<T>>(
  path: T,
  params: { [K in keyof U]: unknown },
): string {
  return path.replace(/:([^/]+)/g, (match, key: keyof U) => {
    return params[key] !== undefined ? `${params[key]}` : match;
  });
}
