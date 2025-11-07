import { postLog } from "@oko-wallet-attached/requests/logging";

export function initErrorLogging() {
  window.addEventListener("error", (event) => {
    if (event.error) {
      postLog({
        level: "error",
        message: event.message,
        error: {
          name: event.error?.name || "Error",
          message: event.error?.message || event.message,
          stack: event.error?.stack,
          fileName: event.filename,
          lineNumber: event.lineno,
          columnNumber: event.colno,
        },
      });
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    postLog({
      level: "error",
      message: String(event.reason),
      error: {
        name: "UnhandledRejection",
        message: String(event.reason),
        stack: event.reason?.stack,
      },
    });
  });
}

export function errorToLog(error: any) {
  return {
    name: error?.name || "Error",
    message: error?.message || "Unknown error",
    stack: error?.stack,
  };
}
