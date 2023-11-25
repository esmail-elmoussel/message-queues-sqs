export interface PushOptions {
  delaySeconds?: number;
}

export abstract class Queue<T> {
  abstract push(message: T, options?: PushOptions): void;

  abstract listen(callback: (message: T) => Promise<void> | void): void;
}
