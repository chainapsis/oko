import { randomBytes } from "crypto";

export function generatePassword(length: number = 16): string {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  const charset = lower + upper + numbers;

  const requiredChars = [
    lower[Math.floor(Math.random() * lower.length)],
    upper[Math.floor(Math.random() * upper.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
  ];

  const remainingLength = length - requiredChars.length;
  const bytes = randomBytes(remainingLength);

  const resultChars = [];
  for (let i = 0; i < remainingLength; i++) {
    resultChars.push(charset[bytes[i] % charset.length]);
  }

  const merged = [...requiredChars, ...resultChars];
  for (let i = merged.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [merged[i], merged[j]] = [merged[j], merged[i]];
  }

  return merged.join("");
}
