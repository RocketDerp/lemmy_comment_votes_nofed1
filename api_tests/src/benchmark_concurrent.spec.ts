/*
With Lemmy 0.18.3 and earlier, performance has been a big concern.
Logging basic expectations of response times is the purpose of this module.

testing with threaded conversations reveals just how variable performance can be
particular patterns in the data are likely triggering comment rewrites
to update counts. So that's a lurking issue, a comment on a specific thread.
*/
jest.setTimeout(60 * 60 * 1000);

import { CreatePost, GetPosts, GetPostsResponse, PostResponse } from "lemmy-js-client";
import {
  alpha,
  setupLogins,
  createComment,
} from "./shared";
import { alpha_user_casual0, getPostsNewMax, loopActionSetA, setupBenchmarkLogins } from "./shared_benchmark";

beforeAll(async () => {
  await setupLogins();
  await setupBenchmarkLogins("1");
});

afterAll(async () => {});


describe("my asynchronous tests", () => {
    beforeEach(async () => {
      console.log('> setup test')
      // SOMETHING ASYNCHRONOUS
    });
    afterEach(async () => {
      console.log('< teardown test')
      // SOMETHING ASYNCHRONOUS
    });
  
    test("test 1", async () => {
      console.log('-- starting test 1');
      // SOMETHING ASYNCHRONOUS
      console.log('-- finished test 1');
    }, 100000);
  
    test("test 2", async () => {
      console.log('-- starting test 2');
      // SOMETHING ASYNCHRONOUS
      console.log('-- finished test 2');
    }, 100000);

    // concurrent
    // Add an account delete concurrent
    test.concurrent("benchmark baseline, concurrent without federation A", async () => {
        console.log("starting concurrent A");
        let timeTaken = await loopActionSetA(alpha, true, "nofedA");
        // 20 seconds is NOT good performance for 13 loops. I suggest 6 or even 1.3 seconds as a goal on empty database.
    expect(timeTaken).toBeLessThan(20 * 1000);
    console.log("concurrent A", timeTaken);
    });
    test.concurrent("benchmark baseline, concurrent without federation B", async () => {
        console.log("starting concurrent B");
        let timeTaken = await loopActionSetA(alpha_user_casual0, true, "nofedB");
        expect(timeTaken).toBeLessThan(20 * 1000);
        console.log("concurrent B", timeTaken);
    });

  });

