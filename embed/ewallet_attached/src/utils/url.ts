export function removeLastSlashIfIs(str: string): string {
  if (str.length > 0 && str[str.length - 1] === "/") {
    return str.slice(0, str.length - 1);
  }

  return str;
}
