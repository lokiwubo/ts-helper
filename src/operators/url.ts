import { get, set } from "lodash-es";

import type { ExtractDynamicUrlParams } from "../types/extract";
import type { AnyLike, RecordLike } from "../types/like";
import type {
  DynamicUrlReplaceParams,
  ExtractUrlQuery,
  ParseRecordUrlQuery,
} from "../types/url";
import { filterNonNullish } from "./array";

/**
 * @example
 *  queryStringify({a: 1, b: [2, 3], c: undefined}) // "a=1&b=2&b=3"
 */
export function queryStringify<T extends RecordLike>(obj: T) {
  const query: string[] = [];
  if (obj) {
    for (const key in obj) {
      const value = obj[key];
      if (value === undefined) continue;
      (filterNonNullish([value].flat()) as Array<AnyLike>).forEach(
        (item: unknown) => {
          query.push(
            "".concat(
              encodeURIComponent(key),
              "=",
              encodeURIComponent(`${item}`),
            ),
          );
        },
      );
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
 *  fillDynamicUrlParams("/users/:id", {id: 123}) // "/users/123"
 * @param {string } path - 路由路劲 如 "/users/:id"
 * @param {Record<string, string>} params - 路由参数 如 {id: 123}
 */
export function dynamicUrlReplaceParams<
  T extends `${string}:${string}` | string,
  U extends ExtractDynamicUrlParams<T> & RecordLike,
>(
  path: T,
  params: { [K in U & string]: string },
): DynamicUrlReplaceParams<T, U> {
  return path.replace(/:([^/]+)/g, (match, key: U) => {
    return params[key] !== undefined ? `${params[key]}` : match;
  }) as AnyLike;
}
/**
 * @description 移除对象中值为undefined的属性
 * @param {object} obj
 */
export function removeUndefinedFromObject<T extends RecordLike>(obj: T): T {
  return Object.keys(obj).reduce((acc: Partial<T>, key) => {
    if (obj[key] !== undefined) {
      (acc as RecordLike)[key] = obj[key];
    }
    return acc;
  }, {} as Partial<T>) as T;
}

/**
 * @description 创建带查询参数的url
 * @param {string} url
 * @param {RecordLike} query
 * @returns {string}
 * @todo 暂时确实对 url 进行了处理比如自带query的情况，后续需要优化 和自带 ? 或者以?结尾的情况
 */
export const createQueryUrl = <
  const TUrl extends string,
  const TQuery extends RecordLike,
>(
  url: TUrl,
  query: TQuery,
) => {
  const urlObj = new URL(url!, window.location.origin);
  const filterNonNullQuery = removeUndefinedFromObject(query);
  return `${urlObj.pathname}?${urlObj.searchParams.toString()}${queryStringify(filterNonNullQuery)}`
    .replace(/&&/g, "&")
    .replace(/\?\?+/g, "?")
    .replace(/\/\/+/g, "/") as `${TUrl}?${ParseRecordUrlQuery<TQuery>}`;
};

/**
 * @description 创建带参数的url 支持params 和query
 * @param url
 * @param options
 * @returns
 */
export const createUrl = (
  url: string,
  options?: {
    query: RecordLike;
    params?: RecordLike;
  },
) => {
  const { params, query = {} } = options ?? {};
  const reg = new RegExp(`/:(\\w+)`, "ig");
  const isDynamicUrl = reg.test(url);
  let draftUrl = url;
  if (isDynamicUrl) {
    if (params) {
      draftUrl = dynamicUrlReplaceParams(draftUrl, params);
    } else {
      throw new Error("params is required");
    }
  }
  return createQueryUrl(draftUrl, query);
};
