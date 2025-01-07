import type { AnyLike } from "../types";
import type { ReturnPromiseArray } from "../types/array";
import type { TimeoutError } from "./shared";

/**
 * @description 执行Promise执行出错添加重试机制
 * @example
 * const fetchData = () => fetch("https://example.com/api/data").then((res) => res.json());
 * retryPromise(fetchData, 3).then((data) => console.log(data)); // 最多重试3次
 */
export const retryPromise = async <T extends () => Promise<T>>(
  promiseFunc: T,
  retries = 1,
): Promise<ReturnType<T>> => {
  const value = await new Promise((resolve, reject) => {
    const executePromise = () => {
      promiseFunc()
        .then(resolve)
        .catch((error) => {
          if (retries > 0) {
            retries--;
            executePromise();
          } else {
            reject(error);
          }
        });
    };
    executePromise();
  });
  return value as ReturnType<T>;
};

/**
 * @description 给执行Promise 添加有效执行时间否则会报错
 * @example
 * const fetchData = () => fetch("https://example.com/api/data").then((res) => res.json());
 * timeoutPromise(fetchData, 10000).then((data) => console.log(data)); // 超时时间为10s
 */
export const timeoutPromise = async <T extends () => Promise<T>>(
  asyncFn: () => Promise<T>,
  time: number,
) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new TimeoutError("Promise timed out"));
    }, time);
    asyncFn()
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};
/**
 * @description 缓存promise
 * @example
 * const getUserName = cachePromise(() => fetch("https://example.com/api/user").then((res) => res.json()));
 * getUserName().then((name) => console.log(name)); // 第一次请求，网络请求发送，结果缓存
 * getUserName().then((name) => console.log(name)); // 第二次请求，直接返回缓存结果
 */
export const cachePromise = function <T>(promiseFunc: () => Promise<T>) {
  let cache: Promise<T> | null = null;
  return function () {
    if (!cache) {
      cache = promiseFunc();
    }
    return cache;
  };
};
/**
 * @description 延迟 执行或者响应参数
 * @example
 * const delayHandler = () => console.log("delayHandler");
 * delay(1000, delayHandler).then(() => console.log("delayHandler after 1s")); // 1s后执行delayHandler
 */
export async function delay<T, U = T extends () => unknown ? ReturnType<T> : T>(
  ms: number,
  handler: T,
): Promise<U> {
  return new Promise((resolve) =>
    setTimeout(
      resolve,
      ms,
      typeof handler === "function" ? handler() : handler,
    ),
  );
}
/**
 * @description 限制并发执行promise 的数量
 * @example
 * const tasks = [
 *   () => Promise.resolve(1),
 *   () => Promise.resolve(2),
 *   () => Promise.resolve(3),
 *   () => Promise.resolve(4)]
 * limitPromise(tasks, 2).then((results) => console.log(results)); // 限制并发数量为2，结果为[1, 2, 3, 4]
 */
export async function limitPromise<
  TTask extends ((...args: AnyLike[]) => Promise<unknown>)[],
>(tasks: TTask, limit: number): Promise<ReturnPromiseArray<TTask>> {
  const results: unknown[] = new Array(tasks.length);
  const executing: Promise<void>[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]!;
    // 执行任务并保存结果
    const promise = task().then((result) => {
      results[i] = result; // 将结果按照任务顺序保存
    });

    executing.push(promise);

    // 控制并发数量
    if (executing.length >= limit) {
      await Promise.race(executing); // 等待任意一个Promise完成
      executing.splice(
        executing.findIndex((p) => p === promise),
        1,
      );
    }
  }
  // 等待所有tasks完成
  await Promise.all(executing);
  return results as ReturnPromiseArray<TTask>;
}
