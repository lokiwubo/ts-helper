import type { AnyLike } from "../types";
/**
 * @name recursionData
 * @description 递归遍历数据
 * @param  list
 * @param keys
 * @param cb
 */
// TODO

export const createHash = (data: AnyLike) => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `${hash.toString(32)}`;
};
