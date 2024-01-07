import { PushOptions, Queue } from "../abstract-queue";
import AWS from "aws-sdk";

export abstract class SQS<T> implements Queue<T> {
  private sqs: AWS.SQS;
  private queueUrl: string;

  constructor(queueUrl: string) {
    AWS.config.update({ region: "us-east-1" });

    this.sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
    this.queueUrl = queueUrl;
  }

  private async receiveMessageAsync(params: AWS.SQS.ReceiveMessageRequest) {
    return new Promise<AWS.SQS.ReceiveMessageResult>((resolve, reject) => {
      this.sqs.receiveMessage(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve(data);
      });
    });
  }

  private async deleteMessageAsync(params: AWS.SQS.DeleteMessageRequest) {
    return new Promise<void>((resolve, reject) => {
      this.sqs.deleteMessage(params, (err, _) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }

  private async sendMessageAsync(params: AWS.SQS.SendMessageRequest) {
    return new Promise<AWS.SQS.SendMessageResult>((resolve, reject) => {
      this.sqs.sendMessage(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve(data);
      });
    });
  }

  private async processMessages(
    messages: AWS.SQS.Message[],
    callback: (message: T) => void | Promise<void>
  ) {
    const processMessage = async (message: AWS.SQS.Message) => {
      console.log(
        `[${SQS.name}] processing message with id ${message.MessageId}`
      );

      try {
        await callback(JSON.parse(message.Body as string));

        const deleteParams: AWS.SQS.DeleteMessageRequest = {
          QueueUrl: this.queueUrl,
          ReceiptHandle: message.ReceiptHandle as string,
        };

        await this.deleteMessageAsync(deleteParams);

        console.log(
          `[${SQS.name}] message with id ${message.MessageId} deleted successfully`
        );
      } catch (error) {
        console.error(
          `[${SQS.name}] error processing message with id ${message.MessageId}: ${error}`
        );
      }
    };

    // Use Promise.all to process messages concurrently
    await Promise.all(messages.map(processMessage));
  }

  private async pollMessages(callback: (message: T) => void | Promise<void>) {
    try {
      const params: AWS.SQS.ReceiveMessageRequest = {
        MaxNumberOfMessages: 10,
        QueueUrl: this.queueUrl,
        WaitTimeSeconds: 5,
      };

      const data = await this.receiveMessageAsync(params);

      if (!data.Messages || data.Messages.length === 0) {
        console.log(`[${SQS.name}] no messages found!`);
      } else {
        await this.processMessages(data.Messages, callback);
      }

      // Continue polling
      await this.pollMessages(callback);
    } catch (error) {
      console.error(
        `[${SQS.name}] error listening to messages due to: ${error}`
      );
    }
  }

  async push(message: T, options?: PushOptions): Promise<void> {
    const params: AWS.SQS.SendMessageRequest = {
      DelaySeconds: options?.delaySeconds || undefined,
      MessageBody: JSON.stringify(message),
      QueueUrl: this.queueUrl,
    };

    try {
      const data = await this.sendMessageAsync(params);

      console.log(
        `[${SQS.name}] message ${data.MessageId} pushed successfully`
      );
    } catch (error) {
      console.error(
        `[${SQS.name}] error pushing message ${message} due to: ${error}`
      );
    }
  }

  listen(callback: (message: T) => void | Promise<void>): void {
    this.pollMessages(callback);
  }
}
