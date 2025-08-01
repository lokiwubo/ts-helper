import type { AnyLike } from "../types";
import { filterNonNullish } from "./array";

interface FlowStep {
  key: string;
  /** 执行条件 */
  when?: () => boolean;
  /** 用来操作时后提示错误所在step名称 */
  /** 条件成立时执行的动作 */
  do: (...ags: AnyLike[]) => AnyLike;
  actions?: FlowStep[];
}

/**
 * @description 希望支持多层级树结构的action
 * @description 用来执行actions
 * @param {ActionLike[]} actions
 */
export const definedWorkflow = () => {
  const stepMap = new Map<string, FlowStep>();
  type OperatorLike = {
    addStep: (step: FlowStep) => OperatorLike;
    removeStep: (keys: string | string[]) => void;
    hasStep: (key: string) => boolean;
    runSteps: () => void;
  };
  const operatorMap = new Map<string, OperatorLike>();
  const createAction = (parentFlow: FlowStep) => {
    const operator = {
      addStep: (step: FlowStep) => {
        stepMap.set(step.key, step);
        parentFlow.actions?.push(step);
        return createAction(step);
      },
      removeStep: (keys: string | string[]) => {
        const _keys = [keys].flat();
        parentFlow.actions = filterNonNullish(
          parentFlow.actions?.map((action) => {
            if (action.key && _keys.includes(action.key)) {
              stepMap.delete(action.key);
              operatorMap.delete(action.key);
              return undefined;
            } else {
              return action;
            }
          }) ?? [],
        );
      },
      hasStep: (key: string) => {
        return Boolean(
          parentFlow.actions?.find((action) => action.key === key),
        );
      },
      runSteps: () => {
        parentFlow.actions?.forEach((action) => {
          if (action.when?.() && action.do) {
            action.do();
          }
        });
      },
    };
    operatorMap.set(parentFlow.key, operator);
    return operator;
  };
  return createAction({
    actions: [],
    key: "root",
    do: () => {},
  });
};
