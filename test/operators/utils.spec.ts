import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { createConditionOperator } from "../../src/operators/utils";

describe("create", () => {
  const conditionOperator = createConditionOperator(() => ({
    a: 1,
  }));
  beforeEach(() => {
    // 每次执行test 都会去重新执行
    console.log(1111);
  });
  beforeAll(() => {
    console.log("beforeAll");
  });
  test("should set a to 1 when condition is met", () => {
    let a = 0;
    conditionOperator
      .when((value) => value.a === 1)
      .action(() => {
        a = 1;
      });
    conditionOperator.some();
    expect(a).toBe(1);
  });
  test("data 数组应为空数组", () => {
    expect(2).toEqual(2);
  });
});
