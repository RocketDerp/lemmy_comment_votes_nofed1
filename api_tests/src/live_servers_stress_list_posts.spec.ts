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
  target_server,
} from "./shared_live_servers";

beforeAll(async () => {
  await setupLiveLogin();
  // do NOT set as bot account for read-only "list posts" operations.
  console.log("NOT setting as bot account for read-only testing");
});

afterAll(async () => {
  // ToDo: does lemmy not have a logout call to kill token?
});

let anonymous_user0: API;

test(
  "using logged-in account, confirm live user info",
  async () => {
    let siteRes = await live_user0.client.getSite({ auth: live_user0.auth });
    console.log(
      "getSite user info %s",
      siteRes.my_user?.local_user_view.person.name,
    );
    expect(siteRes.my_user?.local_user_view.person.name).toBe(live_user0name);

    // flip NSFW setting
    let doSet = false;
    if (doSet) {
      let settingsResult = await live_user0.client.saveUserSettings({
        show_nsfw: false,
        bio: "BulletinTree.com testing user. EDIT000",
        auth: live_user0.auth,
      });
    }
  },
  2 * 60 * 60 * 1000,
);

test(
  "setup not-logged-in, anonymous user. set targetCommunityName",
  async () => {
    // no login performed, no jwt in auth
    let client = new LemmyHttp(target_server);
    anonymous_user0 = {
      client: client,
      auth: "",
    };

    // setTargetCommunityName("BT_test_quantity1");
    // setTargetCommunityName("BT_test_quantity2");   // the real problem one
    // setTargetCommunityName("BT_test_quantity3");
    // setTargetCommunityName("BT_test_quantity4");
    setTargetCommunityName("BT_test_quantity5");
  },
  60 * 1000,
);

test(
  "using logged-in account, query target community by new",
  async () => {
    await getPostsForTargetCommunity(live_user0, 5, "New");
  },
  2 * 60 * 60 * 1000,
);

test(
  "using anonymous account, query target community by new",
  async () => {
    await getPostsForTargetCommunity(anonymous_user0, 5, "New");
  },
  2 * 60 * 60 * 1000,
);

test(
  "using logged-in account, query target community by Hot",
  async () => {
    await getPostsForTargetCommunity(live_user0, 5, "Hot");
  },
  2 * 60 * 60 * 1000,
);

test(
  "using anonymous account, query target community by Hot",
  async () => {
    await getPostsForTargetCommunity(anonymous_user0, 5, "Hot");
  },
  2 * 60 * 60 * 1000,
);
