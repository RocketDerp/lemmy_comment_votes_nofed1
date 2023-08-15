/*
Intention here is to create some content
using non-admin accounts.
Try to use screenshot worthy user names, community, posts.
Perhaps try to run this before all other tests
   to have tests assume certain content / counting is done.
   Also by running first, a predictable set of id values for content.
   And detecting changes in id generation behavior.
*/
jest.setTimeout(20 * 60 * 1000);

import { alpha, setupLogins } from "./shared";
import {
  sim_create_accounts,
  sim_create_communities,
  sim_create_reply_comments_to_posts,
  sim_create_stress_test_communities,
  sim_create_welcome_posts,
  sim_follow_two_communities,
  sim_join_personal_communities,
  sim_users_update_profile,
} from "./shared_simulation";

beforeAll(async () => {
  await setupLogins();
});

afterAll(async () => {});

test(
  "create usernames",
  async () => {
    await sim_create_accounts(alpha);
  },
  3 * 60 * 1000,
);

test(
  "create communities",
  async () => {
    await sim_create_communities();
  },
  3 * 60 * 1000,
);

test(
  "users update their profile",
  async () => {
    await sim_users_update_profile();
  },
  3 * 60 * 1000,
);

test(
  "all follow 2 communities",
  async () => {
    await sim_follow_two_communities();
  },
  3 * 60 * 1000,
);

test(
  "all follow personal communities",
  async () => {
    await sim_join_personal_communities();
  },
  3 * 60 * 1000,
);

test(
  "create welcome posts by members",
  async () => {
    await sim_create_welcome_posts();
  },
  15 * 60 * 1000,
);

/*
Another approach is to load a list of posts in /c/welcome
  and reply by each user to those.
*/
test(
  "replies and upvotes to welcome posts by members",
  async () => {
    await sim_create_reply_comments_to_posts();
  },
  15 * 60 * 1000,
);

test(
  "create stress-test communities",
  async () => {
    await sim_create_stress_test_communities();
  },
  3 * 60 * 1000,
);
