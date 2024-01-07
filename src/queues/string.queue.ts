import { SQS } from "../integrations/sqs.integration";

export class StringQueue extends SQS<string> {
  constructor() {
    super(process.env.STRING_QUEUE_URL!);
  }
}
