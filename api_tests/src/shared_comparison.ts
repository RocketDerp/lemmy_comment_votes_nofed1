import { PostView } from "lemmy-js-client/dist/types/PostView";
import { CommunityView } from "lemmy-js-client/dist/types/CommunityView";
import { CommentView } from "lemmy-js-client/dist/types/CommentView";

export function assertPostFederation(postOne?: PostView, postTwo?: PostView) {
  expect(postOne?.post.ap_id).toBe(postTwo?.post.ap_id);
  expect(postOne?.post.name).toBe(postTwo?.post.name);
  expect(postOne?.post.body).toBe(postTwo?.post.body);
  // TODO url clears arent working
  // expect(postOne?.post.url).toBe(postTwo?.post.url);
  expect(postOne?.post.nsfw).toBe(postTwo?.post.nsfw);
  expect(postOne?.post.embed_title).toBe(postTwo?.post.embed_title);
  expect(postOne?.post.embed_description).toBe(postTwo?.post.embed_description);
  expect(postOne?.post.embed_video_url).toBe(postTwo?.post.embed_video_url);
  expect(postOne?.post.published).toBe(postTwo?.post.published);
  expect(postOne?.community.actor_id).toBe(postTwo?.community.actor_id);
  expect(postOne?.post.locked).toBe(postTwo?.post.locked);
  expect(postOne?.post.removed).toBe(postTwo?.post.removed);
  expect(postOne?.post.deleted).toBe(postTwo?.post.deleted);
}

export function assertCommunityFederation(
  communityOne?: CommunityView,
  communityTwo?: CommunityView,
) {
  expect(communityOne?.community.actor_id).toBe(
    communityTwo?.community.actor_id,
  );
  expect(communityOne?.community.name).toBe(communityTwo?.community.name);
  expect(communityOne?.community.title).toBe(communityTwo?.community.title);
  expect(communityOne?.community.description).toBe(
    communityTwo?.community.description,
  );
  expect(communityOne?.community.icon).toBe(communityTwo?.community.icon);
  expect(communityOne?.community.banner).toBe(communityTwo?.community.banner);
  expect(communityOne?.community.published).toBe(
    communityTwo?.community.published,
  );
  expect(communityOne?.community.nsfw).toBe(communityTwo?.community.nsfw);
  expect(communityOne?.community.removed).toBe(communityTwo?.community.removed);
  expect(communityOne?.community.deleted).toBe(communityTwo?.community.deleted);
}

export function assertCommentFederation(
  commentOne?: CommentView,
  commentTwo?: CommentView,
) {
  expect(commentOne?.comment.ap_id).toBe(commentTwo?.comment.ap_id);
  expect(commentOne?.comment.content).toBe(commentTwo?.comment.content);
  expect(commentOne?.creator.name).toBe(commentTwo?.creator.name);
  expect(commentOne?.community.actor_id).toBe(commentTwo?.community.actor_id);
  expect(commentOne?.comment.published).toBe(commentTwo?.comment.published);
  expect(commentOne?.comment.updated).toBe(commentOne?.comment.updated);
  expect(commentOne?.comment.deleted).toBe(commentOne?.comment.deleted);
  expect(commentOne?.comment.removed).toBe(commentOne?.comment.removed);
}


/// Helper function to spit out all in one simple console write
export function consolePosts(posts: any) {
  let outArray = [];
  for (let i = 0; i < posts.length; i++) {
    // console.log("%d title: %s published %s", i, posts[i].post.name, posts[i].post.published);
    outArray.push(i + " title: '" + posts[i].post.name + "' published " + posts[i].post.published
      + " del " + posts[i].post.deleted
      + " remove " + posts[i].post.removed
      + " local " + posts[i].post.local
      + " " + posts[i].post.ap_id
    );
  }
  console.log("posts summary: ", outArray);
}

/// Helper function to spit out all in one simple console write
export function consoleComments(comments: any) {
  let outArray = [];
  for (let i = 0; i < comments.length; i++) {
    // console.log("%d title: %s published %s", i, comments[i].comment.content, comments[i].comment.published);
    outArray.push(i + " '" + comments[i].comment.content + "' published " + comments[i].comment.published
      + " del " + comments[i].comment.deleted
      + " remove " + comments[i].comment.removed
      + " local " + comments[i].comment.local
      + " " + comments[i].comment.ap_id
      );
  }
  console.log("comments summary: ", outArray);
}
