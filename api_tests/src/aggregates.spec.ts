jest.setTimeout(120000);

/*
This testing module forgoes many checks expectation checks on newly created items in favor of
   validating the final counts. Keeps the code simpler and easier to follow.
*/

import { CommentResponse, CommunityResponse, CommunityView, GetSiteResponse, PostResponse } from "lemmy-js-client";
import {
  alpha,
  beta,
  setupLogins,
  resolveBetaCommunity,
  followCommunity,
  unfollowRemotes,
  getSite,
  createPost,
  createComment,
  deletePost,
  deleteComment,
  registerUser,
  API,
  likeComment,
  likePost,
  deleteUser,
  createCommunity,
  resolveCommunity,
  getCommunity,
} from "./shared";

let betaCommunityOnAlpha: CommunityView | undefined;
let betaCommunityOnBeta: CommunityView | undefined;

beforeAll(async () => {
  await setupLogins();
  betaCommunityOnAlpha = (await resolveBetaCommunity(alpha)).community;
  expect(betaCommunityOnAlpha).toBeDefined();
  betaCommunityOnBeta = (await resolveBetaCommunity(beta)).community;
  expect(betaCommunityOnBeta).toBeDefined();
});

afterAll(async () => {
  await unfollowRemotes(alpha);
});

function consoleSomeA(
  outNote0: string,
  site: GetSiteResponse,
  community: CommunityView,
) {
  let sc = site.site_view.counts;
  let cc = community.counts;
  if (!site.my_user) {
    throw "missing my_user from site, not logged in?";
  }
  let uc = site.my_user.local_user_view.counts;
  let uf = site.my_user.follows;
  console.log(
    "%s S: comments %d posts %d users %d communities %d" +
      " C: %d %d %d active_day %d" +
      " U: %d %d - %d comment_score %d post_score %d cm %d",
    outNote0,
    sc.comments,
    sc.posts,
    sc.users,
    sc.communities,
    cc.comments,
    cc.posts,
    cc.subscribers,
    cc.users_active_day,
    uc.comment_count,
    uc.post_count,
    uf.length,
    0,
    uc.comment_score,
    uc.post_score,
  );

  // study the followers data, can we get server info out of this sites object?
  let followPiles0 = [];
  for (let i = 0; i < uf.length; i++) {
    let a = uf[i];
    followPiles0.push(
        a.community.name + " local " + a.community.local
    );
  }
  console.log(followPiles0);
}

function scrutinizeSiteValue(site: GetSiteResponse, value_index: number) {
  switch (value_index) {
    case 0:
      return site.admins.length;
    case 1:
      return site.admins[0].person.admin;
  }
  return false;
}

// some class-level variables that are used across functions
let siteCheck;
let alpha_joyce: API;
let alpha_mann: API;
let alpha_sam: API;
let alpha_joe: API;
let joyceFinnCommunity: CommunityView;
let enterShikariCommunity: CommunityView;
let postAlphaRes0: PostResponse;
let postAlphaResA0: PostResponse;
let postAlphaResA1: PostResponse;
let commentAlphaRes1: CommentResponse;
let commentAlphaRes2: CommentResponse;
let commentAlphaRes3: CommentResponse;
let commentAlphaRes4: CommentResponse;
let postAlphaRes1: PostResponse;
let commentAlphaResB0: CommentResponse;
let joeShackCommunity: CommunityView;
let joeShackPost0: PostResponse;
let userPile: API[] = [];
let postPile: PostResponse[] = [];
let commentPile: CommentResponse[] = [];


async function checkTheNumbers(outNote0: string) {
  // Check the numbers.
  let joyceFinnCommunityRes = await resolveCommunity(alpha, "!finnegans_wake@lemmy-alpha:8541");
  if (joyceFinnCommunityRes.community) {
    joyceFinnCommunity = joyceFinnCommunityRes.community;
  }
  if (!joyceFinnCommunity) {
    throw "resolveCommunity on joyceFinnCommunity failed from alpha";
  }
  siteCheck = await getSite(alpha);
  consoleSomeA(outNote0, siteCheck, joyceFinnCommunity);
}

test("establish fresh user alpha_joyce and community finnegans_wake", async () => {
  // create a non-admin user, Joyce
  let alphaJoyceLogin = await registerUser(alpha, "Joyce");
  expect(alphaJoyceLogin.jwt).toBeDefined();
  alpha_joyce = {
    // ToDo Investigate: what exactly does this mean using alpha's client? the same client URL? or more?
    client: alpha.client,
    auth: alphaJoyceLogin.jwt ?? "",
  };

  // Joyce creates community and posts in it
  joyceFinnCommunity = (await createCommunity(alpha_joyce, "finnegans_wake")).community_view;
  await createPost(alpha_joyce, joyceFinnCommunity.community.id);
  let alphaJoyceComment0Res = await createPost(alpha_joyce, joyceFinnCommunity.community.id);
  commentAlphaResB0 = await createComment(alpha, alphaJoyceComment0Res.post_view.post.id);
  await checkTheNumbers("++joyceFinnCommunity");
});

async function createTestUseActionSeries0(name: string) {
  // create a non-admin user
  let alphaDudeLoginRes = await registerUser(alpha, name);
  expect(alphaDudeLoginRes.jwt).toBeDefined();
  let alpha_dude = {
    // ToDo Investigate: what exactly does this mean using alpha's client? the same client URL? or more?
    client: alpha.client,
    auth: alphaDudeLoginRes.jwt ?? "",
  };

  let postAlphaDude0Res = await createPost(alpha_dude, joyceFinnCommunity.community.id);
  commentPile.push(await createComment(alpha_dude, postAlphaDude0Res.post_view.post.id));
  await likePost(alpha_dude, 1, postAlphaResA1.post_view.post);
  await likeComment(alpha_dude, 1, commentAlphaResB0.comment_view.comment);
  commentPile.push(await createComment(alpha_dude, postAlphaResA1.post_view.post.id));
  for (let i = 0; i < postPile.length; i++) {
    await likePost(alpha_dude, 1, postPile[i].post_view.post);
    await createComment(alpha_dude, postPile[i].post_view.post.id);
  }
  await checkTheNumbers("TUAS0");

  postPile.push(postAlphaDude0Res);

  return alpha_dude;
}

test("user alpha posts in joyceFinnCommunity", async () => {
  postAlphaResA1 = await createPost(alpha, joyceFinnCommunity.community.id);
  await checkTheNumbers("++post");
});

test("ActionSeries0 user snoopy", async () => {
  userPile.push(await createTestUseActionSeries0("snoopy"));
});

test("ActionSeries0 user woodstock", async () => {
  userPile.push(await createTestUseActionSeries0("woodstock"));
});

test("ActionSeries0 user spike", async () => {
  userPile.push(await createTestUseActionSeries0("spike"));
});

test("ActionSeries0 user lucy", async () => {
  userPile.push(await createTestUseActionSeries0("lucy"));
});

test("ActionSeries0 user lucy", async () => {
  userPile.push(await createTestUseActionSeries0("linus"));
});

test("establish fresh user alpha_mann and community enter_shikari", async () => {
  // create a non-admin user, Mann
  let alphaMannLogin = await registerUser(alpha, "Mann");
  expect(alphaMannLogin.jwt).toBeDefined();
  alpha_mann = {
    // ToDo Investigate: what exactly does this mean using alpha's client? the same client URL? or more?
    client: alpha.client,
    auth: alphaMannLogin.jwt ?? "",
  };

  // Mann creates community and posts in it
  enterShikariCommunity = (await createCommunity(alpha_mann, "enter_shikari")).community_view;
  await createPost(alpha_mann, enterShikariCommunity.community.id);
  let alphaMannPost0 = await createPost(alpha_mann, enterShikariCommunity.community.id);
  await createComment(alpha_mann, alphaMannPost0.post_view.post.id);
  await checkTheNumbers("++enterShikariCommunity");

  await createPost(alpha_mann, joyceFinnCommunity.community.id);
  await likePost(alpha_mann, 1, postAlphaResA1.post_view.post);
  await checkTheNumbers("newPost");
});


test("establish fresh user alpha_james and community only_others, let others use community, pull the rug out", async () => {
  // create a non-admin user, James
  let alphaLoginRes = await registerUser(alpha, "James");
  expect(alphaLoginRes.jwt).toBeDefined();
  let alpha_james = {
    // ToDo Investigate: what exactly does this mean using alpha's client? the same client URL? or more?
    client: alpha.client,
    auth: alphaLoginRes.jwt ?? "",
  };

  // James creates community and DOES NOT post or comment in it.
  let onlyOthersCommunity = (await createCommunity(alpha_james, "only_others")).community_view;
  await checkTheNumbers("++onlyOthersCommunity");

  // Now Mann posts in it
  await createPost(alpha_mann, onlyOthersCommunity.community.id);
  let alphaMannPost0 = await createPost(alpha_mann, onlyOthersCommunity.community.id);
  await createComment(alpha_mann, alphaMannPost0.post_view.post.id);
  await checkTheNumbers("++anotherActive");
  let communityRes0 = await getCommunity(alpha_mann, onlyOthersCommunity.community.id);
  expect(communityRes0.community_view.community.deleted).toBe(false);
  expect(communityRes0.moderators.length).toBe(1);

  // James deletes account
  await deleteUser(alpha_james);
  await checkTheNumbers("deleteaccount");

  // can Mann follow the community after delete of account by James?
  let followRes = await followCommunity(alpha, true, onlyOthersCommunity.community.id);
  expect(followRes.community_view.community.deleted).toBe(false);
  await createPost(alpha_mann, onlyOthersCommunity.community.id);
  // commenting on a post in a community created by deleted user
  await createComment(alpha_mann, alphaMannPost0.post_view.post.id);
  // who is the moderator of a community where moderator deleted their account?
  // expect(followRes.community_view.community.)
  let communityRes1 = await getCommunity(alpha_mann, onlyOthersCommunity.community.id);
  expect(communityRes1.moderators.length).toBe(0);
  await checkTheNumbers("followPostDelete");
});

test("site_aggregates community_aggregates person_aggregates for post & comment", async () => {
  if (!joyceFinnCommunity) {
    throw "Missing joyceFinnCommunity community";
  }

  // alpha follows community
  await followCommunity(alpha, true, joyceFinnCommunity.community.id);
  checkTheNumbers("follow");

  // create 2 posts, 5 comments
  postAlphaRes0 = await createPost(alpha, joyceFinnCommunity.community.id);
  await createComment(alpha, postAlphaRes0.post_view.post.id);
  commentAlphaRes1 = await createComment(alpha, postAlphaRes0.post_view.post.id);
  postAlphaRes1 = await createPost(alpha, joyceFinnCommunity.community.id);
  commentAlphaRes2 = await createComment(alpha, postAlphaRes1.post_view.post.id);
  commentAlphaRes3 = await createComment(alpha, postAlphaRes1.post_view.post.id);
  commentAlphaRes4 = await createComment(alpha, postAlphaRes1.post_view.post.id);

  // Test an unfollow
  let unfollow = await followCommunity(alpha, false, joyceFinnCommunity.community.id);
  expect(unfollow.community_view.subscribed).toBe("NotSubscribed");

  // Check the numbers.
  siteCheck = await getSite(alpha);
  consoleSomeA("unfollow", siteCheck, joyceFinnCommunity);

  // does deleting a post impact comment counts?
  await deletePost(alpha, true, postAlphaRes0.post_view.post);
  await checkTheNumbers("RRR-deletePost");

  // delete a comment from the post that is still posted
  await deleteComment(alpha, true, commentAlphaRes1.comment_view.comment.id);
  await checkTheNumbers("AAdeleteComment");
});

test("user Joe is created", async () => {
  // create a non-admin user, Joe
  let alphaJoeLogin = await registerUser(alpha, "Joe");
  expect(alphaJoeLogin.jwt).toBeDefined();
  alpha_joe = {
    // what exactly does this mean? the same client URL? or more?
    client: alpha.client,
    auth: alphaJoeLogin.jwt ?? "",
  };
  await checkTheNumbers("Joe");

  // Joe follows, creates 3 comments
  await followCommunity(alpha_joe, true, joyceFinnCommunity.community.id);
  let commentJoeRes0 = await createComment(
    alpha_joe,
    postAlphaRes1.post_view.post.id,
  );
  let commentJoeRes1 = await createComment(
    alpha_joe,
    postAlphaRes1.post_view.post.id,
  );
  let commentJoeRes2 = await createComment(
    alpha_joe,
    postAlphaRes1.post_view.post.id,
  );
  await checkTheNumbers("3comments");

  await deleteComment(alpha_joe, true, commentJoeRes1.comment_view.comment.id);
  await checkTheNumbers("Joedeletecomment");

  await likeComment(alpha_joe, 1, commentAlphaRes3.comment_view.comment);
  await likeComment(alpha_joe, 1, commentAlphaRes4.comment_view.comment);
  await checkTheNumbers("votecomment");

  await likePost(alpha_joe, 1, postAlphaRes1.post_view.post);
  await likePost(alpha_joe, 1, postAlphaResA1.post_view.post);
  await checkTheNumbers("votepost");

  // alpha, undeletes their first post
  await deletePost(alpha, false, postAlphaRes0.post_view.post);
  // Joe upvotes and comments on it
  await likePost(alpha_joe, 1, postAlphaRes0.post_view.post);
  let commentJoeRes3 = await createComment(
    alpha_joe,
    postAlphaRes0.post_view.post.id,
  );
  await checkTheNumbers("RRR-undeletepost");

  // Joe creates community and posts in it
  let joeShackCommunityRes = await createCommunity(alpha_joe, "joe_radio_shack");
  joeShackCommunity = joeShackCommunityRes.community_view;
  joeShackPost0 = await createPost(alpha_joe, joeShackCommunity.community.id);
  await checkTheNumbers("++community");
});

test("Joe replies to peanut gang comments", async () => {
  for (let i = 0; i < commentPile.length; i++) {
    await createComment(alpha_joe, commentPile[i].comment_view.post.id, commentPile[i].comment_view.comment.id);
  }
  await checkTheNumbers("Joe-Peanuts");
});

test("alpha user activity, Joe deletes account", async () => {
  await createComment(alpha, postAlphaRes0.post_view.post.id);
  await createPost(alpha, joeShackCommunity.community.id);
  await createComment(alpha, joeShackPost0.post_view.post.id);
  postAlphaResA0 = await createPost(alpha, joyceFinnCommunity.community.id);
  await checkTheNumbers("alpha active");

  // Joe deletes account
  await deleteUser(alpha_joe);
  await checkTheNumbers("deleteaccount");

  // Alpha follows community again, posts comment they are back
  await followCommunity(alpha, true, joyceFinnCommunity.community.id);
  let commentRes5 = await createComment(alpha, postAlphaRes0.post_view.post.id);
  await checkTheNumbers("subscribe");
});

test("user Sam", async () => {
  // create a non-admin user, Sam
  let alphaSamLogin = await registerUser(alpha, "Sam");
  expect(alphaSamLogin.jwt).toBeDefined();
  alpha_sam = {
    // what exactly does this mean? the same client URL? or more?
    client: alpha.client,
    auth: alphaSamLogin.jwt ?? "",
  };
  await likePost(alpha_sam, 1, postAlphaRes0.post_view.post);
  await checkTheNumbers("Sam");

  await likePost(alpha_sam, 0, postAlphaRes0.post_view.post);
  await checkTheNumbers("--PostVote");

  // alpha undeletes a comment, Sam follows community
  await deleteComment(alpha, false, commentAlphaRes1.comment_view.comment.id);
  await followCommunity(alpha_sam, true, joyceFinnCommunity.community.id);
  await checkTheNumbers("UndeleteComment");

  await likePost(alpha_sam, 1, postAlphaRes1.post_view.post);
  await likePost(alpha_sam, 1, postAlphaResA0.post_view.post);
  await checkTheNumbers("PostVote");

  // Sam creates community and posts in it, comments 2 times, alpha replies
  let samShackCommunity = await createCommunity(alpha_sam, "sam_fish_shack");
  let samPost0 = await createPost(
    alpha_sam,
    samShackCommunity.community_view.community.id,
  );
  await createComment(alpha_sam, samPost0.post_view.post.id);
  let commentSamRes0 = await createComment(
    alpha_sam,
    samPost0.post_view.post.id,
  );
  let commentRes6 = await createComment(
    alpha,
    samPost0.post_view.post.id,
    commentSamRes0.comment_view.comment.id,
  );
  await likeComment(alpha_sam, -1, commentRes6.comment_view.comment);
  await createComment(
    alpha_sam,
    samPost0.post_view.post.id,
    commentRes6.comment_view.comment.id,
  );
  await checkTheNumbers("samactive");
});

test("site_aggregates community_aggregates for post", async () => {

});

test("site_aggregates community_aggregates for users", async () => {

});

test.skip("post removal and restore behavior study", async () => {
  // Intention with some of these tests is to document the Lemmy behavior
  //    as design changes may happen as Lemmy evolves and modifications to
  //    expecations in this code will serve to document differeces between
  //    versions / code commits.
  // Some of these tests are concerned about performance and server overload
  //    during unusual events, such as mass deletion of posts and comments.
  // Questions:
  //    1. when a post is deleted, are the comments on that post altered by database?
  //    2. Is it possible to answer #1 from the clieent API, here in these tests?
  //    3. Does lemmy allow an 'orphan comment', with the post
  // user_a create post, user_b create comment, does user_b no longer have profile access
  //    to their own content (comment) after user_a deletes a post?
  //    what if moderator remvoes the post, what happens to comment for profile of user_a?
});

test("community_aggregates for subscribe", async () => {
  // try subscribe/unsubscribe and test results.

  if (!betaCommunityOnAlpha) {
    throw "Missing beta community";
  }
  await followCommunity(alpha, true, betaCommunityOnAlpha.community.id);
  betaCommunityOnAlpha = (await resolveBetaCommunity(alpha)).community;

  // Make sure the follow response went through
  expect(betaCommunityOnAlpha?.community.local).toBe(false);
  expect(betaCommunityOnAlpha?.community.name).toBe("main");
  expect(betaCommunityOnAlpha?.subscribed).toBe("Subscribed");

  // Check it from local
  let site = await getSite(alpha);
  let remoteCommunityId = site.my_user?.follows.find(
    c => c.community.local == false,
  )?.community.id;
  expect(remoteCommunityId).toBeDefined();
  //expect(site.my_user?.follows.length).toBe(2);

  if (!remoteCommunityId) {
    throw "Missing remote community id";
  }

  // Test an unfollow
  let unfollow = await followCommunity(alpha, false, remoteCommunityId);
  expect(unfollow.community_view.subscribed).toBe("NotSubscribed");

  // Make sure you are unsubbed locally
  let siteUnfollowCheck = await getSite(alpha);
  // expect(siteUnfollowCheck.my_user?.follows.length).toBe(1);
});
