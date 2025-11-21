import { randomBytes } from "crypto";

export function generatePassword(length: number = 16): string {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  const charset = lower + upper + numbers;

  const requiredChars = [
    lower[randomBytes(1)[0] % lower.length],
    upper[randomBytes(1)[0] % upper.length],
    numbers[randomBytes(1)[0] % numbers.length],
  ];

  const remainingLength = length - requiredChars.length;
  const resultChars = [];
  const maxValidByte = Math.floor(256 / charset.length) * charset.length;

  while (resultChars.length < remainingLength) {
    const byte = randomBytes(1)[0];
    if (byte >= maxValidByte) {
      continue;
    }
    resultChars.push(charset[byte % charset.length]);
  }

  const merged = [...requiredChars, ...resultChars];

  for (let i = merged.length - 1; i > 0; i--) {
    let j: number;
    while (true) {
      const rand = randomBytes(1)[0];
      const maxValidForRange = Math.floor(256 / (i + 1)) * (i + 1);
      if (rand >= maxValidForRange) {
        continue;
      }
      j = rand % (i + 1);
      break;
    }
    [merged[i], merged[j]] = [merged[j], merged[i]];
  }

  return merged.join("");
}
