import crypto from "crypto";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SPECIAL = "!@#$%^&*()_+[]{}|;:,.<>?";
const ALL = UPPER + LOWER + DIGITS + SPECIAL;

function cryptoRandomInt(maxExclusive: number): number {
  const buf = new Uint32Array(1);
  crypto.randomFillSync(buf);
  return buf[0] % maxExclusive;
}

function secureShuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const generateRandomPassword = (length = 12): string => {
  const minLength = Math.max(length, 8);

  const required = [
    UPPER[cryptoRandomInt(UPPER.length)],
    LOWER[cryptoRandomInt(LOWER.length)],
    DIGITS[cryptoRandomInt(DIGITS.length)],
    SPECIAL[cryptoRandomInt(SPECIAL.length)],
  ];

  const remaining = minLength - required.length;
  const rest: string[] = [];
  for (let i = 0; i < remaining; i++) {
    rest.push(ALL[cryptoRandomInt(ALL.length)]);
  }

  return secureShuffle([...required, ...rest]).join("");
};