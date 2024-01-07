import { Queue } from "../abstract-queue";

/**
 * Basic In-Memory Queue
 */
export abstract class InMemoryQueue<T> implements Queue<T> {
  private queue: T[] = [];

  push(message: T): void {
    console.log(`[${InMemoryQueue.name}] sending message: ${message}`);
    this.queue.push(message);
  }

  listen(callback: (message: T) => Promise<void> | void): void {
    setInterval(async () => {
      if (this.queue.length > 0) {
        const item = this.queue[0];

        try {
          await callback(item);

          this.queue.shift();
        } catch (err) {
          console.error(
            `[${InMemoryQueue.name}] error processing queue item: ${item} due to error: ${err}`
          );
        }
      }
    }, 1000);
  }
}
