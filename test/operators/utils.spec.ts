import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe("create", () => {
  beforeEach(() => {
    // 每次执行test 都会去重新执行
    console.log(1111);
  });
  beforeAll(() => {
    console.log("beforeAll");
  });
  test("should set a to 1 when condition is met", () => {
    expect(1).toBe(1);
  });
  test("data 数组应为空数组", () => {
    expect(2).toEqual(2);
  });
});
