/*
test live servrer
*/
jest.setTimeout(1 * 60 * 1000);

import {
  CommentView,
  CreatePost,
  GetComments,
  GetPost,
  GetPosts,
  GetPostsResponse,
  LemmyHttp,
  PostResponse,
} from "lemmy-js-client";
import {
  alpha,
  API,
  beta,
  createCommunity,
  followCommunity,
  resolveCommunity,
  setupLogins,
  createComment,
  likeComment,
  likePost,
  registerUser,
  getPosts,
  randomString,
} from "./shared";

beforeAll(async () => {});

afterAll(async () => {});

test("lemmy.ml comment", async () => {
  // let targetComment = 2071725;  // seems fixed now with added comments?
  // let targetPost = 2540874;

  let targetComment = 2130121;
  targetComment = 2119998;
  // https://github.com/LemmyNet/lemmy/issues/3741
  /*
  output:
      {
      id: 2042764,
      creator_id: 918230,
      post_id: 2507287,
      content: 'Good!',
      removed: false,
      published: '2023-07-27T18:59:42.669568',
      deleted: false,
      ap_id: 'https://lemmy.world/comment/1792290',
      local: false,
      path: '0',
      distinguished: false,
      language_id: 0
    }
  */
  targetComment = 2042764;
  let client = new LemmyHttp("https://lemmy.ml/");
  let comment = await client.getComment({
    id: targetComment,
  });
  console.log(comment.comment_view.comment);
  console.log(comment.comment_view.counts);

  let comments = await client.getComments({
    post_id: comment.comment_view.post.id,
    parent_id: targetComment,
  });
  // console.log(comments);
  showComments(comments.comments);

  // this seems like a valid asumption since you asked for that comment by id
  expect(comment.comment_view.comment.id).toBe(comments.comments[0].comment.id);
});

test.skip("lemm.ee comment, child_count", async () => {
  let targetComment = 1799656;
  targetComment = 1153351;
  let client = new LemmyHttp("https://lemm.ee/");
  let comment = await client.getComment({
    id: targetComment,
  });
  console.log(comment.comment_view.comment);
  console.log(comment.comment_view.counts);

  let comments = await client.getComments({
    post_id: comment.comment_view.post.id,
    parent_id: targetComment,
  });
  showComments(comments.comments);

  // this seems like a valid asumption since you asked for that comment by id
  // expect(comment.comment_view.comment.id).toBe(comments.comments[0].comment.id);
});

test.skip("bulletintree.com comment", async () => {
  let targetComment = 1470326;
  targetComment = 1493691;
  let client = new LemmyHttp("https://bulletintree.com/");
  let auth;
  let isPostLink = false;

  let id = targetComment;

  const postForm: GetPost = {
    auth,
  };

  const commentsForm: GetComments = {
    max_depth: 8,
    sort: "Hot",
    type_: "All",
    saved_only: false,
    limit: 3,
    auth,
  };

  // Set the correct id based on the path type
  if (isPostLink) {
    postForm.id = id;
    commentsForm.post_id = id;
  } else {
    postForm.comment_id = id;
    commentsForm.parent_id = id;
  }

  let bothFetch = {
    postRes: await client.getPost(postForm),
    commentsRes: await client.getComments(commentsForm),
  };

  console.log("post %s", bothFetch.postRes.post_view.post.name);
  showComments(bothFetch.commentsRes.comments);

  console.log(postForm);
  console.log(commentsForm);
});

function showComments(comments: CommentView[]) {
  for (let i = 0; i < comments.length; i++) {
    let c = comments[i];
    console.log(
      "%d: %d %s cc:%d %s '%s'",
      i,
      c.comment.id,
      c.creator.actor_id,
      c.counts.child_count,
      c.comment.path,
      c.comment.content,
    );
    expect(c.comment.removed).toBe(false);
    expect(c.comment.deleted).toBe(false);
    expect(c.creator_blocked).toBe(false);
    expect(c.creator_banned_from_community).toBe(false);
  }
}
