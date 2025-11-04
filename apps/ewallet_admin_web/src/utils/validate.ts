export const PASSWORD_MIN_LEN = 8;

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

export function isValidEmail(email?: string): boolean {
  if (!email) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password?: string): boolean {
  if (!password) {
    return false;
  }

  return password.length >= PASSWORD_MIN_LEN;
}
