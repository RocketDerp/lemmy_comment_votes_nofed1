/*
test live servrer
*/
jest.setTimeout(1 * 60 * 1000);

import {
  CommentView,
  CreatePost,
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
  let client = new LemmyHttp("https://lemmy.ml/");
  let comment = await client.getComment({
    id: targetComment,
  });
  console.log(comment.comment_view.comment);

  let comments = await client.getComments({
    post_id: comment.comment_view.post.id,
    parent_id: targetComment,
  });
  // console.log(comments);
  showComments(comments.comments);

  // this seems like a valid asumption since you asked for that comment by id
  expect(comment.comment_view.comment.id).toBe(comments.comments[0].comment.id);
});

function showComments(comments: CommentView[]) {
  for (let i = 0; i < comments.length; i++) {
    let c = comments[i];
    console.log(
      "%d %s %s '%s'",
      c.comment.id,
      c.creator.actor_id,
      c.comment.path,
      c.comment.content,
    );
    expect(c.comment.removed).toBe(false);
    expect(c.comment.deleted).toBe(false);
    expect(c.creator_blocked).toBe(false);
    expect(c.creator_banned_from_community).toBe(false);
  }
}
