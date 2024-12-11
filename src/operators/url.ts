import { get, isArray, set } from "lodash";
import { AnyLike, RecordLike } from "../types/like";
import {
  ExtractUrlParams,
  ExtractUrlQuery,
  ParseRecordUrlQuery,
} from "../types/url";

/**
 * @example
 *  queryStringify({a: 1, b: [2, 3], c: undefined}) // "a=1&b=2&b=3"
 */
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

/**
 * @example
 *  extractQueryString("a=1&b=2&b=3") // {a: "1", b: ["2", "3"]}
 */
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
  return param as AnyLike;
}

/**
 * @example
 *  fillPathWithParams("/users/:id", {id: 123}) // "/users/123"
 */
export function fillPathWithParams<
  T extends string,
  U extends ExtractUrlParams<T>,
>(path: T, params: { [K in U & string]: string }): string {
  return path.replace(/:([^/]+)/g, (match, key: U) => {
    return params[key] !== undefined ? `${params[key]}` : match;
  });
}
