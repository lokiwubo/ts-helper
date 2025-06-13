import type { AnyLike } from "../types";

interface Step {
  /** 执行条件 */
  when?: () => boolean;
  /** 唯一标识 */
  key: string;
  /** 用来操作时后提示错误所在step名称 */
  name?: string;
  /** 条件成立时执行的动作 */
  action: (...ags: AnyLike[]) => AnyLike;
}
interface StepGroup {
  /** 唯一标识 */
  key: string;
  steps?: Step[];
  conditionAction: AllAction | RaceAction;
}

type AllAction = {
  type: "all";
  success: () => void;
  fail: () => void;
};
type RaceAction = {
  type: "race";
  success: () => void;
  fail: () => void;
};

/**
 * @description 希望支持多层级树结构的action
 * @description 用来执行actions
 * @param {ActionLike[]} actions
 */
export const execAction = <TActions extends StepGroup[]>(actions: TActions) => {
  const createContext = <TValue>(value: TValue) => {
    const contextKey = Symbol.for("context");
    return {
      [contextKey]: value,
      get value() {
        return this[contextKey];
      },
      set value(value) {
        this[contextKey] = value;
      },
    };
  };

  const createOperator = <TActions extends StepGroup[]>(actions: TActions) => {
    // 添加类似node 中对stream流的处理
    const _internalActions = [...actions];
    const eventEmitter = {
      drain: () => {},
      error: () => {},
      finish: () => {},
      write: () => {},
      emit: () => {},
      pause: () => {},
    };
    return {
      /**
       * serial: 按顺序串行执行
       * @returns {
       *  {
       *    output: [],
       *    error: null,
       *    isRun: boolean,
       *    name: "",
       *    config,
       *  }[]
       * }
       */
      serial: <TValue>(value?: TValue) => {
        const context = createContext(value);
        for (const action of actions) {
          if (action.where && !action.where()) {
            continue;
          }

          context.value = action.do(context.value);
        }
      },
      /**
       * 并行执行
       */
      parallel: <TValue>(value?: TValue) => {
        for (const action of actions) {
          if (action.where && !action.where()) {
            continue;
          }
          setTimeout(() => action.do(value));
        }
      },
      /**
       * parallel: 并行执行
       */
    };
  };
  return createOperator(actions);
};

export const definedAction = () => {
  const createAction = () => {
    return {
      get value() {
        return 1;
      },
    };
  };
  return createAction();
};
