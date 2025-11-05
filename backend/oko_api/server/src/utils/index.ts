export function getSecondsFromNow(start: number): number {
  return (Date.now() - start) / 1000;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
