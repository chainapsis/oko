declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SERVER_PORT: string;
      NEXT_PUBLIC_OKO_API_ENDPOINT: string;
    }
  }
}

// Ensures this file is treated as a module (necessary if esm)
export {};
