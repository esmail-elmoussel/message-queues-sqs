import { Queue } from "./abstract-queue";

/**
 * Basic In-Memory Queue for Numbers
 */
export class NumberQueue implements Queue<number> {
  private queue: number[] = [];

  push(message: number): void {
    console.log(`[${NumberQueue.name}] sending message: ${message}`);
    this.queue.push(message);
  }

  listen(callback: (message: number) => Promise<void> | void): void {
    setInterval(async () => {
      if (this.queue.length > 0) {
        const item = this.queue[0];

        try {
          await callback(item);

          this.queue.shift();
        } catch (err) {
          console.error(
            `[${NumberQueue.name}] error processing queue item: ${item} due to error: ${err}`
          );
        }
      }
    }, 1000);
  }
}
