import {
  Queue as BullQueue,
  ConnectionOptions,
  Job,
  QueueOptions,
  RedisConnection,
  Worker,
} from "bullmq";
import { PushOptions, Queue } from "../abstract-queue";

export abstract class BullMQ<T> implements Queue<T> {
  private queue: BullQueue;
  private queueName: string;
  private worker: Worker;
  private processMessage?: (message: T) => void | Promise<void> | void;

  constructor({
    queueName,
    options,
    connection,
  }: {
    queueName: string;
    options: QueueOptions;
    connection?: typeof RedisConnection;
  }) {
    this.queue = new BullQueue<T, void>(queueName, options, connection);
    this.queueName = queueName;
    this.worker = this.createWorker(options.connection);

    this.retryFailedJobs();
  }

  private retryFailedJobs = async () => {
    const failedJob = await this.queue.getFailed();

    console.log({ failedJobIds: failedJob.map((job) => job.id) });
  };

  private createWorker = (
    connection: ConnectionOptions
  ): Worker<T, void, string> => {
    const worker = new Worker<T, void>(
      this.queueName,
      async (job: Job<T, void>) => {
        if (!this.processMessage) {
          throw new Error("processMessage is undefined!");
        }

        try {
          console.log(`[${BullMQ.name}] processing message with id ${job.id}`);

          await this.processMessage(job.data);
        } catch (error) {
          console.error(
            `[${BullMQ.name}] error processing message with id ${job.id}: ${error}`
          );

          throw error;
        }
      },
      { autorun: false, connection }
    );

    worker.on("error", (err) => {
      console.error(err);
    });

    return worker;
  };

  async push(message: T, options?: PushOptions): Promise<void> {
    try {
      const data = await this.queue.add(this.queueName, message, {
        delay: options?.delaySeconds,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 10,
        backoff: {
          type: "exponential",
          delay: 10000,
        },
      });

      console.log(`[${BullMQ.name}] message ${data.id} pushed successfully`);
    } catch (error) {
      console.error(
        `[${BullMQ.name}] error pushing message ${message} due to: ${error}`
      );
    }
  }

  listen(callback: (message: T) => void | Promise<void>): void {
    try {
      this.processMessage = callback;

      this.worker.run();
    } catch (error) {
      console.error(
        `[${BullMQ.name}] error listening to messages due to: ${error}`
      );
    }
  }
}
