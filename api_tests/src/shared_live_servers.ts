import { CommentView, GetComments, GetCommentsResponse, LemmyHttp } from "lemmy-js-client";
import { API, alpha } from "./shared";
import { getPostsMax } from "./shared_benchmark";

export let target_server = "https://bulletintree.com/";
export let live_client : LemmyHttp;
export let live_user0 : API;
export let live_user0name : string;


export async function setupLiveLogin() {
    if (process.env.LEM_TARGET_SERVER0) {
        target_server = process.env.LEM_TARGET_SERVER0;
    }

    live_client = new LemmyHttp(target_server);
    if (process.env.LEM_USERNAME0) {
        let loginResult = await live_client.login({
            username_or_email: process.env.LEM_USERNAME0,
            password: process.env.LEM_USERPW0 || "nevermatch"
        });

        if (loginResult.jwt && loginResult.jwt.length > 10) {
            console.log("login good for Lemmy user %s", process.env.LEM_USERNAME0);
            live_user0name = process.env.LEM_USERNAME0;
            live_user0 = {
                client: live_client,
                auth: loginResult.jwt
                }
            // ToDo: remove use of alpha
            // alpha.auth = loginResult.jwt;
        } else {
            console.error("login failed, do not set username environment variable or fix password");
            process.exit(10);
        }
    }

    // alpha.client = live_client;
    // NOT for read-only "list posts" variation.
    //  await setToBotAccount(alpha);
    console.log("beforeAll set live server client to %s", target_server);
    return live_user0;
}


export function showComments(comments: CommentView[]) {
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


export async function getCommentsMaxLive(
    api: API,
    post_id: number,
    ): Promise<GetCommentsResponse> {
    let form: GetComments = {
        post_id: post_id,
        type_: "All",
        sort: "New",
        limit: 50,
        auth: api.auth,
    };
    return api.client.getComments(form);
}


export async function getCommentsOnMostRecentPostsLive() {
    // sort by most comments, stress server
    let posts = await getPostsMax(live_user0, undefined, "MostComments");
    expect(posts.posts.length).toBeGreaterThanOrEqual(12);
  
    for (let i = 0; i < 12; i++) {
      let post = posts.posts[i];
  
      let comments = await getCommentsMaxLive(live_user0, post.post.id);
      console.log("comments %d coount %d onpost %d", i, comments.comments.length, post.counts.comments);
    }
  }
