import type { Result } from "@oko-wallet/stdlib-js";

import type { EventEmitError, EventHandlerType, EventType } from "./types";

export class EventEmitter3<E extends EventType, H extends EventHandlerType> {
  listeners: {
    [K in E["type"]]?: H["handler"][];
  };

  constructor() {
    this.listeners = {};
  }

  on<T extends E["type"]>(handlerDef: H) {
    const { handler, type } = handlerDef;

    if (typeof handler !== "function") {
      throw new TypeError(
        `The "handler" argument must be of type function. \
Received ${handler === null ? "null" : typeof handler}`,
      );
    }

    if (this.listeners[type as T] === undefined) {
      this.listeners[type as T] = [];
    }
    (this.listeners[type as T] as H["handler"][]).push(handler);
  }

  emit<T extends E["type"]>(event: E): Result<void, EventEmitError> {
    const { type, ...rest } = event;
    console.log("[oko] emit, type: %s", type);

    const handlers = this.listeners[type as T];

    if (handlers === undefined) {
      return {
        success: false,
        err: {
          type: "handler_not_found",
          event_type: type,
        },
      };
    }

    for (let idx = 0; idx < handlers.length; idx += 1) {
      try {
        const handler = handlers[idx];
        handler(rest);
      } catch (err: any) {
        return {
          success: false,
          err: { type: "handle_error", error: err.toString() },
        };
      }
    }

    return { success: true, data: void 0 };
  }

  off<T extends E["type"]>(handlerDef: H) {
    const { type, handler } = handlerDef;

    const handlers = this.listeners[type as T];
    if (handlers === undefined) {
      return;
    }

    const index = handlers.indexOf(handler);
    if (index === -1) {
      return;
    }

    handlers.splice(index, 1);

    if (handlers.length === 0) {
      delete this.listeners[type as T];
    }
  }
}
