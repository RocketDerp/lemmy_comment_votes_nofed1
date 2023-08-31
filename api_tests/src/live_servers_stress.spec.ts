/*
test live servrer
*/
jest.setTimeout(4 * 60 * 60 * 1000);

import { API } from "./shared";
import {
  loopActionSetB,
  nestedCommentsOnMostRecentPostsSpecificCommunityA,
} from "./shared_benchmark";
import {
  getCommentsOnMostRecentPostsLive,
  live_user0,
  setToBotAccount,
  setupLiveLogin,
} from "./shared_live_servers";

let the_account: API;
let runSet = Array.from(Array(3).keys());
//runSet = Array(25).fill(null);

beforeAll(async () => {
  the_account = await setupLiveLogin();
});

afterAll(async () => {
  // ToDo: does lemmy not have a logout call to kill token?
});

test(
  "because live server, confirm account is set to bot",
  async () => {
    await setToBotAccount(the_account);
  },
  60 * 1000,
);

test.skip(
  "independent read concurrent first",
  async () => {
    console.log("independent concurrent start");
    const start = performance.now();

    await getCommentsOnMostRecentPostsLive();

    const end = performance.now();
    const elapsed = end - start;
    expect(elapsed).toBeLessThan(40 * 1000);
    console.log("independent concurrent elapsed %d", elapsed);
  },
  60 * 1000,
);

if (false) {
  test.concurrent.each(runSet)(
    "read concurrent",
    async runIndex => {
      console.log("runIndex %d start", runIndex);
      const start = performance.now();

      await getCommentsOnMostRecentPostsLive();

      const end = performance.now();
      const elapsed = end - start;
      expect(elapsed).toBeLessThan(40 * 1000);
      console.log("runIndex %d elapsed %d", runIndex, elapsed);
    },
    60 * 1000,
  );
}

test.skip(
  "independent read concurrent last",
  async () => {
    console.log("independent concurrent start");
    const start = performance.now();

    await getCommentsOnMostRecentPostsLive();

    const end = performance.now();
    const elapsed = end - start;
    expect(elapsed).toBeLessThan(40 * 1000);
    console.log("independent concurrent elapsed %d", elapsed);
  },
  60 * 1000,
);

test.skip(
  "create community and populate with some posts",
  async () => {
    console.log("independent concurrent start");
    const start = performance.now();

    await loopActionSetB(live_user0, true, "BT_");

    const end = performance.now();
    const elapsed = end - start;
    expect(elapsed).toBeLessThan(40 * 1000);
    console.log("independent concurrent elapsed %d", elapsed);
  },
  2 * 60 * 1000,
);

test(
  "find top posts in target community and comment",
  async () => {
    console.log("independent concurrent start");
    const start = performance.now();

    await nestedCommentsOnMostRecentPostsSpecificCommunityA(live_user0);

    const end = performance.now();
    const elapsed = end - start;
    expect(elapsed).toBeLessThan(40 * 1000);
    console.log("independent concurrent elapsed %d", elapsed);
  },
  15 * 60 * 1000,
);
