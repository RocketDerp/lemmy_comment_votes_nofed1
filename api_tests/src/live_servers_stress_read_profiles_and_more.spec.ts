/*
test live servrer
*/
jest.setTimeout(6 * 60 * 60 * 1000);

import { LemmyHttp } from "lemmy-js-client";
import { API } from "./shared";
import {
  getPostsForTargetCommunity,
  setTargetCommunityName,
} from "./shared_benchmark";
import {
  live_user0,
  live_user0name,
  setupLiveLogin,
  showComments,
  target_server,
} from "./shared_live_servers";

beforeAll(async () => {
  await setupLiveLogin();
  // do NOT set as bot account for read-only "read profiles" operations.
  console.log("NOT setting as bot account for read-only testing");
});

afterAll(async () => {
  // ToDo: does lemmy not have a logout call to kill token?
});

let anonymous_user0: API;

test(
  "setup not-logged-in, anonymous user",
  async () => {
    // no login performed, no jwt in auth
    let client = new LemmyHttp(target_server);
    anonymous_user0 = {
      client: client,
      auth: "",
    };
  },
  60 * 1000,
);

export async function userProfileStudy(
  username: string,
  account: API = anonymous_user0,
) {
  // lemmy-ui uses limit 20 on profile
  let personResponse = await account.client.getPersonDetails({
    username: username,
    limit: 20,
    auth: account.auth,
  });
  expect(personResponse.person_view).toBeDefined();
  let pv = personResponse.person_view;
  console.log(
    "%s id %d counts: posts %d comments %d actual: posts %d comments %d moderates %d",
    pv.person.name,
    pv.person.id,
    pv.counts.post_count,
    pv.counts.comment_count,
    personResponse.comments.length,
    personResponse.posts.length,
    personResponse.moderates.length,
  );
  if (personResponse.comments) {
    // showComments(personResponse.comments);
  }
  return personResponse;
}

test(
  "using anonymous account, query profile RoundSparrow",
  async () => {
    let pr = await userProfileStudy("RoundSparrow");
    // console.log(pr);
  },
  2 * 60 * 1000,
);

// BT_User3 is notable because it has a huge subscribed community list
test(
  "using anonymous account, query profile BT_User3",
  async () => {
    let pr = await userProfileStudy("BT_User3");
  },
  2 * 60 * 1000,
);

test(
  "using anonymous account, query profile BT_StressData1",
  async () => {
    await userProfileStudy("BT_StressData1");
  },
  2 * 60 * 1000,
);

test(
  "using anonymous account, query profile BT_StressData0",
  async () => {
    await userProfileStudy("BT_StressData0");
  },
  2 * 60 * 1000,
);

test.skip(
  "using logged-in account, query profile BT_StressData0",
  async () => {
    await userProfileStudy("BT_StressData0", live_user0);
  },
  2 * 60 * 1000,
);
