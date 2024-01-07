import { SMSQueue } from "../queues/sms.queue";

const smsQueue = new SMSQueue();

let pass = false;

// setTimeout(() => {
//   pass = true;
// }, 15000);

smsQueue.listen((message) => {
  if (message.body !== "Should fail for 15 seconds then success!") {
    return;
  }

  if (pass) {
    return;
  }

  throw new Error("Something went wrong...");
});

smsQueue.push({ phoneNumber: "+xxxxxxxxxxxx", body: "Should success!" });

setTimeout(() => {
  smsQueue.push({
    phoneNumber: "+xxxxxxxxxxxx",
    body: "Should fail for 15 seconds then success!",
  });
}, 2000);

setTimeout(() => {
  smsQueue.push({ phoneNumber: "+xxxxxxxxxxxx", body: "Should success also!" });
}, 4000);
