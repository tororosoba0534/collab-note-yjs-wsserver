import { IsNOTvalid } from "./validations";

describe("IsNOTvalid class static methods", () => {
  describe("userID", () => {
    it.each([
      ["test1", false],
      ["GOMES", false],
      ["123456", false],
      ["1234", true],
      ["12345678901234567890", false],
      ["123456789012345678901", true],
      ["username!", true],
    ])("input: %p, expect: %p", (param, result) => {
      expect(IsNOTvalid.userID(param)).toBe(result);
    });
  });

  describe("password", () => {
    it.each([
      ["Test1", false],
      ["Abc1", true],
      ["123456789012345678aB", false],
      ["123456789012345678aBc", true],
      ["passWord1", false],
      ["passWord", true],
      ["password1", true],
      ["PASSWORD1", true],
      ["passWord1!", true],
    ])("input: %p, expect: %p", (param, result) => {
      expect(IsNOTvalid.password(param)).toBe(result);
    });
  });
});
