/*
   remote_to_remote - from The North Pole to The South Pole, where the communuity is homed at the equator.
   In July 2023, Lemmy is dealing with the aftermath of explosive growth to over 1,300 instances (servers).
   Previous testing was mostly focused on a subscribing intance (alpha) making sure it updated the home instance (beta) of a community.
   This takes a more holistic approach:
      New community, making sure it can be followed by remote instances
      Putitng posts in that new community, making sure they replicate
      Putting comments into those new posts, making sure they replicate
      Making sure moderators on remote instances can do actions that reach all the subscribed instances.

   ToDo: have an admin API call to induce outbound federation failures such as an Internet outage or unreachable peer instance.
   ToDo: down server, blinking server availability, testing. We need API to fail federation outbound.
         take connection down, create post, bring connection up, create comment on post, race condition?
         severs all up, create post on alpha on beta community, take down alpha, moderatoe post on gamma, bring up alpha
*/
jest.setTimeout(180000);

import {
  alpha,
  beta,
  gamma,
  delta,
  epsilon,
  setupLogins,
  createPost,
  createNoLinkPost,
  getPost,
  getPosts,
  findPostGetComments,
  resolveComment,
  likeComment,
  followBeta,
  followCommunity,
  resolveBetaCommunity,
  createComment,
  editComment,
  deleteComment,
  removeComment,
  getMentions,
  resolvePost,
  unfollowRemotes,
  createCommunity,
  registerUser,
  reportComment,
  listCommentReports,
  randomString,
  API,
  unfollows,
  getComments,
  getCommentParentId,
  resolveCommunity,
  checkInbandError,
  getCommunity,
  getPostsCID,
} from "./shared";
import { CommentView } from "lemmy-js-client/dist/types/CommentView";
import * as comparison from "./shared_comparison";
import { PostView } from "lemmy-js-client/dist/types/PostView";
import * as multi from "./shared_multi_instances";

beforeAll(async () => {
  await setupLogins();
});

afterAll(async () => {});

test.skip("create non-admin end-user login all instances", async () => {
  // await multi.createNonAdminUsersAllInstances();
});

test("create community 'myfirst' with admin login on beta", async () => {
  await multi.createCommunityOnBeta("myfirst");
});

test("follow 'myfirst' community and validate on all instances", async () => {
  await multi.followValidateBetaCommunity();
});

test("create community 'grandtour' with end-user login", async () => {
  // switchuser call?
  await multi.createCommunityOnBeta("grandtour");
});

test("follow 'grandtour' community and validate on all instances", async () => {
  await multi.followValidateBetaCommunity();
});

test.skip("list community and compare all instances", async () => {
  // community list and count comparison
});

test("Internet test (create a post with url link)", async () => {
  await multi.createLinkPostInAlphaCommunity();
});

test("Create a post in grandtour community", async () => {
  await multi.createNonLinkPostInAlphaCommunity();
});

// ToDo: run steps inside function in a loop and create 5 comments with the random comment?
test("Create a comment on alpha for the GrandTour post", async () => {
  await multi.createCommentOnAlphaPost(1);
});

test("Edit the comment created in previous test", async () => {
  await multi.editCommentOnAlpha(1);
});

test("upvote comment that was edited in previous test", async () => {
  // the same user upvoting their own comment, won't increase score
  await multi.commentUpvoteOnAlpha(1);
});

test("Delete the upvoted comment", async () => {
  await multi.deleteCommentOnAlpha();
});

test("Undelete the deleted comment", async () => {
  await multi.undeleteCommentOnAlpha();
});

test("add new comment to the same post, ensure count of comments equal", async () => {
  await multi.createCommentOnAlphaPost(2);
});

test("admin comment removal of just-added comment", async () => {
  // NOTE: change in 0.18.3 behavior is intentional
  //       https://github.com/LemmyNet/lemmy/issues/3652#issuecomment-1645696038
  await multi.setFocusGammaCommentFromAlpha();
  await multi.adminCommentRemovalFromGamma();
});

test.skip("undo admin comment removal", async () => {
  // ToDo:
});

test.skip("instance admin powers spanning instances, viewing deleted content", async () => {
  // Many people have established in ther mind the concept of an "admin" from monolytic system
  //   of Reddit-like communities. With federation in the Lemmy version 0.18 era, an admin has no powers
  //   outside their own instance. Or do they? What are expectations, and this testing code serves
  //   to try and make sure changes in behavior are documented by testing said behaviors.
  //
  // The post.spec.ts "Delete a post" does venture into federation testing:
  //   https://github.com/LemmyNet/lemmy/blob/102124b6d29edd7d799ee12a6f6df05dbbbf4f6c/api_tests/src/post.spec.ts#L246C14-L246C14
  // But it also does what in July 2023 most of the tests in this suite do, it uses accounts
  //   that are admins of servers. Should an admin be able to view a tombstone of a post?
  //   Is that a backend lemmy API restriction or a front-end lemmy-ui level behavior choice?
  //   Changes between 0.18.2 and 0.18.3 are such that posts are no longer returned by this API and
  //      that choice to show user-deleted and moderator-removed posts and comments is no longer in the hands
  //      of lemmy-ui or other API clients.
  //   Further, in some of the established tests in 0.18.2 - attention isn't given to which account
  //      created the community being tested, and would the moderator of a community be able to fetch
  //      a post that was admin-removed or moderator-removed?
  //      Often the tests are done with a simplistic asumption that a getPost() function call by the API
  //      client is being done as a kind of anonymous end-user, but that's not what is happening.
  //      This remote_to_remote federation is concerned to examine actual behavior with testing.
});

test.skip("behaviors spanning instances, banned from community remove-data option", async () => {
  // the ban from community call has a data-remove option
  // create a user, create content on all 3 servers, try with and without option.
});

test.skip("behaviors spanning instances, a user removes their account", async () => {
  // In Lemmy version 0.18.2 - a user who deletes their own comment or post has the option
  //   to undelete/undo/restore that content.
  //   Deleting the entire account is supposed to, in real-time, purge comment and post content.
  //   (NOTEWORTHY: Sites like Facebook oftgen have a grace period due to end-users in social conflict
  //      making rash choices and wanting their account restored the next day)
  // Another situation is federation subscription to communities
  //   Create a new end-user on alpha, "bright_candle_a"
  //   have beta establish a new beta community "beta_new_a"
  //   subscribe "bright_candle_a" on alpha to the "beta_new_a" community remotely. They will be sole subscriber on alpha to "beta_new_a"
  //   Create a new post and comment in "beta_new_a" on beta
  //   delete the newly created end-user on alpha, without unsubscribing from "beta_new_a" first
  //   create a new post and comment in "beta_new_a" on beta
  //   Study the community on alpha if new content delivered.
  // This code aims to demonstrate how Lemmy behaves with testing code.
});

test.skip("behaviors spanning instances, delete of an entire community", async () => {
  // Masive database transactions and social impact
});

test.skip("behaviors spanning instances, delete of an entire instance", async () => {
  // Masive database transactions and social impact
  // API call, DeleteInstance for admins
  //   controlled removal of entire instance persons, subscribes, communities
});

test.skip("behaviors spanning instances, federation outbound when subscriber count reaches zero", async () => {
  // create a function to collect count of posts in a specific community on all servers
  // create a function to collect count of comments in a specific ommunity on all servers
  // Create a new community on beta "beta_new_b"
  // Follow that community on alpha, 1 subscriber on gamma
  // Create a post on alpha, create a comment on beta
  // Follow that community on gamma, 1 subscriber on gamma
  // Create a post on alpha, create a comment on gamma
  // Create a post on gamma
  // Unfollow on gamma, zero subscribers on gamma
  // Create a post on gamma
  // Create a comment on gamma
  // Create a post on alpha
  // Unfollow on alpha, zero subscribers on alpha
  // Create a post on alpha
  // Create a post on beta
});

test.skip("behaviors spanning instances, recycle of names", async () => {
  // what happens after user deletes an account on an instance, can same username be picked again?
  // what happens after a community is deleted, can same community be picked again?
  // API clients who cash id numbers for community and users...?
});

test.skip("hiding a community", async () => {
// https://join-lemmy.org/api/interfaces/HideCommunity.html
await multi.createCommunityOnBeta("myfirst");

});

/*
ToDo: consider counting the reports on all 3 servers before adding the new one
      previous tests might have already left things inconsistent?
*/
test("report the comment", async () => {
  await multi.reportBetaCommentOnAlpha();
});

test.skip("resolve report on the comment", async () => {
  // beta is moderator of community, that's easiest to start with for actor?
  // ToDo: test resolving the report on gamma, then validated resolve status on alpha
});

test.skip("comment reply notification from two remote instances", async () => {
  // community is homed on beta, which requires alpha to traverse beta to reach gamma
  // create a comment on alpha, then reply to comment on gamma, hitting all 3 instances
  // also try to block the community from alpha, create another reply on gamma, see if notificaiton blocked too.
  //   see issue: https://github.com/LemmyNet/lemmy/issues/3684
});

test.skip("establish community with remote moderator", async () => {
  /*
  1. create a new user on instance beta
  2. create community modtesting on instance beta
  3. create a new user on instance alpha: alphamod0
  4. alphamod0 follow modtesting@beta
  5. gamma create gamauser0
  6. have gamauser0 follow modtesting@beta
  7. make alphamod0 a renote mod of community modtesting
  8. list mods on community from gamma using gamauser0
  9. gamauser0 make new post and comment in modtesting@beta
  10. alphamod0 remove the comment created by gamauser0
  11. alphamod0 remove the post ccreated by gamauser0
  12. alphamod0 community feature a post from gamauser0
  13. alphamod0 lock a post from gamauser0

  Also: a comment can be flagged as 'speaking as moderator'
  https://github.com/LemmyNet/lemmy/issues/3705
  */
});

test.skip("spot-check some unauthenticated user behaviors", async () => {
  // probably needs own config file, but this spans posts and comments, so central code here is of use.
  // add a test for: https://github.com/LemmyNet/lemmy/pull/3689
});

test.skip("registered bot accounts, disallowing voting", async () => {
  // https://lemm.ee/post/1847525?scrollToComments=true
});

test.skip("remote community orphan activity check", async () => {
  // what happens when...
  //    a user on a local server roams into a remote community without ever subscribing.
  //    waht if the subscriber count has gone to zero on the local server or federation has
  //    been blocked. Should comments and posts into such a remote-homed community be allowed?
  //    The focus here is todocument actaul tested behavior and know when code changes
  //    impact that behavior.
  //    Questions to ponder while writing testing code:
  //       1. when subscriber count goes to zero for an instance, does the community go stale?
  //       2. when an admin adds a block to a community, how does it behavior during block?
  //       3. If a block is lifted, does it return to normal flow of incoming delivery?
  //       4. Are outbound and inbound both impacted equally in these situations?
});

test.skip("behavior checks on replies to comments", async () => {
  // 1. common community on beta
  // 2. beta federates with delta and alpha
  // 3. alpha does not fedlerate with delta
  // 4. user on alpha creates comment
  // 5. user on delta replies to comment
  // 6. user on beta replies to delta comment
  // 7. does alpha any replies to their comment?
});


test.skip("total loss of an established Lemmy instance, behavior with new install on same domain identity", async () => {
  // Nuke a server and start it over on empty database with same domain name
/*
I'm a bit confused in conceiving what you are describing. The users and communities are in your database, but only the comments and posts are gone?

I do wonder how Lemmy behaves when a server on the same domain is fresh-installed more than once... do other instances recognize it. There are encryption signing keys used in the process, but I've seen no discussion of someone having lost a server and what happened with using the same domain name and trying to re-integrate. ap_id for post/comment would start to be the same given how Lemmy uses integer keys that start from zero. Person records could get pretty confusing.
*/
});

test.skip("behavior study of a new user account on one instance being shared to peer instances", async () => {
// https://lemmy.ml/post/2494393?scrollToComments=true

// does fetching profile of an instance trigger loading from remote instance?
//  the test may automatically pas because it does?
});

https://github.com/LemmyNet/lemmy/issues/3781
test.skip("moderator reports to all instances", async () => {
// assumption that a communuty must be subscrived for moderator reports to replicate
  });

  // https://lemmy.ml/post/2649346
  // bot accounts and notification problems
  