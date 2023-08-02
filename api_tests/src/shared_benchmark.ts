import {
  PostResponse,
  CreatePost,
  GetPostsResponse,
  GetPosts,
  Login,
  GetCommentsResponse,
  GetComments,
  SortType,
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
  getComments,
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
): Promise<PostResponse> {
  let name = "Post without link " + randomString(5);
  let body = "Body of post without link " + randomString(10);
  let url = undefined;
  let form: CreatePost = {
    name,
    url,
    body,
    auth: api.auth,
    community_id,
  };
  return api.client.createPost(form);
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
    let communityRes = await createCommunity(account, name);
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
      auth: alpha.auth,
      community_id: communityRes.community_view.community.id,
    };
    let postRes = await account.client.createPost(form);

    //let postRes = await createNoLinkPost(alpha, communityRes.community_view.community.id);
    let commentRes = await createComment(alpha, postRes.post_view.post.id);

    if (prevComment) {
      if (prevPost) {
        await createComment(
          account,
          prevPost.post_view.post.id,
          prevComment.comment_view.comment.id,
          "reply to previous " + i + " " + tag,
        );
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

export function getPostsMax(
  api: API,
  moderator_view = false,
  sort_by: SortType,
): Promise<GetPostsResponse> {
  let form: GetPosts = {
    moderator_view,
    auth: api.auth,
    limit: 50,
    sort: sort_by,
    type_: "All",
  };
  return api.client.getPosts(form);
}

export function getPostsNewMax2(
  api: API,
  moderator_view = false,
): Promise<GetPostsResponse> {
  let form: GetPosts = {
    moderator_view,
    auth: api.auth,
    limit: 500,
    sort: "New",
    type_: "All",
  };
  return api.client.getPosts(form);
}

export async function setupBenchmarkLogins(tag: string) {
  alpha_user_casual0 = await registerUserClient(alpha, "alpha_casual" + tag);
}

export async function nestedCommentsOnMostRecentPosts() {
  let posts = await getPostsMax(alpha, undefined, "New");
  expect(posts.posts.length).toBeGreaterThanOrEqual(10);

  let sameCount = 0;
  for (let i = 0; i < 4; i++) {
    let post = posts.posts[i];
    let commentRes = await createComment(alpha, post.post.id);
    let replyTo = commentRes;
    let prevComment = commentRes;
    for (let j = 0; j < i * 1000; j++) {
      sameCount++;
      if (j % 100 == 0) {
        sameCount = 0;
        replyTo = prevComment;
      }
      let body = "reply to post " + i + " comment " + j + " same " + sameCount;
      console.log("sameCount %d %s", sameCount, body);
      if (commentRes) {
        if (post) {
          prevComment = await createComment(
            alpha,
            post.post.id,
            replyTo.comment_view.comment.id,
            body,
          );
        }
      }
    }
  }
}

export async function nestedCommentsOnMostRecentPosts2() {
  let posts = await getPostsMax(alpha, undefined, "New");
  expect(posts.posts.length).toBeGreaterThanOrEqual(10);

  let sameCount = 0;
  let totalCount = 0;
  let parent_id = undefined;
  for (let i = 0; i < 4; i++) {
    let post = posts.posts[i];
    let commentRes = await createComment(alpha, post.post.id);
    let replyTo = commentRes;
    parent_id = undefined;
    let prevComment = commentRes;
    let branchLevel = 0;
    for (let j = 0; j < i * 1000; j++) {
      totalCount++;
      sameCount++;
      if (j % 30 == 0) {
        sameCount = 0;
        // replyTo = prevComment;
        branchLevel++;
        if (branchLevel > 12) {
          branchLevel = 0;
          parent_id = undefined;
        } else {
          parent_id = prevComment.comment_view.comment.id;
        }
      } else {
        // after one cycle of undefined, start a chain
        if (!parent_id) {
          parent_id = prevComment.comment_view.comment.id;
        }
      }
      let body =
        "reply to post " +
        i +
        " comment " +
        j +
        " same " +
        sameCount +
        " branchLevel " +
        branchLevel +
        " total " +
        totalCount;
      console.log("sameCount %d %s", sameCount, body);
      if (commentRes) {
        if (post) {
          prevComment = await createComment(
            alpha,
            post.post.id,
            parent_id,
            body,
          );
        }
      }
    }
  }
}

export async function nestedCommentsOnMostRecentPosts3() {
  let posts = await getPostsMax(alpha, undefined, "New");
  expect(posts.posts.length).toBeGreaterThanOrEqual(10);

  let sameCount = 0;
  let totalCount = 0;
  let parent_id = undefined;
  for (let i = 0; i < 4; i++) {
    let post = posts.posts[i];

    // create 50 trunk comments, users who comment but don't read and reply
    for (let j = 0; j < 50; j++) {
      totalCount++;
      let body =
        "trunk reply to post " +
        i +
        " comment " +
        j +
        " same " +
        sameCount +
        " branchLevel " +
        "TRUNK" +
        " total " +
        totalCount;
      await createComment(alpha, post.post.id, undefined, body);
    }

    let commentRes = await createComment(alpha, post.post.id);
    parent_id = undefined;
    let prevComment = commentRes;
    let branchLevel = 0;
    for (let j = 0; j < i * 1000; j++) {
      totalCount++;
      sameCount++;
      if (j % 30 == 0) {
        sameCount = 0;
        branchLevel++;
        if (branchLevel > 12) {
          branchLevel = 0;
          parent_id = undefined;
        } else {
          parent_id = prevComment.comment_view.comment.id;
        }
      } else {
        // after one cycle of undefined, start a chain
        if (!parent_id) {
          parent_id = prevComment.comment_view.comment.id;
        }
      }
      let body =
        "reply to post " +
        i +
        " comment " +
        j +
        " same " +
        sameCount +
        " branchLevel " +
        branchLevel +
        " total " +
        totalCount;
      console.log("sameCount %d %s", sameCount, body);
      if (commentRes) {
        if (post) {
          prevComment = await createComment(
            alpha,
            post.post.id,
            parent_id,
            body,
          );
        }
      }
    }
  }
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
  let posts = await getPostsMax(alpha, undefined, "MostComments");
  expect(posts.posts.length).toBeGreaterThanOrEqual(12);

  for (let i = 0; i < 12; i++) {
    let post = posts.posts[i];

    let comments = await getCommentsMax(alpha, post.post.id);
    // console.log("comments %d coount %d onpost %d", i, comments.comments.length, post.counts.comments);
  }
}
