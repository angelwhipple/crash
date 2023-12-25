import { THIS_YEAR, VALID_DOMAINS } from "./types";

/**
 * HELPERS
 */

// PASSWORD CONSTRAINTS: len <= 8 chars, <= 1 special char, <= 1 letter, <= 1 number
const validatePassword = (pass: String): { ind: boolean; message: string } => {
  let invalid = false;
  if (pass.length < 8) {
    invalid = true;
    return { ind: invalid, message: "Password must be atleast 8 characters" };
  }
  if (pass.search(/[a-zA-Z]/g) === -1) {
    console.log(`Password missing letters`);
    invalid = true;
    return { ind: invalid, message: "Password must contain letter(s)" };
  }
  if (pass.search(/[0-9]/g) === -1) {
    console.log(`Password missing numbers`);
    invalid = true;
    return { ind: invalid, message: "Password must contain number(s)" };
  }
  if (pass.search(/[^a-zA-Z0-9]/g) === -1) {
    console.log(`Password missing special characters`);
    invalid = true;
    return { ind: invalid, message: "Password must contain special character(s)" };
  }
  return { ind: invalid, message: "" };
};
// AGE CONSTRAINT: age >= 16
const validateAge = (birthDate: string) => {
  const birthYear = parseInt(birthDate.substring(0, 4));
  const valid = THIS_YEAR - birthYear >= 16;
  return valid;
};
// USERNAME CONSTRAINTS: len >= 3, 0 special characters (REVISE)
const validateUsername = (user: string) => {
  // let alnumRegex = new RegExp(/^[a-z0-9]+$/, "i")
  let match = /^[a-z0-9]+$/i.test(user);
  return match && user.length >= 3;
};
// EMAIL CONSTRAINTS:
const validateEmail = (emailAddress: string): Boolean => {
  const valid = VALID_DOMAINS.filter((domain) => emailAddress.endsWith(domain));
  return valid.length !== 0;
};

export default {
  validateUsername,
  validatePassword,
  validateAge,
  validateEmail,
};
