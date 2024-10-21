import { ReturnPromiseArray } from "../lib/array";

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

export const cachePromise = function <T>(promiseFunc: () => Promise<T>) {
  let cache: Promise<T> | null = null;
  return function () {
    if (!cache) {
      cache = promiseFunc();
    }
    return cache;
  };
};

export async function delay<T, U = T extends () => unknown ? ReturnType<T> : T>(
  ms: number,
  value: T,
): Promise<U> {
  return new Promise((resolve) =>
    setTimeout(resolve, ms, typeof value === "function" ? value() : value),
  );
}

export async function limitPromise<T extends (() => Promise<unknown>)[]>(
  tasks: T,
  limit: number,
): Promise<ReturnPromiseArray<T>> {
  const results: Promise<unknown>[] = [];
  const runningTasks: Promise<unknown>[] = [];
  for (const task of tasks) {
    const resultPromise = task();
    results.push(resultPromise);
    const overallPromise = Promise.resolve(resultPromise).then(
      () => runningTasks.splice(runningTasks.indexOf(overallPromise), 1),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;
    runningTasks.push(overallPromise);
    if (runningTasks.length >= limit) {
      await Promise.race(runningTasks);
    }
  }
  await Promise.all(runningTasks);
  return Promise.all(results) as unknown as Promise<ReturnPromiseArray<T>>;
}
