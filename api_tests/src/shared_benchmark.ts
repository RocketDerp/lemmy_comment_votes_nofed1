import {
  PostResponse,
  CreatePost,
  GetPostsResponse,
  GetPosts,
  Login,
  GetCommentsResponse,
  GetComments,
  SortType,
  PostView,
  CommentResponse,
  ListingType,
  ListPrivateMessageReports,
} from "lemmy-js-client";
import {
  API,
  createCommunity,
  resolveCommunity,
  beta,
  followCommunity,
  randomString,
  alpha,
  createComment,
  likePost,
  likeComment,
  registerUser,
  delay,
  getSite,
  resolvePerson,
  saveUserSettings,
  getPosts,
} from "./shared";

export let alpha_user_casual0: API;

export let defaultPassword = "lemmylemmy";

/*
Will try to login to existing account as this may be a second run of these tests
due to wanting to maintain as much data as possible to benchmark against.
*/
export async function registerUserClient(withapi: API, username: string) {
  let jwt;
  try {
    let formAlpha: Login = {
      username_or_email: username,
      password: defaultPassword,
    };
    let resAlpha = await alpha.client.login(formAlpha);

    if (resAlpha.jwt) {
      jwt = resAlpha.jwt;
    }
  } catch (e0) {
    console.log(
      "login failed, going to try creating new user for '%s'",
      username,
    );
  }

  if (!jwt) {
    let registerUserRes = await registerUser(withapi, username);
    jwt = registerUserRes.jwt;
  }

  let newUser: API = {
    client: withapi.client,
    auth: jwt ?? "",
  };
  return newUser;
}

export async function createNoLinkPost(
  api: API,
  community_id: number,
  name: string = "Post without link " + randomString(5),
  body: string = "Body of post without link " + randomString(10),
  nsfw?: boolean | undefined
): Promise<PostResponse> {
  //let name = "Post without link " + randomString(5);
  // let body = "Body of post without link " + randomString(10);
  let url = undefined;
  let form: CreatePost = {
    name,
    url,
    body,
    auth: api.auth,
    community_id,
    nsfw
  };
  return api.client.createPost(form);
}


/*
original getPosts in shared:

export function getPosts(
  api: API,
  listingType?: ListingType,
): Promise<GetPostsResponse> {
  let form: GetPosts = {
    auth: api.auth,
    type_: listingType,
  };
  return api.client.getPosts(form);
}
*/
export function getPostsMax(
  api: API,
  listingType?: ListingType,
  sort_by?: SortType,
  limit?: number
): Promise<GetPostsResponse> {
  let form: GetPosts = {
    auth: api.auth,
    limit: 50,
    sort: sort_by,
    type_: listingType,
  };
  return api.client.getPosts(form);
}

export async function setupBenchmarkLogins(tag: string) {
  alpha_user_casual0 = await registerUserClient(alpha, "alpha_casual" + tag);
}

// 2023-08-08 testing, looks like my production server has 9 subscribers on community
//    in response, start with a new community
export let targetCommunityName = "BT_test_quantity2";
let sameCommentCount = 0;
// ToDo: one totalCount object
let totalCommentCount = 0;
let totalPostCount = 0;
let totalCommunityCount = 0;
let serviceUnavailableCount = 0;

export function setTargetCommunityName(name: string) {
  targetCommunityName = name;
  console.log("targetCommunityName set to '%s'", targetCommunityName);
}

// intended for production servers to be self-aware when creating
export async function createTargetCommunity(account: API) {
  const name = targetCommunityName;
  // await resolveCommunity(account, name);
  let communityRes = await createCommunity(account, name);
  totalCommunityCount++;
  expect(communityRes.community_view.community.name).toBe(name);
}

export async function loopActionSetA(
  account: API,
  localOnly: boolean,
  tag: string,
) {
  let prevPost: PostResponse | undefined;
  let prevComment;

  console.log("loopActionSetA start local %s tag: %s", localOnly, tag);
  const start = performance.now();

  // For the sake of woodpecker builds, only run 13 loops because these tests are slow
  // If performance improves,
  for (let i = 0; i < 13; i++) {
    const name = "series_" + i + "_" + tag + "_" + randomString(4);
    targetCommunityName = name;
    let communityRes = await createCommunity(account, name);
    totalCommunityCount++;
    expect(communityRes.community_view.community.name).toBe(name);

    if (!localOnly) {
      // Cache the community on beta, make sure it has the other fields
      let searchShort = `!${name}@lemmy-alpha:8541`;
      let betaCommunity = (await resolveCommunity(beta, searchShort)).community;

      if (!betaCommunity) {
        throw "betaCommunity resolve failure";
      }
      await followCommunity(beta, true, betaCommunity.community.id);
    }

    // NOTE: the default createPost is a URL post which does network connects outbound
    //   it is much slower to do url posts
    let form: CreatePost = {
      name: "benchmark post " + i + " " + tag,
      body: "Body of post without link " + randomString(10) + " " + tag,
      auth: account.auth,
      community_id: communityRes.community_view.community.id,
    };
    let postRes = await account.client.createPost(form);

    //let postRes = await createNoLinkPost(alpha, communityRes.community_view.community.id);
    let commentRes = await createComment(alpha, postRes.post_view.post.id);
    totalCommentCount++;

    if (prevComment) {
      if (prevPost) {
        await createComment(
          account,
          prevPost.post_view.post.id,
          prevComment.comment_view.comment.id,
          "reply to previous " + i + " " + tag,
        );
        totalCommentCount++;
      }
    }

    // Other user upvotes.
    await likePost(alpha_user_casual0, 1, postRes.post_view.post);
    await likeComment(alpha_user_casual0, 1, commentRes.comment_view.comment);
    prevPost = postRes;
    prevComment = commentRes;
  }

  const end = performance.now();
  // 20 seconds is NOT good performance for 13 loops. I suggest 6 or even 1.3 seconds as a goal on empty database.
  console.log("loopActionSetA end local %s tag: %s", localOnly, tag);
  return end - start;
}

// SetA uses leaked usernames, SetB does all with one user
//   SetB uses a fixed single community for live server
export async function loopActionSetB(
  account: API,
  localOnly: boolean,
  tag: string,
) {
  let prevPost: PostResponse | undefined;
  let prevComment;

  const name = targetCommunityName;
  // await resolveCommunity(account, name);
  let communityRes = await account.client.getCommunity({ name: name });
  expect(communityRes.community_view.community.name).toBe(name);

  console.log("loopActionSetB start local %s tag: %s", localOnly, tag);
  const start = performance.now();

  // For the sake of woodpecker builds, only run 13 loops because these tests are slow
  // If performance improves,
  for (let i = 0; i < 13; i++) {
    // NOTE: the default createPost is a URL post which does network connects outbound
    //   it is much slower to do url posts
    let form: CreatePost = {
      name: "TESTING POST benchmark post " + i + " " + tag,
      body: "Body of post without link " + randomString(10) + " " + tag,
      auth: account.auth,
      community_id: communityRes.community_view.community.id,
    };
    let postRes = await account.client.createPost(form);

    //let postRes = await createNoLinkPost(alpha, communityRes.community_view.community.id);
    let commentRes = await createComment(alpha, postRes.post_view.post.id);
    totalCommentCount++;

    if (prevComment) {
      if (prevPost) {
        await createComment(
          account,
          prevPost.post_view.post.id,
          prevComment.comment_view.comment.id,
          "reply to previous " + i + " " + tag,
        );
        totalCommentCount++;
      }
    }

    prevPost = postRes;
    prevComment = commentRes;
  }

  const end = performance.now();
  // 20 seconds is NOT good performance for 13 loops. I suggest 6 or even 1.3 seconds as a goal on empty database.
  console.log("loopActionSetB end local %s tag: %s", localOnly, tag);
  return end - start;
}

//  uses a fixed single community for live server
//  does NOT cope with exceptions / rate limit on live server
export async function postActionSetA(
  account: API,
  tag: string,
  quantity_posts = 25,
  quantity_comments_per_post = 13,
) {
  let prevPost: PostResponse | undefined;

  const name = targetCommunityName;
  // await resolveCommunity(account, name);
  let communityRes = await account.client.getCommunity({ name: name });
  expect(communityRes.community_view.community.name).toBe(name);

  // For the sake of woodpecker builds, only run 13 loops because these tests are slow
  // If performance improves,
  for (let i = 0; i < quantity_posts; i++) {
    const now = new Date();
    // NOTE: the default createPost is a URL post which does network connects outbound
    //   it is much slower to do url posts
    let form: CreatePost = {
      name:
        "TESTING POST, benchmark post " +
        i +
        " " +
        tag +
        " " +
        now.toISOString(),
      body:
        now.toISOString() +
        "\n\n" +
        "BulletinTree.com performance testing on live database. Please ignore.\n\n" +
        "Body of post without link " +
        randomString(10) +
        " " +
        tag,
      auth: account.auth,
      community_id: communityRes.community_view.community.id,
    };
    try {
      let postRes = await account.client.createPost(form);
      totalPostCount++;
      prevPost = postRes;
      await createSomeCommentsOnPost(
        account,
        postRes.post_view,
        quantity_comments_per_post,
      );
    } catch (e0) {
      console.error(
        "Exception creating post on communuity %s",
        targetCommunityName,
      );
      console.log(e0);
      process.exit(80);
    }

    if (i % 66 == 0) {
      console.log(
        "postActionSetA progress: errors %d, total communities %d posts %d comments %d",
        serviceUnavailableCount,
        totalCommunityCount,
        totalPostCount,
        totalCommentCount,
      );
    }
  }
  console.log(
    "postActionSetA finish: errors %d, total communities %d posts %d comments %d",
    serviceUnavailableCount,
    totalCommunityCount,
    totalPostCount,
    totalCommentCount,
  );
}

export function generateCommentBodyA(
  now: Date,
  commentIndex: number,
  outNote0: string,
) {
  return (
    "BulletinTree.com testing of live servers.\n" +
    "It is suggested you do not subscribe to community.\n\n" +
    now.toISOString() +
    "  " +
    outNote0 +
    " comment " +
    commentIndex +
    " session same " +
    sameCommentCount +
    " totalCommentCount " +
    totalCommentCount
  );
}

export async function createSomeCommentsOnPost(
  account: API,
  post: PostView,
  quantity: number,
) {
  let inreply_id = undefined;
  sameCommentCount = 0;

  for (let j = 0; j < quantity; j++) {
    let now = new Date();
    let body = generateCommentBodyA(now, j, "reply to post_id " + post.post.id);

    try {
      let newComment = await createComment(
        account,
        post.post.id,
        inreply_id,
        body,
      );
      // if exception was hit, this won't increment
      totalCommentCount++;
      if (j > 3) {
        if (sameCommentCount > 2) {
          inreply_id = undefined;
        }

        if (!inreply_id) {
          // WARN: will overflow depth at some point
          inreply_id = newComment.comment_view.comment.id;
          sameCommentCount = 0;
        } else {
          sameCommentCount++;
        }
      }
    } catch (e0) {
      if (e0 == "Service Temporarily Unavailable") {
        serviceUnavailableCount++;
        console.log(
          "'Service Temporarily Unavailable' %d, sleeping, i %d j %d total comments %d",
          serviceUnavailableCount,
          j,
          totalCommentCount,
        );
        await delay(5000);
        j--; // NOTE: this is modifyng the for loop to do a retry.
      } else {
        console.error("Unrecognized exception");
        console.log(e0);
        process.exit(30);
      }
    }
  }
}

// this function is a bit of a mess, called from within a loop
export async function createTrunkCommentsOnPost(
  i: number,
  account: API,
  post: PostView,
) {
  let prevComment;

  // create 50 trunk comments, users who comment but don't read and reply
  for (let j = 0; j < 50; j++) {
    let now = new Date();
    let body = generateCommentBodyA(
      now,
      j,
      "trunk reply to post " + i + " post_id " + post.post.id,
    );

    try {
      let newComment = await createComment(
        account,
        post.post.id,
        undefined,
        body,
      );
      // next statement will only set if no excepton.
      prevComment = newComment;
      // if exception was hit, this won't increment
      totalCommentCount++;
    } catch (e0) {
      if (e0 == "Service Temporarily Unavailable") {
        serviceUnavailableCount++;
        console.log(
          "'Service Temporarily Unavailable' %d, sleeping, i %d j %d tc %d",
          serviceUnavailableCount,
          i,
          j,
          totalCommentCount,
        );
        await delay(5000);
        j--; // NOTE: this is modifyng the for loop to do a retry.
      } else {
        console.error("Unrecognized exception");
        console.log(e0);
        process.exit(30);
      }
    }
  }

  return prevComment;
}

export function resetTotal() {
  totalCommentCount = 0;
  totalPostCount = 0;
  totalCommunityCount = 0;
}

// not recommended to call this in live server
//   as it will create many cmmmunities
export async function manyCommunitiesManyPosts(account: API) {
  // lemmy.world has over 9000 in production
  const communityLoop = 1500;
  // to allow multiple passes against the same server, timestamp as part of name
  const startNow = new Date();
  // Lemmy has rather short name description limits in 0.18.3... so
  //   this has to fit.
  // 1970-01-01T00:00:00.000Z
  const splitNowT = startNow.toISOString().split("T");
  // 00:00:00.000Z
  const splitNowP = splitNowT[1].split(".");
  const nameBase = "zzST_" + splitNowP[0].replaceAll(":", "") + "_";
  console.log("manyCommunitiesManyPosts nameBase '%s'", nameBase);
  for (let a = 0; a < communityLoop; a++) {
    let name = nameBase + a;
    let communityRes;
    try {
      // ToDo: add to community description with full startNow string
      communityRes = await createCommunity(account, name);
      totalCommunityCount++;
    } catch (e0) {
      console.error(
        "Exception creating community, are you running against live server?",
      );
      console.log(e0);
      process.exit(70);
    }
    targetCommunityName = name;
    await postActionSetA(account, name);
    if (a % 50) {
      console.log(
        "community + post progress: errors %d, a %d total communities %d posts %d comments %d",
        serviceUnavailableCount,
        a,
        totalCommunityCount,
        totalPostCount,
        totalCommentCount,
      );
    }
  }
  console.log(
    "community + post finish: errors %d, total communities %d posts %d comments %d",
    serviceUnavailableCount,
    totalCommunityCount,
    totalPostCount,
    totalCommentCount,
  );
}

export async function manyPostsWithAFewCommentsSameCommunity(account: API) {
  const postLoop = 25;
  for (let b = 0; b < postLoop; b++) {
    await postActionSetA(account, "MP_", 100, 13);
  }
  console.log(
    "manyPosts finish: errors %d, total communities %d posts %d comments %d",
    serviceUnavailableCount,
    totalCommunityCount,
    totalPostCount,
    totalCommentCount,
  );
}

export async function nestedCommentsOnMostRecentPostsSpecificCommunityA(
  account: API,
) {
  // IMPORTANT: live server, live-wire testing.
  //    only Local
  //    only recognized test community
  expect(targetCommunityName).toBeDefined();
  let form: GetPosts = {
    auth: account.auth,
    limit: 50,
    sort: "New",
    community_name: targetCommunityName,
    type_: "Local",
  };
  let posts = await account.client.getPosts(form);

  let postLoop = 4;
  expect(posts.posts.length).toBeGreaterThanOrEqual(postLoop);

  for (let i = 0; i < postLoop; i++) {
    let post = posts.posts[i];

    let prevComment = await createTrunkCommentsOnPost(i, account, post);

    if (!prevComment) {
      throw "At least one comment had to be created prior to here";
    }

    await nestedCommentsOnPost(i, account, post, prevComment);

    console.log(
      "finished post, progress: errors %d, i %d total communities %d posts %d comments %d",
      serviceUnavailableCount,
      i,
      totalCommunityCount,
      totalPostCount,
      totalCommentCount,
    );
  }
}

// does work against live servers with rate-limiting nginx known excception
export async function nestedCommentsOnPost(
  i: number,
  account: API,
  post: PostView,
  prevComment: CommentResponse,
) {
  let parent_id = undefined;
  let branchLevel = 0;
  const maxBranchLevel = 14;
  sameCommentCount = 0;

  for (let j = 0; j < i * 1000; j++) {
    if (j % 30 == 0) {
      branchLevel++;
      if (branchLevel > maxBranchLevel) {
        branchLevel = 0;
        parent_id = undefined;
      } else {
        parent_id = prevComment.comment_view.comment.id;
      }
      sameCommentCount = 0;
    } else {
      // after one cycle of undefined, start a chain
      if (!parent_id) {
        parent_id = prevComment.comment_view.comment.id;
        sameCommentCount = 0;
      }
    }
    let now = new Date();
    let body = generateCommentBodyA(
      now,
      j,
      "nested reply (branchlevel " +
        branchLevel +
        ") to post_id " +
        post.post.id,
    );

    if (totalCommentCount % 50 == 0) {
      console.log(
        "progress: errors %d, i %d j %d total communuities %d posts %d comments %d branchLevel %d",
        serviceUnavailableCount,
        i,
        j,
        totalCommunityCount,
        totalPostCount,
        totalCommentCount,
        branchLevel,
      );
    }

    try {
      let newComment = await createComment(
        account,
        post.post.id,
        parent_id,
        body,
      );
      // next statement will only set if no excepton.
      prevComment = newComment;
      // total only incremented if exception not hit
      totalCommentCount++;
      if (parent_id) {
        sameCommentCount++;
      }
    } catch (e0) {
      if (e0 == "Service Temporarily Unavailable") {
        serviceUnavailableCount++;
        console.log(
          "'Service Temporarily Unavailable' %d, sleeping, i %d j %d total comments %d branchLevel %d",
          serviceUnavailableCount,
          i,
          j,
          totalCommentCount,
          branchLevel,
        );
        await delay(5000);
        j--; // NOTE: this is modifyng the for loop to do a retry.
      } else {
        console.error("Unrecognized exception, ABEND");
        console.log(e0);
        process.exit(31);
      }
    }
  } // loop of comments with levels
}

export async function getCommentsMax(
  api: API,
  post_id: number,
): Promise<GetCommentsResponse> {
  let form: GetComments = {
    post_id: post_id,
    type_: "All",
    sort: "New",
    limit: 800,
    auth: api.auth,
  };
  return api.client.getComments(form);
}

export async function getCommentsOnMostRecentPosts() {
  // sort by most comments, stress server
  let posts = await getPostsMax(alpha, "All", "MostComments");
  expect(posts.posts.length).toBeGreaterThanOrEqual(12);

  for (let i = 0; i < 12; i++) {
    let post = posts.posts[i];

    let comments = await getCommentsMax(alpha, post.post.id);
    // console.log("comments %d coount %d onpost %d", i, comments.comments.length, post.counts.comments);
  }
}

/*
Hot vs. Active vs. New
anonymous user and logged-in user
logged-in virgin user vs. logged-in user with many people on block list and community block list
PROBLEM: Hot and Active get scheduled updates and this test doesn't run long enough
  BUT without purging data, a kill and start of lemmy_server does these?
  ToDo: API to let an admin execute scheduled jobs on-demand
*/
export async function getPostsForTargetCommunity(
  account: API,
  limit: number,
  sort: SortType,
  bypass_expect_a?: boolean,
) : Promise<GetPostsResponse> {
  expect(targetCommunityName).toBeDefined();
  let form: GetPosts = {
    auth: account.auth,
    limit: limit,
    sort: sort,
    community_name: targetCommunityName,
    type_: "All",
  };
  let postsResult = await account.client.getPosts(form);
  if (!bypass_expect_a) {
    expect(postsResult.posts.length).toBeGreaterThanOrEqual(limit);
  }
  return postsResult;
}
