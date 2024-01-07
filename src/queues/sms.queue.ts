import { hostname } from "os";
import { BullMQ } from "../integrations/bullmq.integration";
import { InMemoryQueue } from "../integrations/in-memory.integration";

interface SMS {
  phoneNumber: string;
  body: string;
}

export class SMSQueue extends BullMQ<SMS> {
  constructor() {
    super({
      queueName: "sms-queue",
      options: { connection: { host: "localhost", port: 6379 } },
    });
  }
}
