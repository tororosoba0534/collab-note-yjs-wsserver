import { IsNOTvalid } from "./validations";

describe("IsNOTvalid class static methods", () => {
  describe("IsNOTvalid.username", () => {
    describe("Good usernames", () => {
      it.each([["test1"], ["GOMES"], ["012344567"], ["01234567890123456789"]])(
        "%p",
        (username) => {
          expect(IsNOTvalid.username(username)).toBe(false);
        }
      );
    });

    describe("Bad usernames", () => {
      it.each([
        ["test"], // too short
        ["contains-symbol@"],
        ["012345678901234567890"], // too long
        [1234567], // not string
      ])("%p", (username) => {
        expect(IsNOTvalid.username(username)).toBe(true);
      });
    });
  });

  describe("IsNOTvalid.password", () => {
    describe("Good passwords", () => {
      it.each([["passWord1"]])("%p", (password) => {
        expect(IsNOTvalid.password(password)).toBe(false);
      });
    });

    // it("Good passwords", () => {
    //   const passwords = ["userName1"];
    //   passwords.forEach((password) => {
    //     expect(IsNOTvalid.password(password)).toBe(false);
    //   });
    // });

    describe("Bad passwords", () => {
      it.each([
        ["1aA"],
        ["tooLONG012345678901234567890"],
        ["WITH-symbol012@$"],
        ["withoutcapital1"],
        ["WITHOUTLITTLE2"],
        ["withoutNUMBERS"],
      ])("%p", (password) => {
        expect(IsNOTvalid.password(password)).toBe(true);
      });
    });

    // it("Bad passwords", () => {
    //   const passwords = [
    //     "1aA",
    //     "tooLONG012345678901234567890",
    //     "WITH-symbol012@$",
    //     "withoutcapital1",
    //     "WITHOUTLITTLE2",
    //     "withoutNUMBERS",
    //   ];
    //   passwords.forEach((password) => {
    //     expect(IsNOTvalid.password(password)).toBe(true);
    //   });
    // });
  });

  describe("IsNOTvalid.sessionID", () => {
    describe("Good sessionIDs", () => {
      it.each([["a328479f-8d8a-4bd6-be5e-d759b5370edb"]])("%p", (token) => {
        expect(IsNOTvalid.sessionID(token)).toBe(false);
      });
    });

    describe("Bad sessionIDs", () => {
      it.each([[""], [1234]])("%p", (token) => {
        expect(IsNOTvalid.sessionID(token)).toBe(true);
      });
    });

    // it("Good sessionIDs", () => {
    //   const tokens = ["a328479f-8d8a-4bd6-be5e-d759b5370edb"];
    //   tokens.forEach((token) => {
    //     expect(IsNOTvalid.sessionID(token)).toBe(false);
    //   });
    // });
    // it("Bad sessionIDs", () => {
    //   const tokens = ["", 1234];
    //   tokens.forEach((token) => {
    //     expect(IsNOTvalid.sessionID(token)).toBe(true);
    //   });
    // });
  });
});
