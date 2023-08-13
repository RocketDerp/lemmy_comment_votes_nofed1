import {
  PostResponse,
  CommentResponse,
  CommunityResponse,
  PostView,
} from "lemmy-js-client";
import {
  API,
  alpha,
  createComment,
  createCommunity,
  followCommunity,
  likePost,
  resolveCommunity,
  saveUserSettings,
} from "./shared";
import { createNoLinkPost, registerUserClient } from "./shared_benchmark";

export interface UserAccount {
  name: string;
  display: string;
  client?: API;
  creator?: API;
  biography?: string;
  NSFW?: boolean;
  first_post?: PostResponse;
  // most recent comment
  recent_comment?: CommentResponse;
  join?: string[];
}

export let username_list: UserAccount[] = [
  {
    name: "HCE",
    display: "Humphrey C Earwicker",
    biography: "Humphrey Chimpden Earwicker.\n\n I own/operate a pub.",
  },
  {
    name: "ALP",
    display: "Anna L Plurabelle",
    biography:
      "Anna Livia Plurabelle. I'm married to Humphrey Chimpden Earwicker.",
    join: ["pub", "wakes"],
  },
  {
    name: "Issy",
    // ToDo: lemmy support longer names: display: "Issy Plurabelle-Earwicker",
    display: "Issay P-E",
    biography: "Issy Plurabelle-Earwicker.",
  },
  { name: "Shem", display: "Shem the Penman" },
  { name: "Shaun", display: "Shaun the Post" },
  { name: "Matt_Gregory", display: "Matt Gregory" },
  { name: "Marcus_Lyons", display: "Marcus Lyons" },
  { name: "Luke_Tarpey", display: "Luke Tarpey" },
  { name: "Johnny", display: "Johnny Mac Dougall" },
  { name: "maid", display: "Kate", biography: "I'm Joe's peer." },
  {
    name: "barman",
    display: "Joe",
    biography: "handyman, and, at times, the bartender.",
    join: ["pub"],
  },
  { name: "quadrivial", display: "quadrivial" },
  { name: "Bloom", display: "Leopold Bloom" },
  { name: "Molly", display: "Molly Bloom" },
  { name: "Stephen", display: "Stephen Dedalus" },
  {
    name: "Milly",
    display: "Milly Bloom",
    NSFW: false,
    biography:
      "15 years old. lives in Mullingar, learn photography. Dating Alec Bannon.",
  },
  {
    name: "Blazes",
    display: "Blazes Boylan",
    NSFW: true,
    biography: "Girls! Girls! Girls!",
  },
  {
    name: "writer_exiled",
    display: "Writer in Exile",
    NSFW: true,
    biography: "Paperback writer...\n\n",
  },
  { name: "Almidano", display: "Almidano Artifoni", biography: "opera singer" },
  {
    name: "Richard",
    display: "Richard Best",
    biography: "Celtic scholar",
    join: ["books", "celtic_legends"],
  },
  { name: "Denis", display: "Denis Breen" },
  { name: "Josie", display: "Josie Breen" },
  { name: "Callan", display: "Nurse Callan", biography: "I work as a nurse!" },
  {
    name: "Carr",
    display: "Private Carr",
    biography: "british soldier",
    join: ["military"],
  },
  {
    name: "The_Citizen",
    display: "The Citizen",
    biography: "go ahead, I've been banned from better social media sites!",
  },
  {
    name: "Martha",
    display: "Martha Clifford",
    biography: "I enjoy correspondence",
  },
  { name: "MacCool", display: "Finn MacCool" },
  {
    name: "Tim",
    display: "Tim Finnegan",
    biography: "I work in construction. I live on Watling street.",
    join: ["Dublin"],
  },
  {
    name: "Annie",
    display: "Annie Finnegan",
    biography: "I like creating original dishes in the kitchen.",
  },
  { name: "simon", display: "Simon Dedalus" },
  {
    name: "Paddy",
    display: "Patrick Dignam",
    biography:
      "RIP Paddy, this is his wife using the account.\n\n number 9, Newbridge Avenue, Sandymount",
    join: ["wakes"],
  },
  {
    name: "Patsy",
    display: "Patrick A Dignam",
    biography: "Patrick Aloysius Dignam. people call me Patsy.",
  },
  {
    name: "bob",
    display: "Bob Doran",
    biography:
      "I got kicked off another Lemmy instance, but they like me at !pub_Kiernan still!",
    join: ["pub_Kiernan"],
  },
  {
    name: "lt_Gardner",
    display: "Lieutenant Gardner",
    biography: "I'm a British soldier.",
    join: ["military"],
  },
];

export interface CommunityHolder {
  name: string;
  display: string;
  creator_index: number;
  community?: CommunityResponse;
  test_community?: CommunityResponse;
  client?: API;
  creator?: API;
  biography?: string;
  NSFW?: boolean;
  first_post?: PostView;
  description?: string;
}

export let community_list: CommunityHolder[] = [
  { name: "pub", display: "Earwicker's Pub", creator_index: 0 },
  { name: "Dublin", display: "City of Dublin", creator_index: 0 },
  { name: "Ireland", display: "Nation of Ireland", creator_index: 0 },
  {
    name: "lemmy_testing",
    display: "Lemmy software application testing",
    creator_index: 3,
  },
  { name: "music", display: "Music of all kinds", creator_index: 15 },
  { name: "photography", display: "Photographs", creator_index: 15 },
  {
    name: "welcome",
    display: "Welcome to Lemmy, Introductions",
    creator_index: 1,
  },
  { name: "books", display: "Books and authors", creator_index: 17 },
  { name: "Mythology", display: "Comparative Mythology", creator_index: 17 },
  { name: "pub_Kiernan", display: "Barney Kiernan's pub", creator_index: 24 },
  { name: "wakes", display: "funeral wakes", creator_index: 28 },
  { name: "military", display: "military service", creator_index: 33 },
  {
    name: "celtic_legends",
    display: "Celtic legends",
    description: "Anyone heard the story of Tristan and Isole?",
    creator_index: 1,
  },
];

export async function sim_create_accounts(admin_account: API) {
  for (let i = 0; i < username_list.length; i++) {
    const u = username_list[i];
    u.client = await registerUserClient(alpha, u.name);
    u.creator = alpha;
  }
}

export async function sim_users_update_profile() {
  for (let i = 0; i < username_list.length; i++) {
    const u = username_list[i];
    if (!u.client) {
      throw "client missing for user on profile update";
    }
    try {
      await saveUserSettings(u.client, {
        auth: u.client.auth,
        display_name: u.display,
        bio: u.biography,
        blur_nsfw: u.NSFW || false,
        show_nsfw: u.NSFW || false,
      });
    } catch (e0) {
      console.error("exception updating user profile, %d %s", i, u.name);
      console.log(e0);
    }
  }
}

export async function sim_create_communities() {
  for (let i = 0; i < community_list.length; i++) {
    const c = community_list[i];
    let cc = username_list[c.creator_index].client;
    if (!cc) {
      throw "community creator client not found";
    }
    c.community = await createCommunity(cc, c.name, c.display);
  }
}

export async function sim_follow_two_communities() {
  for (let i = 0; i < username_list.length; i++) {
    const u = username_list[i];
    if (!u.client) {
      throw "need user client to follow";
    }
    let cid = community_list[0].community?.community_view.community.id;
    if (!cid) {
      throw "community id missing?";
    }
    await followCommunity(u.client, true, cid);
    cid = community_list[6].community?.community_view.community.id;
    if (!cid) {
      throw "community id missing?";
    }
    await followCommunity(u.client, true, cid);
  }
}

export async function sim_join_personal_communities() {
  for (let i = 0; i < username_list.length; i++) {
    const u = username_list[i];
    if (!u.client) {
      throw "need user client to follow";
    }
    if (u.join) {
      for (let c = 0; c < u.join.length; c++) {
        let name = u.join[c];
        // this is the convention that Lemmy testing utilizes in other test files.
        let searchShort = `!${name}@lemmy-alpha:8541`;
        try {
          let resolveResult = await resolveCommunity(u.client, searchShort);
          let cid = resolveResult.community?.community.id;
          if (!cid) {
            throw "community id missing after searching by name?";
          }
          await followCommunity(u.client, true, cid);
        } catch (e0) {
          console.error("failure to resolve or follow community %s", name);
          console.log(e0);
        }
      }
    }
  }
}

export async function sim_create_welcome_posts() {
  let c = community_list[6];
  if (!c.community) {
    throw "community missing for creating posts";
  }
  let cid = c.community?.community_view.community.id;
  for (let i = 0; i < username_list.length; i++) {
    const u = username_list[i];
    if (!u.client) {
      throw "user client not found";
    }
    let body;
    if (u.biography) {
      body = "Hello Alpha users.\n\n *About* my self... " + u.biography;
    }
    u.first_post = await createNoLinkPost(
      u.client,
      cid,
      "I am " + u.name,
      body,
    );
  }
}

export async function sim_create_reply_comments_to_posts() {
  for (let i = 0; i < username_list.length; i++) {
    const u = username_list[i];
    const fp = u.first_post?.post_view;
    if (!fp) {
      throw "where is the first post for user?";
    }
    if (!u.client) {
      throw "unable to comment, user missing client";
    }

    for (let r = 0; r < username_list.length; r++) {
      let reply_to_firstpost = username_list[r].first_post?.post_view;
      if (!reply_to_firstpost) {
        throw "reply to first post missing?";
      }
      if (reply_to_firstpost.creator.name === u.name) {
        u.recent_comment = await createComment(
          u.client,
          fp.post.id,
          undefined,
          "**Thank you** everyone for all these replies!",
        );
      } else {
        u.recent_comment = await createComment(
          u.client,
          reply_to_firstpost.post.id,
          undefined,
          "Hello, I'm " +
            u.display +
            "\n\n" +
            "*Welcome to Lemmy*, meet at /c/pub anytime!",
        );
        await likePost(u.client, 1, reply_to_firstpost.post);
      }
    }
  }
}

export async function sim_create_stress_test_communities() {
  for (let i = 0; i < community_list.length; i++) {
    const c = community_list[i];
    let cc = username_list[c.creator_index].client;
    if (!cc) {
      throw "community creator client not found";
    }
    c.test_community = await createCommunity(cc, "zy_" + c.name);
  }
  // 3 is testing community, in double level of meaning
  let c = community_list[3].test_community?.community_view;
  console.log("id of test community %s %d", c?.community.name, c?.community.id);
}
