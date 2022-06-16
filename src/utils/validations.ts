// userID:
// Compose of uppercase, lowercase, or number
// Length: 5 ~ 20
const userIDRegExp = /^[0-9a-zA-Z]{5,20}$/;

// password:
// Compose of uppercase, lowercase, and number
// and each of them appears more than once.
// Length: 5 ~ 20
const passwordRegExp = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])^[0-9a-zA-Z]{5,20}$/;

// !!! CAUTION !!!
// Return true when validation FAILS.
// This behavior aims to make it easy to write so-called "early return" patterns.
// So do NOT use "!" to write fail condition.
export class IsNOTvalid {
  private static isString = (param: any): boolean => {
    if (typeof param === "string") {
      return true;
    }
    return false;
  };

  private static isFalcy = (param: any): boolean => {
    if (!param) {
      return true;
    }
    return false;
  };

  private static isNonEmptyString = (param: any): boolean => {
    if (this.isString(param) && !this.isFalcy(param)) {
      return true;
    }
    return false;
  };

  private static baseValidation = (param: any, regexp: RegExp): boolean => {
    if (!this.isNonEmptyString(param)) {
      return false;
    }
    const doesMatch = regexp.test(param);
    if (!doesMatch) return false;
    return true;
  };

  static userID = (userID: any): boolean => {
    return !this.baseValidation(userID, userIDRegExp);
  };

  static password = (password: any): boolean => {
    return !this.baseValidation(password, passwordRegExp);
  };

  static sessionID = (sessionID: any): boolean => {
    return !this.isNonEmptyString(sessionID);
  };
}
