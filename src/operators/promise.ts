import { AnyLike } from "../types";
import { ReturnPromiseArray } from "../types/array";

/**
 * @description 执行Promise执行出错添加重试机制
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
 */
export const timeoutPromise = async <T extends () => Promise<T>>(
  asyncFn: () => Promise<T>,
  time: number,
) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("Promise timed out"));
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
