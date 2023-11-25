import { NumberQueue } from "./queues/number.queue";

const numberQueue = new NumberQueue();

let pass = false;

setTimeout(() => {
  pass = true;
}, 5000);

numberQueue.listen((message) => {
  console.log(`[${NumberQueue.name}] processing message: ${message}`);

  if (message !== 2) {
    return;
  }

  if (pass) {
    return;
  }

  throw new Error("Something went wrong...");
});

numberQueue.push(1);
numberQueue.push(2);
numberQueue.push(3);
