export interface PostLogBody {
  level: "error" | "warn" | "info";
  message: string;
  timestamp: string;

  error?: {
    name: string;
    message: string;
    stack?: string;
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
  };

  session?: {
    sessionId?: string;
    pageUrl?: string;
    email?: string;
    customerId?: string;
  };

  clientInfo: {
    userAgent: string;
    platform: string;
    screen: {
      width: number;
      height: number;
    };
  };

  meta?: Record<string, any>;
}

export interface PostLogResponse {
  ingestedAt: string;
}
