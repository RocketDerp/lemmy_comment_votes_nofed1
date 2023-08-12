/*
Intention here is to create some content
using non-admin accounts.
Try to use screenshot worthy user names, community, posts.
Perhaps try to run this before all other tests
   to have tests assume certain content / counting is done.
   Also by running first, a predictable set of id values for content.
   And detecting changes in id generaiton behavior.
*/
jest.setTimeout(20 * 60 * 1000);

import { API, alpha, createComment, createCommunity, followCommunity, likePost, setupLogins } from "./shared";
import { createNoLinkPost, registerUserClient } from "./shared_benchmark";
import { CommentResponse, CommunityResponse, PostResponse, PostView } from "lemmy-js-client";


beforeAll(async () => {
  await setupLogins();
});

afterAll(async () => {
});

export interface UserAccount {
  name: string,
  display: string,
  client?: API,
  creator?: API,
  biography?: string,
  NSFW?: boolean,
  first_post?: PostResponse,
  // most recent comment
  recent_comment?: CommentResponse
};

export let username_list : UserAccount[] = [
  { name: "HCE",
    display: "Humphrey Chimpden Earwicker"
  },
  { name: "ALP",
    display: "Anna Livia Plurabelle"
  },
  { name: "Issy",
    display: "Issy Plurabelle-Earwicker"
  },
  { name: "Shem",
    display: "Shem the Penman"
  },
  { name: "Shaun",
    display: "Shaun the Post"
  },
  { name: "Matt_Gregory",
    display: "Matt Gregory"
  },
  { name: "Marcus_Lyons",
  display: "Marcus Lyons"
  },
  { name: "Luke_Tarpey",
  display: "Luke Tarpey"
  },
  { name: "Johnny",
  display: "Johnny Mac Dougall"
  },
  { name: "maid",
  display: "Kate"
  },
  { name: "barman",
  display: "Joe"
  },
  { name: "quadrivial",
  display: "quadrivial"},
  { name: "Bloom",
display: "Leopold Bloom"},
  { name: "Molly",
display: "Molly Bloom"},
  { name: "Stephen",
display: "Stephen Dedalus"},
  { name: "Milly",
display: "Milly Bloom",
NSFW: false,
biography: "15 years old. lives in Mullingar, learn photography. Dating Alec Bannon."
},
{ name: "Blazes",
display: "Blazes Boylan",
NSFW: true,
biography: "Girls! Girls! Girls!"},
{ name: "writer_exiled",
display: "Writer in Exile",
NSFW: true,
biography: "Paperback writer...\n\n"}
];

export interface CommunityHolder {
  name: string,
  display: string,
  creator_index: number,
  community?: CommunityResponse,
  client?: API,
  creator?: API,
  biography?: string,
  NSFW?: boolean,
  first_post?: PostView
};

export let community_list: CommunityHolder[] = [
  { name: "pub",
display: "Earwicker's Pub",
creator_index: 0
},
{ name: "Dublin",
display: "City of Dublin",
creator_index: 0
},
{ name: "Ireland",
display: "Nation of Ireland",
creator_index: 0
},
{ name: "lemmy_testing",
display: "Lemmy software application testing",
creator_index: 3
},
{ name: "music",
display: "Music of all kinds",
creator_index: 15
},
{ name: "photography",
display: "Photographs",
creator_index: 15
},
{ name: "welcome",
display: "Welcome to Lemmy, Introductions",
creator_index: 1
},
{ name: "books",
display: "Books and authors",
creator_index: 17
},
{ name: "Mythology",
display: "Comparative Mythology",
creator_index: 17
}
];


test(
  "create usernames",
  async () => {
      for (let i=0; i < username_list.length; i++) {
        const u = username_list[i];
        u.client = await registerUserClient(alpha, u.name);
        u.creator = alpha;
      }
    },
  3 * 60 * 1000,
);

test(
  "create communities",
  async () => {
      for (let i=0; i < community_list.length; i++) {
        const c = community_list[i];
        let cc = username_list[c.creator_index].client;
        if (! cc) {
          throw "community creator client not found";
        }
        c.community = await createCommunity(cc, c.name, c.display);
      }
    },
  3 * 60 * 1000,
);

test(
  "all follow 2 communities",
  async () => {
    for (let i=0; i < username_list.length; i++) {
      const u = username_list[i];
      if (! u.client) {
        throw "need user client to follow";
      }
      let cid = community_list[0].community?.community_view.community.id;
      if (! cid) {
        throw "community id missing?"
      }
      await followCommunity(u.client, true, cid);
      cid = community_list[6].community?.community_view.community.id;
      if (! cid) {
        throw "community id missing?"
      }
      await followCommunity(u.client, true, cid);
    }
  },
  3 * 60 * 1000,
);

test(
  "create welcome posts by members",
  async () => {
    let c = community_list[6];
    if (! c.community) {
      throw "community missing for creating posts";
    }
    let cid = c.community?.community_view.community.id;
    for (let i=0; i < username_list.length; i++) {
        const u = username_list[i];
        if (! u.client) {
          throw "user client not found";
        }
        let body;
        if (u.biography) {
          body = "Hello Alpha users.\n\n *About* my self... " + u.biography;
        }
        u.first_post = await createNoLinkPost(u.client, cid, "I am " + u.name, body);
      }
    },
  3 * 60 * 1000,
);

/*
Another approach is to load a list of posts in /c/welcome
  and reply by each user to those.
*/
test(
  "replies and upvotes to welcome posts by members",
  async () => {
    let c = community_list[6];
    if (! c.community) {
      throw "community missing for creating posts";
    }
    let cid = c.community?.community_view.community.id;
    for (let i=0; i < username_list.length; i++) {
        const u = username_list[i];
        const fp = u.first_post?.post_view;
        if (!fp) {
          throw "where is the first post for user?";
        }
        if (!u.client) {
          throw "unable to comment, user missing client";
        }

        for (let r=0; r < username_list.length; r++) {
          let reply_to_firstpost = username_list[r].first_post?.post_view;
          if (! reply_to_firstpost) {
            throw "reply to first post missing?";
          }
          if (reply_to_firstpost.creator.name === u.name) {
            u.recent_comment = await createComment(u.client, fp.post.id, undefined, "**Thank you** everyone for all these replies!");
          } else {
            u.recent_comment = await createComment(u.client, reply_to_firstpost.post.id, undefined,
               "Hello, I'm " + u.display + "\n\n"
               + "*Welcome to Lemmy*, meet at /c/pub anytime!"
               );
            await likePost(u.client, 1, reply_to_firstpost.post);
          }
        }
      }
    },
  3 * 60 * 1000,
);


test(
  "create stress-test communities",
  async () => {
      for (let i=0; i < community_list.length; i++) {
        const c = community_list[i];
        let cc = username_list[c.creator_index].client;
        if (! cc) {
          throw "community creator client not found";
        }
        c.community = await createCommunity(cc, "zy_" + c.name);
      }
    },
  3 * 60 * 1000,
);
