declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SERVER_PORT: string;
      NEXT_PUBLIC_OKO_API_ENDPOINT: string;
      NEXT_PUBLIC_OKO_DOCS_ENDPOINT: string;
      NEXT_PUBLIC_OKO_DEMO_ENDPOINT: string;
      NEXT_PUBLIC_OKO_FEATURE_REQUEST_ENDPOINT: string;
      NEXT_PUBLIC_OKO_GET_SUPPORT_ENDPOINT: string;
      KEPLR_API_ENDPOINT: string;
    }
  }
}

// Ensures this file is treated as a module (necessary if esm)
export {};
