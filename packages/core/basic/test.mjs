import { random } from "lodash-es";
import { locker } from "./dist/utils/util.lock.js";

async function testLocker() {
  for (let i = 0; i < 10; i++) {
    await locker.execute("test", async () => {
      console.log("test", i);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
      throw new Error("test error");
    });
  }
}

await testLocker();
