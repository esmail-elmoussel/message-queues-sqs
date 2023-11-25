import { SQS } from "./abstract-sqs";

export class StringQueue extends SQS<string> {
  constructor() {
    super(process.env.STRING_QUEUE_URL!);
  }
}
