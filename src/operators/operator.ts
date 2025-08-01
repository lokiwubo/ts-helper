import type { AnyLike } from "../types/like";

/**
 * @description 定义数据处理操作方法 
 * @param {TInput} value 要处理的数据
 * @example const result = defineOperator(10).pie((value, { map }) =>
    map((value) => `${value}` ),
  ).value; // "10"
 */
export const defineOperator = <const TInput>(value: TInput) => {
  const createOperator = <const TValue>(value: TValue) => ({
    map: <const TOutput>(action: (value: TValue) => TOutput): TOutput => {
      return action(value);
    },
  });
  const createActions = <const TValue>(value: TValue) => {
    return {
      pie: <
        TAction extends (
          value: TValue,
          operators: ReturnType<typeof createOperator<TValue>>,
        ) => AnyLike,
      >(
        doAction: TAction,
      ) => {
        const result = doAction(
          value,
          createOperator(value),
        ) as ReturnType<TAction>;
        return createActions(result);
      },
      get value() {
        return value as TValue;
      },
    };
  };
  return createActions(value);
};
