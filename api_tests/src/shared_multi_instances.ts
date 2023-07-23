/*
multi_instances focus:
1. admin vs. user privledge
2. repatable functions that a test can call. current test design tends to not do loops of repeat actions.
*/
import { LemmyHttp } from "lemmy-js-client";
import { CreatePost } from "lemmy-js-client/dist/types/CreatePost";
import { DeletePost } from "lemmy-js-client/dist/types/DeletePost";
import { EditPost } from "lemmy-js-client/dist/types/EditPost";
import { EditSite } from "lemmy-js-client/dist/types/EditSite";
import { FeaturePost } from "lemmy-js-client/dist/types/FeaturePost";
import { GetComments } from "lemmy-js-client/dist/types/GetComments";
import { GetCommentsResponse } from "lemmy-js-client/dist/types/GetCommentsResponse";
import { GetPost } from "lemmy-js-client/dist/types/GetPost";
import { GetPostResponse } from "lemmy-js-client/dist/types/GetPostResponse";
import { LockPost } from "lemmy-js-client/dist/types/LockPost";
import { Login } from "lemmy-js-client/dist/types/Login";
import { Post } from "lemmy-js-client/dist/types/Post";
import { PostResponse } from "lemmy-js-client/dist/types/PostResponse";
import { RemovePost } from "lemmy-js-client/dist/types/RemovePost";
import { ResolveObject } from "lemmy-js-client/dist/types/ResolveObject";
import { ResolveObjectResponse } from "lemmy-js-client/dist/types/ResolveObjectResponse";
import { Search } from "lemmy-js-client/dist/types/Search";
import { SearchResponse } from "lemmy-js-client/dist/types/SearchResponse";
import { Comment } from "lemmy-js-client/dist/types/Comment";
import { BanPersonResponse } from "lemmy-js-client/dist/types/BanPersonResponse";
import { BanPerson } from "lemmy-js-client/dist/types/BanPerson";
import { BanFromCommunityResponse } from "lemmy-js-client/dist/types/BanFromCommunityResponse";
import { BanFromCommunity } from "lemmy-js-client/dist/types/BanFromCommunity";
import { CommunityResponse } from "lemmy-js-client/dist/types/CommunityResponse";
import { FollowCommunity } from "lemmy-js-client/dist/types/FollowCommunity";
import { CreatePostLike } from "lemmy-js-client/dist/types/CreatePostLike";
import { CommentResponse } from "lemmy-js-client/dist/types/CommentResponse";
import { CreateComment } from "lemmy-js-client/dist/types/CreateComment";
import { EditComment } from "lemmy-js-client/dist/types/EditComment";
import { DeleteComment } from "lemmy-js-client/dist/types/DeleteComment";
import { RemoveComment } from "lemmy-js-client/dist/types/RemoveComment";
import { GetPersonMentionsResponse } from "lemmy-js-client/dist/types/GetPersonMentionsResponse";
import { GetPersonMentions } from "lemmy-js-client/dist/types/GetPersonMentions";
import { CreateCommentLike } from "lemmy-js-client/dist/types/CreateCommentLike";
import { CreateCommunity } from "lemmy-js-client/dist/types/CreateCommunity";
import { GetCommunity } from "lemmy-js-client/dist/types/GetCommunity";
import { DeleteCommunity } from "lemmy-js-client/dist/types/DeleteCommunity";
import { RemoveCommunity } from "lemmy-js-client/dist/types/RemoveCommunity";
import { PrivateMessageResponse } from "lemmy-js-client/dist/types/PrivateMessageResponse";
import { CreatePrivateMessage } from "lemmy-js-client/dist/types/CreatePrivateMessage";
import { EditPrivateMessage } from "lemmy-js-client/dist/types/EditPrivateMessage";
import { DeletePrivateMessage } from "lemmy-js-client/dist/types/DeletePrivateMessage";
import { LoginResponse } from "lemmy-js-client/dist/types/LoginResponse";
import { Register } from "lemmy-js-client/dist/types/Register";
import { SaveUserSettings } from "lemmy-js-client/dist/types/SaveUserSettings";
import { DeleteAccount } from "lemmy-js-client/dist/types/DeleteAccount";
import { GetSiteResponse } from "lemmy-js-client/dist/types/GetSiteResponse";
import { DeleteAccountResponse } from "lemmy-js-client/dist/types/DeleteAccountResponse";
import { GetSite } from "lemmy-js-client/dist/types/GetSite";
import { PrivateMessagesResponse } from "lemmy-js-client/dist/types/PrivateMessagesResponse";
import { GetPrivateMessages } from "lemmy-js-client/dist/types/GetPrivateMessages";
import { PostReportResponse } from "lemmy-js-client/dist/types/PostReportResponse";
import { CreatePostReport } from "lemmy-js-client/dist/types/CreatePostReport";
import { ListPostReportsResponse } from "lemmy-js-client/dist/types/ListPostReportsResponse";
import { ListPostReports } from "lemmy-js-client/dist/types/ListPostReports";
import { CommentReportResponse } from "lemmy-js-client/dist/types/CommentReportResponse";
import { CreateCommentReport } from "lemmy-js-client/dist/types/CreateCommentReport";
import { ListCommentReportsResponse } from "lemmy-js-client/dist/types/ListCommentReportsResponse";
import { ListCommentReports } from "lemmy-js-client/dist/types/ListCommentReports";
import { GetPersonDetailsResponse } from "lemmy-js-client/dist/types/GetPersonDetailsResponse";
import { GetPersonDetails } from "lemmy-js-client/dist/types/GetPersonDetails";
import { GetPosts } from "lemmy-js-client/dist/types/GetPosts";
import { GetPostsResponse } from "lemmy-js-client/dist/types/GetPostsResponse";

import {
  alpha,
  beta,
  gamma,
  delta,
  epsilon,
  setupLogins,
  createPost,
  getPost,
  resolveComment,
  likeComment,
  followBeta,
  followCommunity,
  getCommunity,
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
  getPersonDetails,
  checkInbandError,
  createNoLinkPost,
  getPostsCID,
  findPostGetComments,
  getPosts,
} from "./shared";
import { CommentView } from "lemmy-js-client/dist/types/CommentView";
import * as comparison from "./shared_comparison";
import { PostView } from "lemmy-js-client/dist/types/PostView";
import * as multi from "./shared_multi_instances";
import { CommunityView } from "lemmy-js-client/dist/types/CommunityView";

export let admins = [alpha, beta, gamma, delta, epsilon];

let alphaPostRes: PostResponse;
let gammaGrandTourPost: PostView;
let alphaComment: CommentView;
let gammaComment: CommentView;
let betaCommunityName: string;
let gammaGrandTourCommunity: CommunityView;
let alphaGrandTourCommunity: CommunityView;
let betaGrandTourCommunity: CommunityView;

let postCountAnticipated = 0;

export async function createCommunityOnBeta(name: string) {
  betaCommunityName = name;
  let communityRes = await createCommunity(beta, name);
  expect(checkInbandError(communityRes)).toBeUndefined();
  expect(communityRes?.community_view?.community?.name).toBeDefined();
  betaGrandTourCommunity = communityRes.community_view;
  console.log(
    "new community id %s apn %s",
    betaGrandTourCommunity.community.id,
    betaGrandTourCommunity.community.actor_id,
  );
  return betaGrandTourCommunity;
}

export async function followValidateBetaCommunity() {
  if (!betaGrandTourCommunity) {
    throw "Missing beta community";
  }
  if (!betaCommunityName) {
    throw "Missing beta community name";
  }

  // Cache the community on alpha, make sure it has the other fields
  let searchShort = "!" + betaCommunityName + "@lemmy-beta:8551";
  // other format for searching: searchShort = communityRes.community_view.community.actor_id;
  let alphaGrandTourCommunityRes = await resolveCommunity(alpha, searchShort);
  expect(checkInbandError(alphaGrandTourCommunityRes)).toBeUndefined();
  expect(alphaGrandTourCommunityRes?.community?.community.name).toBeDefined();
  expect(alphaGrandTourCommunityRes?.community?.community.local).toBe(false);
  expect(alphaGrandTourCommunityRes?.community?.community.id).toBeDefined();
  comparison.assertCommunityFederation(
    alphaGrandTourCommunityRes.community,
    betaGrandTourCommunity,
  );
  let alphaFollow = await followCommunity(
    alpha,
    true,
    alphaGrandTourCommunityRes?.community?.community.id!,
  );
  expect(checkInbandError(alphaFollow)).toBeUndefined();
  expect(alphaFollow.community_view.subscribed).toBe("Pending");
  // is Pending, so refresh and see if Subscribed
  let alphaFollowCheck = await getCommunity(
    alpha,
    alphaGrandTourCommunityRes?.community?.community.id!,
  );
  expect(checkInbandError(alphaFollowCheck)).toBeUndefined();
  expect(alphaFollowCheck.community_view.subscribed).toBe("Subscribed");

  // Gamma instance
  let gammaGrandTourCommunityRes = await resolveCommunity(gamma, searchShort);
  expect(checkInbandError(gammaGrandTourCommunityRes)).toBeUndefined();
  expect(gammaGrandTourCommunityRes?.community?.community?.name).toBeDefined();
  expect(gammaGrandTourCommunityRes?.community?.community?.local).toBe(false);
  comparison.assertCommunityFederation(
    gammaGrandTourCommunityRes.community,
    betaGrandTourCommunity,
  );
  let gammaFollow = await followCommunity(
    gamma,
    true,
    gammaGrandTourCommunityRes?.community?.community.id!,
  );
  expect(checkInbandError(gammaFollow)).toBeUndefined();
  expect(gammaFollow.community_view.subscribed).toBe("Pending");
  // is Pending, so refresh and see if Subscribed
  let gammaFollowCheck = await getCommunity(
    gamma,
    gammaGrandTourCommunityRes?.community?.community.id!,
  );
  expect(checkInbandError(gammaFollowCheck)).toBeUndefined();
  expect(gammaFollowCheck.community_view.subscribed).toBe("Subscribed");

  // ToDo: listCommunities by new and detect on Gamma?

  // set class variables for other test functions
  gammaGrandTourCommunity = gammaFollowCheck.community_view;
  alphaGrandTourCommunity = alphaFollowCheck.community_view;
}

// Link post, url post, requires Internet connection
export async function createLinkPostInAlphaCommunity() {
  if (!alphaGrandTourCommunity) {
    throw "Missing grandtour community from alpha";
  }

  // a post with a link (url) requires active Internet outbound service
  // You can disable internet on your testing device to create error condition
  let postRes = await createPost(alpha, alphaGrandTourCommunity.community.id);
  if (checkInbandError(postRes) === "couldnt_send_webmention") {
    throw "Internet outbound connection failure";
  } else {
    expect(postRes.post_view.post).toBeDefined();
    expect(postRes.post_view.community.local).toBe(false);
    expect(postRes.post_view.creator.local).toBe(true);
    postCountAnticipated++;
    expect(postRes.post_view.counts.score).toBe(postCountAnticipated);
  }
}

async function commentScoreMultiInstancesForPost(
    post_ap_id: string,
    source_commentview: CommentView,
  ) {
    let returnScore = [];
    let accountsArray = [alpha, beta, gamma];
  
    if (!source_commentview) {
      source_commentview = alphaComment;
    }
  
    let communityNameFull = "grandtour" + "@lemmy-beta";
    for (let i = 0; i < accountsArray.length; i++) {
      let instance = accountsArray[i];
      let getPostComments = await findPostGetComments(
        instance,
        communityNameFull,
        post_ap_id,
      );
      expect(checkInbandError(getPostComments)).toBeUndefined();
      expect(getPostComments.comments.length).toBeGreaterThanOrEqual(1);
      comparison.consoleComments(getPostComments.comments);
      // NOTE: this code assumes we are targeting the newest comment
      //       and that the sorting is by new, and the first in array is newest
      //       lots of assumptions
      let singleComment1 = getPostComments.comments[0];
      expect(singleComment1).toBeDefined();
      // expect(singleComment1.community.local).toBe(false);
      // expect(singleComment1.creator.local).toBe(false);
      expect(singleComment1.counts.score).toBe(source_commentview.counts.score);
      comparison.assertCommentFederation(singleComment1, source_commentview);
      returnScore.push(singleComment1.counts.score);
  
      // Make sure that comment is on instance using resolveComment technique
      let resolveCommentRes = await resolveComment(
        instance,
        source_commentview.comment,
      );
      expect(checkInbandError(resolveCommentRes)).toBeUndefined();
      let singleComment2 = resolveCommentRes.comment;
      expect(singleComment2).toBeDefined();
      // expect(singleComment2?.community.local).toBe(false);
      // expect(singleComment2?.creator.local).toBe(false);
      expect(singleComment2?.counts.score).toBe(source_commentview.counts.score);
      comparison.assertCommentFederation(singleComment2, source_commentview);
    }
    return returnScore;
  }

async function commentCountMultiInstancesForPost(
  post_ap_id: string,
  source_commentview: CommentView,
) {
  let returnCount = [];
  let accountsArray = [alpha, beta, gamma];

  if (!source_commentview) {
    source_commentview = alphaComment;
  }

  let communityNameFull = "grandtour" + "@lemmy-beta";
  for (let i = 0; i < accountsArray.length; i++) {
    let instance = accountsArray[i];
    let getPostComments = await findPostGetComments(
      instance,
      communityNameFull,
      post_ap_id,
    );
    expect(checkInbandError(getPostComments)).toBeUndefined();
    expect(getPostComments.comments.length).toBeGreaterThanOrEqual(1);
    comparison.consoleComments(getPostComments.comments);
    // NOTE: this code assumes we are targeting the newest comment
    //       and that the sorting is by new, and the first in array is newest
    //       lots of assumptions
    let singleComment1 = getPostComments.comments[0];
    expect(singleComment1).toBeDefined();
    // expect(singleComment1.community.local).toBe(false);
    // expect(singleComment1.creator.local).toBe(false);
    expect(singleComment1.counts.score).toBe(source_commentview.counts.score);
    comparison.assertCommentFederation(singleComment1, source_commentview);
    returnCount.push(getPostComments.comments.length);

    // Make sure that comment is on instance using resolveComment technique
    let resolveCommentRes = await resolveComment(
      instance,
      source_commentview.comment,
    );
    expect(checkInbandError(resolveCommentRes)).toBeUndefined();
    let singleComment2 = resolveCommentRes.comment;
    expect(singleComment2).toBeDefined();
    // expect(singleComment2?.community.local).toBe(false);
    // expect(singleComment2?.creator.local).toBe(false);
    expect(singleComment2?.counts.score).toBe(source_commentview.counts.score);
    comparison.assertCommentFederation(singleComment2, source_commentview);
  }
  return returnCount;
}

async function commentCountMultiInstancesForPostNocompare(post_ap_id: string) {
  let returnCount = [];
  let accountsArray = [alpha, beta, gamma];

  let communityNameFull = "grandtour" + "@lemmy-beta";
  for (let i = 0; i < accountsArray.length; i++) {
    let instance = accountsArray[i];
    let getPostPostComments = await findPostGetComments(
      instance,
      communityNameFull,
      post_ap_id,
    );
    expect(checkInbandError(getPostPostComments)).toBeUndefined();
    returnCount.push(getPostPostComments.comments.length);
  }
  return returnCount;
}

async function comparePostsAllServers(referencePost: PostView) {
  let returnCount = [];
  let accountsArray = [alpha, beta, gamma];

  let communityNameFull = "grandtour" + "@lemmy-beta";
  for (let i = 0; i < accountsArray.length; i++) {
    let instance = accountsArray[i];

    let postsRes = await getPosts(instance, communityNameFull);
    expect(checkInbandError(postsRes)).toBeUndefined();
    expect(postsRes.posts.length).toBe(postCountAnticipated);
    comparison.consolePosts(postsRes.posts);
    let singlePost = postsRes.posts[0];
    comparison.assertPostFederation(referencePost, singlePost);

    switch(instance.name) {
      case "gamma":
        // set class variable for other test functions.
        gammaGrandTourPost = singlePost;
        break;
    }

    returnCount.push(postsRes.posts.length);
  }


/*
  // Check instance that we just created poat on.
  let alphaPosts = await getPostsCID(
    alpha,
    alphaGrandTourCommunity.community.id,
  );
  expect(checkInbandError(alphaPosts)).toBeUndefined();
  expect(alphaPosts.posts.length).toBe(postCountAnticipated);
  comparison.consolePosts(alphaPosts.posts);

  // Check beta instance
  let betaPosts = await getPostsCID(beta, betaGrandTourCommunity.community.id);
  expect(checkInbandError(betaPosts)).toBeUndefined();
  expect(betaPosts.posts.length).toBe(postCountAnticipated);
  comparison.consolePosts(betaPosts.posts);
  comparison.assertPostFederation(alphaPosts.posts[0], betaPosts.posts[0]);

  // let gammaPosts = await getPosts(gamma, "grandtour@lemmy-beta:8551");
  let gammaPosts = await getPostsCID(
    gamma,
    gammaGrandTourCommunity.community.id,
  );
  expect(checkInbandError(gammaPosts)).toBeUndefined();
  expect(gammaPosts.posts.length).toBe(postCountAnticipated);
  comparison.consolePosts(gammaPosts.posts);
  let gammaPost = gammaPosts.posts[0];
  comparison.assertPostFederation(alphaPosts.posts[0], gammaPost);

  // again, post created on alpha, sent to home of community on beta, then to gamma
  // Make sure that post is liked on gamma
  expect(gammaPost).toBeDefined();
  expect(gammaPost.community.local).toBe(false);
  expect(gammaPost.creator.local).toBe(false);
  expect(gammaPost.counts.score).toBe(1);
  comparison.assertPostFederation(gammaPost, postRes.post_view);
*/

  // ToDo: analyze these tests, do they make sense in grandtour community/situation?
  // Delta only follows beta, so it should not see an alpha ap_id
  await expect(resolvePost(delta, referencePost.post)).rejects.toBe(
    "couldnt_find_object",
  );

  // Epsilon has alpha blocked, it should not see the alpha post
  await expect(resolvePost(epsilon, referencePost.post)).rejects.toBe(
    "couldnt_find_object",
  );




  return returnCount;
}


export async function createNonLinkPostInAlphaCommunity() {
  if (!alphaGrandTourCommunity) {
    throw "Missing grandtour community from alpha";
  }

  // a post with a link (url) requires active Internet outbound service
  // create a post that does not require active Internet service
  // alpha is a remote instance from the grandtour community homed on beta
  let postRes = await createNoLinkPost(
    alpha,
    alphaGrandTourCommunity.community.id,
  );
  expect(checkInbandError(postRes)).toBeUndefined();
  expect(postRes.post_view.post).toBeDefined();
  expect(postRes.post_view.community.local).toBe(false);
  expect(postRes.post_view.creator.local).toBe(true);
  expect(postRes.post_view.counts.score).toBe(1);
  postCountAnticipated++;

  // set class variable for other test functions.
  alphaPostRes = postRes;

  let compareArray = comparePostsAllServers(postRes.post_view);
}

function numbersInArrayEqual(targetArray: number[], howMany: number) {
  if (howMany > targetArray.length) {
    return false;
  }
  if (howMany < 1) {
    return false;
  }
  let previousValue = targetArray[0];
  for (let i = 1; i < howMany; i++) {
    if (previousValue != targetArray[i]) {
      return false;
    }
  }
  return true;
}

export async function createCommentOnAlphaPost(expectedTotalCommentsOnPost: number) {
  // ToDo: get comment count before create, use it for basis of toBe checks

  let commentRes = await createComment(alpha, alphaPostRes.post_view.post.id);
  expect(checkInbandError(commentRes)).toBeUndefined();
  expect(commentRes.comment_view.comment.content).toBeDefined();
  expect(commentRes.comment_view.community.local).toBe(false);
  expect(commentRes.comment_view.creator.local).toBe(true);
  expect(commentRes.comment_view.counts.score).toBe(1);

  // share to class variable
  alphaComment = commentRes.comment_view;

  let countArray = await commentCountMultiInstancesForPost(
    alphaPostRes.post_view.post.ap_id,
    commentRes.comment_view,
  );
  console.log("createCommentOnAlpha count array expected %d got", expectedTotalCommentsOnPost, countArray);
  expect(numbersInArrayEqual(countArray, 3)).toBe(true);
  expect(countArray[0]).toBe(expectedTotalCommentsOnPost);
}

export async function editCommentOnAlpha(expectedTotalCommentsOnPost: number) {
  let updateCommentRes = await editComment(alpha, alphaComment.comment.id);
  expect(checkInbandError(updateCommentRes)).toBeUndefined();
  expect(updateCommentRes.comment_view.comment.content).toBe(
    "A jest test federated comment update",
  );
  expect(updateCommentRes.comment_view.community.local).toBe(false);
  expect(updateCommentRes.comment_view.creator.local).toBe(true);
  expect(updateCommentRes.comment_view.comment.updated).toBeDefined();
  expect(
    new Date(updateCommentRes.comment_view.comment.updated!).getTime(),
  ).toBeGreaterThan(
    new Date(updateCommentRes.comment_view.comment.published).getTime(),
  );

  // this function will also compare all instance copies of the comment with the edited one, including updated timestamp
  let countArray = await commentCountMultiInstancesForPost(
    alphaPostRes.post_view.post.ap_id,
    updateCommentRes.comment_view,
  );
  expect(numbersInArrayEqual(countArray, 3)).toBe(true);
  console.log("editCommentOnAlpha count array expected %d got", expectedTotalCommentsOnPost, countArray);
  expect(countArray[0]).toBe(expectedTotalCommentsOnPost);

  alphaComment = updateCommentRes.comment_view;
}

let commentCountBeforeDeduction = -100000;

export async function deleteCommentOnAlpha() {
  // get count before delete/deduction
  let countArray = await commentCountMultiInstancesForPost(
    alphaPostRes.post_view.post.ap_id,
    alphaComment,
  );
  console.log("deleteCommentOnAlpha preDelete count array", countArray);
  expect(numbersInArrayEqual(countArray, 3)).toBe(true);
  // confirmed counts are equal on all instances, make sure at lest one comment to deelete.
  expect(countArray[0]).toBeGreaterThanOrEqual(1);
  commentCountBeforeDeduction = countArray[0];

  let betaPostComments0 = await findPostGetComments(
    beta,
    "grandtour@lemmy-beta",
    alphaPostRes.post_view.post.ap_id,
  );
  expect(checkInbandError(betaPostComments0)).toBeUndefined();
  // lemmy 0.18.2 still returns deleted comments but with a deleted flag, so count will still be 1
  expect(betaPostComments0.comments.length).toBe(1);

  // perform the delete by the account that created the comment in the first place.
  let deleteCommentRes = await deleteComment(
    alpha,
    true,
    alphaComment.comment.id,
  );
  expect(checkInbandError(deleteCommentRes)).toBeUndefined();
  expect(deleteCommentRes.comment_view.comment.deleted).toBe(true);

  // publish target comment to class
  alphaComment = deleteCommentRes.comment_view;

  // Will not compare comments in depth, only count the number on post
  let afterCountArray = await commentCountMultiInstancesForPostNocompare(
    alphaPostRes.post_view.post.ap_id,
  );
  console.log("deleteCommentOnAlpha afterDelete count array", afterCountArray);
  expect(numbersInArrayEqual(afterCountArray, 3)).toBe(true);
  // all instances are equal count of comments, pick first instance and confirm it decreased
  expect(afterCountArray[0]).toBe(commentCountBeforeDeduction - 1);
}

export async function undeleteCommentOnAlpha() {
  // Test undeleting the comment, this is done on alpha by user who deleted the comment
  let undeleteCommentRes = await deleteComment(
    alpha,
    false,
    alphaComment.comment.id,
  );
  expect(undeleteCommentRes.comment_view.comment.deleted).toBe(false);

  // publish to class
  alphaComment = undeleteCommentRes.comment_view;

  // this function will also compare all instance copies of the comment with the edited one, including updated timestamp
  let countArray = await commentCountMultiInstancesForPost(
    alphaPostRes.post_view.post.ap_id,
    undeleteCommentRes.comment_view,
  );
  console.log("undeleteCommentOnAlpha count array", countArray);
  expect(numbersInArrayEqual(countArray, 3)).toBe(true);
  expect(countArray[0]).toBe(commentCountBeforeDeduction);
}

export let nonAdmins = [];

export async function createNonAdminUsersAllInstances() {
  let accountsArray = [alpha, beta, gamma];

  /*
  let communityNameFull = "grandtour" + "@lemmy-beta";
  for (let i = 0; i < accountsArray.length; i++) {
    let instance = accountsArray[i];
    let getPostPostComments = await findPostGetComments(
      instance,
      communityNameFull,
      post_ap_id,
    );
    expect(checkInbandError(getPostPostComments)).toBeUndefined();
    returnCount.push(getPostPostComments.comments.length);
  }

      // create a typical end-user on alpha, non-admin
      let alpha_user = await registerUser(alpha);
      expect(checkInbandError(alpha_user)).toBeUndefined();
      let newAlphaApi: API = {
        client: alpha.client,
        auth: alpha_user.jwt ?? "",
      };
  */
}

export async function newNonAdminUserCreateCommentOnAlpha() {
  return true;
      // create a typical end-user on alpha, non-admin
  let alpha_user = await registerUser(alpha);
  expect(checkInbandError(alpha_user)).toBeUndefined();
  let newAlphaApi: API = {
    client: alpha.client,
    clientaddress: "https://nowork;",
    auth: alpha_user.jwt ?? "",
    name: "alpha",
    hostname: "",
    username: "unknown",
    password: "unknown",
    privledge: 0,
    fedallow: [],
    fedblock: [],
    extra: {},
  };

  let commentRes = await createComment(
    newAlphaApi,
    alphaPostRes.post_view.post.id,
  );
  expect(checkInbandError(commentRes)).toBeUndefined();
  expect(commentRes.comment_view.comment.content).toBeDefined();
  expect(commentRes.comment_view.community.local).toBe(false);
  expect(commentRes.comment_view.creator.local).toBe(true);
  expect(commentRes.comment_view.counts.score).toBe(1);

  let betaPostComments1 = await findPostGetComments(
    beta,
    "grandtour@lemmy-beta",
    alphaPostRes.post_view.post.ap_id,
  );
  expect(checkInbandError(betaPostComments1)).toBeUndefined();
  expect(betaPostComments1.comments.length).toBe(1);

  let gammaPostComments1 = await findPostGetComments(
    gamma,
    "grandtour@lemmy-beta",
    alphaPostRes.post_view.post.ap_id,
  );
  expect(checkInbandError(gammaPostComments1)).toBeUndefined();
  expect(gammaPostComments1.comments.length).toBe(2);
  comparison.consoleComments(gammaPostComments1.comments);
  let gammaComment = gammaPostComments1.comments[0];
  expect(gammaComment).toBeDefined();
  expect(gammaComment.community.local).toBe(false);
  expect(gammaComment.creator.local).toBe(false);
  expect(gammaComment.counts.score).toBe(1);
  // confirm we really found the correct comment
  comparison.assertCommentFederation(gammaComment, commentRes.comment_view);
}

export async function setFocusGammaCommentFromAlpha() {
    // the latest alphaComment, find the gamma copy and set focus on it
    // set focus means make class variable.

    let gammaCommentRes = await resolveComment(
        gamma,
        alphaComment.comment,
        );
    expect(checkInbandError(gammaCommentRes)).toBeUndefined();
    expect(gammaCommentRes.comment).toBeDefined();
    // TypeScript doesn't exactly recognize that code just checked for defined
    if (gammaCommentRes.comment) {
        let singleComment2 = gammaCommentRes.comment;
        expect(singleComment2).toBeDefined();
        expect(singleComment2.community.local).toBe(false);
        expect(singleComment2.creator.local).toBe(false);

        gammaComment = singleComment2;
    } else {
        // should have at least gotten an error message.
        // this path should never be reached
        throw "setFocusGammaCommentFromAlpha unexpected undefined";
    }
}


export async function adminCommentRemovalFromGamma() {
  // get count before remove/deduction
  let countArray = await commentCountMultiInstancesForPost(
    alphaPostRes.post_view.post.ap_id,
    alphaComment,
  );
  console.log("adminCommentRemovalFromGamma preRemove count array", countArray);
  expect(numbersInArrayEqual(countArray, 3)).toBe(true);
  // confirmed counts are equal on all instances, make sure at lest one comment to deelete.
  expect(countArray[0]).toBeGreaterThanOrEqual(1);
  commentCountBeforeDeduction = countArray[0];
  
  // gamma is admin of an instance remote to community home on beta
  // admin remove the comment that was made on alpha
  let removeCommentRes = await removeComment(
    gamma,
    true,
    gammaComment.comment.id,
  );
  expect(checkInbandError(removeCommentRes)).toBeUndefined();
  expect(removeCommentRes.comment_view.comment.removed).toBe(true);

  // Make sure it is also removed on beta
  let betaPostComments2 = await findPostGetComments(
    beta,
    "grandtour@lemmy-beta",
    alphaPostRes.post_view.post.ap_id,
  );
  expect(checkInbandError(betaPostComments2)).toBeUndefined();
  // this is the admin account of beta, so it should have been able to fetch it
  expect(betaPostComments2.comments.length).toBe(commentCountBeforeDeduction);
  comparison.consoleComments(betaPostComments2.comments);
  // it is a freshly fetched comment from server
  let betaCommentFresh = betaPostComments2.comments[0];
  expect(betaCommentFresh).toBeDefined();
  expect(betaCommentFresh.community.local).toBe(true);
  expect(betaCommentFresh.creator.local).toBe(false);
  // be certain we fetched the correct comment, compare with direct API delete results
  comparison.assertCommentFederation(betaCommentFresh, gammaComment);
// FixMe: Fix the backend ActivePub replication issue, or is it working by design that admin remove only works on instance it is removed from?
let ignoreAdminRemoveReplication = false;
if (!ignoreAdminRemoveReplication) {
  expect(betaCommentFresh.comment.removed).toBe(true);
}

  // Make sure it is also removed on alpha
  let alphaPostComments1 = await findPostGetComments(
    alpha,
    "grandtour@lemmy-beta",
    alphaPostRes.post_view.post.ap_id,
  );
  expect(checkInbandError(alphaPostComments1)).toBeUndefined();
  // this is the admin account of alpha, so it should have been able to fetch it
  expect(alphaPostComments1.comments.length).toBe(commentCountBeforeDeduction);
  comparison.consoleComments(alphaPostComments1.comments);
  // it is a freshly fetched comment from server
  let alphaCommentFresh = alphaPostComments1.comments[0];
  expect(alphaCommentFresh).toBeDefined();
  expect(alphaCommentFresh.community.local).toBe(false);
  expect(alphaCommentFresh.creator.local).toBe(true);
  // be certain we fetched the correct comment. compare fresh with stale copy of alphaComment
  comparison.assertCommentFederation(alphaCommentFresh, alphaComment);
if (!ignoreAdminRemoveReplication) {
  expect(alphaCommentFresh.comment.removed).toBe(true);
}

  // Will not compare comments in depth, only count the number on post
  let afterCountArray = await commentCountMultiInstancesForPostNocompare(
        alphaPostRes.post_view.post.ap_id,
  );
  console.log("adminCommentRemovalFromGamma afterRemove count array", afterCountArray);
if (!ignoreAdminRemoveReplication) {
    expect(numbersInArrayEqual(afterCountArray, 3)).toBe(true);
    // all instances are equal count of comments, pick first instance and confirm it decreased
    expect(afterCountArray[0]).toBe(commentCountBeforeDeduction - 1);
``}
}

export async function commentUpvoteOnAlpha(expectedTotalCommentScore: number) {
  // do the like from alpha, will go to community home on beta, then to subscribed gamma
  let likeRes = await likeComment(alpha, 1, alphaComment.comment);
  // ToDo: test likeComment on a comment where id doesn't exist in database
  //     result: { error: 'unknown', message: 'Record not found' }
  //     which is non-stnbdard error format.
  expect(checkInbandError(likeRes)).toBeUndefined();
  expect(likeRes.comment_view.counts.score).toBe(expectedTotalCommentScore);

    // this function will also compare all instance copies of the comment with the upvoted one, including score
    let scoreArray = await commentScoreMultiInstancesForPost(
        alphaPostRes.post_view.post.ap_id,
        likeRes.comment_view,
    );
    expect(numbersInArrayEqual(scoreArray, 3)).toBe(true);
    console.log("commentUpvoteOnAlpha scores array expected %d got", expectedTotalCommentScore, scoreArray);
    // score should meet expectations
    expect(scoreArray[0]).toBe(expectedTotalCommentScore);

  // publish new alphaComment since score changed
  alphaComment = likeRes.comment_view;
}

export async function reportBetaCommentOnAlpha() {
  // going to create the post on the community home instance
  let betaPost = await createNoLinkPost(
    beta,
    betaGrandTourCommunity.community.id,
  );
  expect(checkInbandError(betaPost)).toBeUndefined();
  expect(betaPost.post_view.post).toBeDefined();
  console.log("newly created betaPost title: %s", betaPost.post_view.post.name);

  // creating a comment from the same instance and account that created post
  let createCommentRes = await createComment(beta, betaPost.post_view.post.id);
  expect(checkInbandError(createCommentRes)).toBeUndefined();
  expect(createCommentRes.comment_view.comment).toBeDefined();
  let commentRes = createCommentRes.comment_view.comment;

  // downstream instance gamma, find the newly created comment
  let gammaPostComments1 = await findPostGetComments(
    gamma,
    "grandtour@lemmy-beta",
    betaPost.post_view.post.ap_id,
  );
  expect(checkInbandError(gammaPostComments1)).toBeUndefined();
  expect(gammaPostComments1.comments.length).toBe(1);
  comparison.consoleComments(gammaPostComments1.comments);
  comparison.assertCommentFederation(
    gammaPostComments1.comments[0],
    createCommentRes.comment_view,
  );

  // downstream instance alpha, find the newly created comment
  let alphaPostComments1 = await findPostGetComments(
    alpha,
    "grandtour@lemmy-beta",
    betaPost.post_view.post.ap_id,
  );
  expect(checkInbandError(alphaPostComments1)).toBeUndefined();
  expect(alphaPostComments1.comments.length).toBe(1);
  comparison.consoleComments(alphaPostComments1.comments);
  comparison.assertCommentFederation(
    alphaPostComments1.comments[0],
    createCommentRes.comment_view,
  );

  // Alpha will report the comment (reminder that the comment was made on beta, so this is a remote action).
  // In grand tour fashion, this traverses alpha to home community instance beta to subscribed gamma
  let alphaReportRes = await reportComment(
    alpha,
    alphaPostComments1.comments[0].comment.id,
    "testing of troubled comment " + randomString(10),
  );
  expect(checkInbandError(alphaReportRes)).toBeUndefined();
  expect(alphaReportRes.comment_report_view.comment_report).toBeDefined();
  let alphaCommentReport = alphaReportRes.comment_report_view.comment_report;

  // check beta for bug report that was created on alpha
  let betaReports = await listCommentReports(beta);
  expect(checkInbandError(betaReports)).toBeUndefined();
  // if this is the first test to run, should be the first
  expect(betaReports.comment_reports.length).toBe(1);
  let betaCommentReport = betaReports.comment_reports[0].comment_report;
  expect(betaCommentReport).toBeDefined();
  expect(betaCommentReport.resolved).toBe(false);
  expect(betaCommentReport.original_comment_text).toBe(
    alphaCommentReport.original_comment_text,
  );
  expect(betaCommentReport.reason).toBe(alphaCommentReport.reason);

  // This is testing replication from remote-home-remote(s) (alpha-beta-gamma)
  // The situation could be that a remote moderator is on Gamma and needs to see the report in doing their moderator duty.
  let gammaReports = await listCommentReports(gamma);
  expect(checkInbandError(gammaReports)).toBeUndefined();
  // BUG in lemmy_server 0.18.2 backend will not replicate this report to gamma
  expect(gammaReports.comment_reports.length).toBe(1);
  let gammaCommentReport = gammaReports.comment_reports[0].comment_report;
  expect(gammaCommentReport).toBeDefined();
  expect(gammaCommentReport.resolved).toBe(false);
  expect(gammaCommentReport.original_comment_text).toBe(
    alphaCommentReport.original_comment_text,
  );
  expect(gammaCommentReport.reason).toBe(alphaCommentReport.reason);
}
