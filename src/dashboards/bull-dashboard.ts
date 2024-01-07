import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import express from "express";
import { SMSQueue } from "../queues/sms.queue";

const smsQueue = new SMSQueue();

const run = async () => {
  const app = express();

  const serverAdapter = new ExpressAdapter();

  serverAdapter.setBasePath("/ui");

  createBullBoard({
    queues: [new BullMQAdapter(smsQueue.queue)],
    serverAdapter,
  });

  app.use("/ui", serverAdapter.getRouter());

  app.listen(3000, () => {
    console.log("Running on 3000...");
    console.log("For the UI, open http://localhost:3000/ui");
    console.log("Make sure Redis is running on port 6379 by default");
  });
};

run().catch((e) => console.error(e));
