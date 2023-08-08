/*
With Lemmy 0.18.3 and earlier, performance has been a big concern.
Logging basic expectations of response times is the purpose of this module.

testing with threaded conversations reveals just how variable performance can be
particular patterns in the data are likely triggering comment rewrites
to update counts. So that's a lurking issue, a comment on a specific thread.
*/
jest.setTimeout(3 * 60 * 60 * 1000);

import {
  CreatePost,
  GetPosts,
  GetPostsResponse,
  PostResponse,
} from "lemmy-js-client";
import { alpha, setupLogins, createComment, getComments, getSite } from "./shared";
import {
  getCommentsOnMostRecentPosts,
  getPostsMax,
  getPostsNewMax2,
  loopActionSetA,
  manyCommunitiesManyPosts,
  nestedCommentsOnMostRecentPostsSpecificCommunityA,
  postActionSetA,
  resetTotal,
  setupBenchmarkLogins,
} from "./shared_benchmark";

beforeAll(async () => {
  await setupLogins();
  await setupBenchmarkLogins("0");
});

afterAll(async () => {});

test("benchmark creating an account", async () => {
  // alpha_user_casual0 = await registerUserClient(alpha, "alpha_casual0");
  await resetTotal();
});

// reference: https://stackoverflow.com/questions/58461792/timing-function-calls-in-jest
test.skip("benchmark baseline, inserts: community, discovery, follow, post, comment, vote", async () => {
  let timeTaken = await loopActionSetA(alpha, false, "fed");
  // 20 seconds is NOT good performance for 13 loops. I suggest 6 or even 1.3 seconds as a goal on empty database.
  expect(timeTaken).toBeLessThan(20 * 1000);
});

test.skip("benchmark baseline, same as last test, without federation", async () => {
  let timeTaken = await loopActionSetA(alpha, true, "nofed");
  expect(timeTaken).toBeLessThan(20 * 1000);
});

test.skip("may as well study the content", async () => {
  let posts = await getPostsMax(alpha, undefined, "New");
  expect(posts.posts.length).toBeGreaterThanOrEqual(10);

  for (let i = 0; i < posts.posts.length; i++) {
    let post = posts.posts[i];
    console.log(
      "%s %s %s",
      post.post.ap_id,
      post.post.local,
      post.post.community_id,
      post.post.name,
    );
  }
});

test.skip(
  "ceaate post on last created community",
  async () => {
    // community name is taken from last loopActionSetA create of community
    await postActionSetA(alpha, "alpharun0");
  },
  3 * 60 * 1000,
);

/*
This tries to create tiny comments to primarily exercise the PostgreSQL INDEX updates / INDEX scan behaviors.
*/
test.skip(
  "variability due to quantity of comments on post",
  async () => {
    let timeTaken = await nestedCommentsOnMostRecentPostsSpecificCommunityA(alpha);
  },
  2 * 60 * 60 * 1000,
);

/*
creates non-url posts, as they do not require outbound Internet and are faster.
*/
test(
  "variability due to quantity of posts and communities",
  async () => {
    let timeTaken = await manyCommunitiesManyPosts(alpha);
  },
  2 * 60 * 60 * 1000,
);

test.skip("benchmark baseline, reading: list posts", async () => {
  const start = performance.now();

  for (let i = 0; i < 50; i++) {
    let posts = await getPostsMax(alpha, undefined, "New");
    expect(posts.posts.length).toBeGreaterThanOrEqual(12);
  }

  const end = performance.now();
  expect(end - start).toBeLessThan(6 * 1000);
});

test.skip("benchmark baseline, reading: list posts 3 times", async () => {
  const start = performance.now();

  for (let i = 0; i < 3; i++) {
    let posts = await getPostsNewMax2(alpha);
    console.log("posts %d", posts.posts.length);
    expect(posts.posts.length).toBeGreaterThanOrEqual(12);
  }

  const end = performance.now();
  expect(end - start).toBeLessThan(4 * 1000);
});

test.skip("benchmark baseline, reading: comments off list of posts sorted by MostComments", async () => {
  const start = performance.now();

  await getCommentsOnMostRecentPosts();

  const end = performance.now();
  expect(end - start).toBeLessThan(12 * 1000);
});

test("site counts", async () => {
  let siteRes = await getSite(alpha);
  let c = siteRes.site_view.counts;
  console.log("getSite counts, comments %d posts %d communities %d", c.comments, c.posts, c.communities);
});
