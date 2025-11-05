export type PostLogParams = InfoLog | ErrorLog;

export type LogBase = {
  level: "info" | "error";
  message: string;
  session?: {
    sessionId?: string;
    email?: string;
    customerId?: string;
  };
  meta?: Record<string, any>;
};

export type InfoLog = LogBase & {
  level: "info";
};

export type ErrorLog = LogBase & {
  level: "error";
  error: {
    name: string;
    message: string;
    stack?: string;
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
  };
};
