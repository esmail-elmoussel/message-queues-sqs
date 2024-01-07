import { StringQueue } from "../queues/string.queue";

const stringQueue = new StringQueue();

let pass = false;

setTimeout(() => {
  pass = true;
}, 15000);

stringQueue.listen((message) => {
  console.log("Handle message logic here...", message);

  if (message !== "Hello 2") {
    return;
  }

  if (pass) {
    return;
  }

  throw new Error("Something went wrong...");
});

stringQueue.push("Hello 1");

setTimeout(() => {
  stringQueue.push("Hello 2");
}, 2000);

setTimeout(() => {
  stringQueue.push("Hello 3");
}, 4000);
