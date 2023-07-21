/*
   Grand Tour
   In July 2023, Lemmy is dealing with the aftermath of explosive growth to over 1,300 instances (servers).
   Previous testing was mostly focused on a subscribing intance (alpha) making sure it updated the home instance (beta) of a community.
   This takes a more holistic approach:
      New community, making sure it can be followed by remote instances
      Putitng posts in that new community, making sure they replicate
      Putting comments into those new posts, making sure they replicate
      Making sure moderators on remote instances can do actions that reach all the subscribed instances.

   ToDo: have an admin API call to induce outbound federation failures such as an Internet outage or unreachable peer instance.
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
  getPostsCID
} from "./shared";
import { CommentView } from "lemmy-js-client/dist/types/CommentView";
import * as comparison from "./shared_comparison"
import { PostView } from "lemmy-js-client/dist/types/PostView";
import * as multi from "./shared_multi_instances";



beforeAll(async () => {
  await setupLogins();
});

afterAll(async () => {
});


test("create community", async () => {
  await multi.createCommunityOnBeta("grandtour");
});

test("follow community and validate", async () => {
  await multi.followValidateBetaCommunity();
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
  await multi.commentUpvoteOnAlpha(2);
});

test("Delete the upvoted comment", async () => {
  await multi.deleteCommentOnAlpha();
});

test("Undelete the deleted comment", async () => {
  await multi.undeleteCommentOnAlpha();
});

test("add a new comment to the same post, ensure count of commenbts equal", async () => {
  await multi.createCommentOnAlphaPost(2);
});

test("admin comment removal of just-added comment", async () => {
  await multi.setFocusGammaCommentFromAlpha();
  await multi.adminCommentRemovalFromGamma();
});

test("undo admin comment removal", async () => {
});


/*
ToDo: consider counting the reports on all 3 servers before adding the new one
      previous tests might have already left things inconsistent?
*/
test("create new post and comment, report the comment", async () => {
  await multi.reportBetaCommentOnAlpha();
});

test("establish community with remote moderator", async () => {
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
  */
});
