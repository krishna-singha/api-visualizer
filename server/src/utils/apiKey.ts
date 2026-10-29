import crypto from "crypto";

// Format: avz-<40 base62 secret><6 base62 checksum>
const PREFIX = "avz-";
const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const SECRET_LENGTH = 40;
const CHECKSUM_LENGTH = 6;

const KEY_REGEX = new RegExp(`^${PREFIX}[0-9A-Za-z]{${SECRET_LENGTH + CHECKSUM_LENGTH}}$`);
const LEGACY_REGEX = /^[a-f0-9]{64}$/;

// randomInt avoids modulo bias
const randomBase62 = (length: number) =>
  Array.from({ length }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join("");

// Catches typos / fake keys without a DB lookup
const checksum = (secret: string) => {
  const hash = crypto.createHash("sha256").update(secret).digest();
  return Array.from(hash.subarray(0, CHECKSUM_LENGTH), (b) => ALPHABET[b % ALPHABET.length]).join("");
};

export const generateApiKey = () => {
  const secret = randomBase62(SECRET_LENGTH);
  return `${PREFIX}${secret}${checksum(secret)}`;
};

export const isValidApiKeyFormat = (key: unknown): key is string => {
  if (typeof key !== "string") return false;
  if (LEGACY_REGEX.test(key)) return true;
  if (!KEY_REGEX.test(key)) return false;

  const body = key.slice(PREFIX.length);
  return checksum(body.slice(0, SECRET_LENGTH)) === body.slice(SECRET_LENGTH);
};
