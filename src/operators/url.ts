import { RecordLike } from "@/lib/like";
import { ParseRecordUrlQuery, ParseUrlQueryString } from "@/lib/url";
import { get, isArray, set } from "lodash-es";

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

export function parseQueryString<T extends string>(
  value: T,
): ParseUrlQueryString<T> {
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
