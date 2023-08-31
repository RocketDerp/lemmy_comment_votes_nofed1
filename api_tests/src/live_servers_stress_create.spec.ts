/*
test live servrer
*/
jest.setTimeout(6 * 60 * 60 * 1000);

import { API } from "./shared";
import {
  createTargetCommunity,
  loopActionSetB,
  manyPostsWithAFewCommentsSameCommunity,
  nestedCommentsOnMostRecentPostsSpecificCommunityA,
  postActionSetA,
  setTargetCommunityName,
} from "./shared_benchmark";
import {
  live_user0,
  setToBotAccount,
  setupLiveLogin,
} from "./shared_live_servers";

let the_account: API;

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

test(
  "set target community name",
  async () => {
    setTargetCommunityName("BT_test_quantity5");
  },
  60 * 1000,
);

test.skip(
  "create community and populate with some posts",
  async () => {
    console.log("independent concurrent start");
    const start = performance.now();

    await createTargetCommunity(live_user0);
    await loopActionSetB(live_user0, true, "BT_");

    const end = performance.now();
    const elapsed = end - start;
    expect(elapsed).toBeLessThan(40 * 1000);
    console.log("independent concurrent elapsed %d", elapsed);
  },
  3 * 60 * 1000,
);

// typically only one run of this is done in poduction, stay set to test.skip
test.skip(
  "create new target community",
  async () => {
    await createTargetCommunity(live_user0);
  },
  60 * 1000,
);

test.skip(
  "create posts with comment action in target community",
  async () => {
    await postActionSetA(live_user0, "BT_");
  },
  2 * 60 * 1000,
);

test.skip(
  "create many more posts in target community",
  async () => {
    await manyPostsWithAFewCommentsSameCommunity(live_user0);
  },
  2 * 60 * 60 * 1000,
);

test.skip(
  "create posts in target community, zero comments",
  async () => {
    // zero comments, 1500 posts
    await postActionSetA(live_user0, "MP_", 1500, 0);
  },
  2 * 60 * 60 * 1000,
);

test(
  "find top posts in target community and create many comments",
  async () => {
    console.log("independent concurrent start");
    const start = performance.now();

    await nestedCommentsOnMostRecentPostsSpecificCommunityA(live_user0);

    const end = performance.now();
    const elapsed = end - start;
    // expect(elapsed).toBeLessThan(40 * 1000);
    console.log("independent concurrent elapsed %d", elapsed);
  },
  4 * 60 * 60 * 1000,
);
