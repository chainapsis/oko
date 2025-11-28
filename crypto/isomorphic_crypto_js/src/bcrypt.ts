import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const KNOWN_HASH_FROM_0000 =
  "$2b$12$oeJW.1OD.SgMVPkmq1mm4.XpDC7JKeIFOJsixJbuRjcauvCj5/6ki";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
