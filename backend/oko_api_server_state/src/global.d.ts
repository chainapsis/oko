import type { ServerState } from "./";

declare global {
  namespace Express {
    interface Locals extends ServerState { }
  }
}

export { };
