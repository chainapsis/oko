import * as amplitude from "@amplitude/analytics-browser";

let isInitialized = false;

export function initAmplitude(): void {
  const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY;

  if (!apiKey) {
    console.warn("[attached] Amplitude. API key not found");

    return;
  }

  if (isInitialized) {
    return;
  }

  console.log("[attached] Amplitude init");

  amplitude.init(apiKey, {
    defaultTracking: false,
  });

  isInitialized = true;
}

export function setUserId(userId: string): void {
  if (!isInitialized) {
    return;
  }

  amplitude.setUserId(userId);
}

export function setUserProperties(properties: Record<string, any>): void {
  if (!isInitialized) {
    return;
  }

  const identifyEvent = new amplitude.Identify();

  for (const [key, value] of Object.entries(properties)) {
    identifyEvent.set(key, value);
  }

  amplitude.identify(identifyEvent);
}

export function trackEvent(
  eventName: string,
  eventProperties?: Record<string, any>,
): void {
  if (!isInitialized) {
    return;
  }

  amplitude.track(eventName, eventProperties);
}
