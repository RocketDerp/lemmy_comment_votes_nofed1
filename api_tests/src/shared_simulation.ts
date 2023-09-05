import {
  PostResponse,
  CommentResponse,
  CommunityResponse,
  PostView,
  CreateCommunity,
  CreateComment,
} from "lemmy-js-client";
import {
  API,
  alpha,
  // bypassed for local: createCommunity,
  followCommunity,
  getCommunityByName,
  getPosts,
  likePost,
  randomString,
  resolveCommunity,
  saveUserSettings,
} from "./shared";
import { createNoLinkPost, getPostsForTargetCommunity, getPostsMax, registerUserClient, setTargetCommunityName, targetCommunityName } from "./shared_benchmark";

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
  skip_vote_welcome?: boolean;
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
  { name: "Eileen", display: "Eileen Vance" },
  { name: "Aubrey", display: "Aubrey Mills" },
  {
    name: "Porter",
    display: "Porter",
    NSFW: true,
    biography: "maybe I'm someone's alt account, I am dreamy",
    join: ["Dublin"],
    skip_vote_welcome: true,
  },
  // ToDo: 10 lurker accounts that do not create posts or comments, but subscribe and vote
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
  populate_posts?: number;
  populate_post_title?: string;
  languages?: number[];
}

export let community_list: CommunityHolder[] = [
  { name: "pub",
    display: "Earwicker's Pub", creator_index: 0,
    populate_posts: 7,
    populate_post_title: "Bartender I'd like",
  },
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
  { name: "books", display: "Books and authors", creator_index: 17,
    populate_posts: 3,
    populate_post_title: "Did anyone else read the book...",
  },
  { name: "Mythology", display: "Comparative Mythology", creator_index: 17 },
  { name: "pub_Kiernan", display: "Barney Kiernan's pub", creator_index: 24 },
  { name: "wakes", 
     display: "funeral wakes", creator_index: 28,
     populate_posts: 4,
     populate_post_title: "I remember...",
  },
  { name: "military", display: "military service", creator_index: 33 },
  {
    name: "celtic_legends",
    display: "Celtic legends",
    description: "Anyone heard the story of Tristan and Isole?",
    creator_index: 1,
  },
  {
    name: "red_light",
    display: "Red Light District",
    description: "NSFW community for Dublin, “Here in Moicane we flop on the seamy side“",
    creator_index: 36 /* Porter */,
    NSFW: true,
    populate_posts: 6,
    populate_post_title: "what is this place, should I be here? ...",
  },
  {
    name: "snakke",
    display: "skarp snakk",
    description: "'for he could chew upon a skarp snakk of pure undefallen engelsk'",
    creator_index: 36 /* Porder */,
    populate_posts: 3,
    populate_post_title: "skarp snakk - ",
    languages: [31],
  }
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

/*
To allow multiple executions on a database, will look for named communities first.
*/
export async function sim_create_communities(name_prefix: string) {
  let alreadyExistsCount = 0;
  let display_prefix = "";
  let description_prefix = "";
  if (name_prefix)
  {
    display_prefix = name_prefix + " ";
    description_prefix = name_prefix + " testing duplicate ";
  }
  for (let i = 0; i < community_list.length; i++) {
    const c = community_list[i];
    let cc = username_list[c.creator_index].client;
    if (!cc) {
      throw "community creator client not found";
    }
    let communityView;
    try {
      communityView = await getCommunityByName(cc, name_prefix + c.name);
      alreadyExistsCount++;
    } catch (e0) {
      expect(e0).toBe("couldnt_find_community");
    }
    if (!communityView) {
      communityView = await createCommunity(cc, name_prefix + c.name, display_prefix + c.display, description_prefix + c.description, c.NSFW, c.languages);
      if (c.NSFW) {
        console.log("Just created NSFW community %s index %d id %s", c.name, i, communityView.community_view.community);
      }
    }
    // only keep object if it is the primary community creation, not prefix
    if (name_prefix.length == 0) {
      c.community = communityView
    } else {
      c.test_community = communityView;
    }
  }
  if (alreadyExistsCount > 0) {
    console.log("create_communities alreadyExistsCount %d", alreadyExistsCount);
  }
}

export async function sim_create_stress_test_communities() {
  await sim_create_communities("zy_");
  // 3 is testing community, in double level of meaning
  let c = community_list[3].test_community?.community_view;
  console.log("id of test community %s %d", c?.community.name, c?.community.id);
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
      console.log("faiure to find proper response on first post", u.first_post)
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
        if (! u.skip_vote_welcome) {
        await likePost(u.client, 1, reply_to_firstpost.post);
        }
      }
    }
  }
}

export async function sim_create_posts_all_users_one_community(quantity_per_user: number) {
  let c = community_list[3];   // lemmy testing community
  if (!c.community) {
    throw "community missing for creating posts";
  }
  let cid = c.community?.community_view.community.id;
  for (let i = 0; i < username_list.length; i++) {
    const u = username_list[i];
    if (!u.client) {
      throw "user client not found";
    }
    let body = "Testing post\n\n"
         + "timestamp " + Date.now()
         + " Hello Alpha users.\n\n *About* my self... " + u.biography;

    for (let x = 0; x < quantity_per_user; x++) {
      // noLink post is faster and more predictable, server does not need to do outbound Internet connection
      await createNoLinkPost(
        u.client,
        cid,
        "Testing post in Lemmy Test Community. #" + x + " - I am " + u.name,
        body,
      );
    }
  }
}

export async function sim_create_posts_for_specified_communities() {
  for (let i = 0; i < community_list.length; i++) {
    const c = community_list[i];
    if (!c.community) {
      throw "Community missing for creating posts"
    }
    if (c.populate_posts) {
      let cid = c.community?.community_view.community.id;
      for (let x = 0; x < c.populate_posts; x++) {
        const randomUser = username_list[Math.floor(Math.random() * username_list.length)];
        if (!randomUser.client) {
          throw "need client for randomUser"
        }
        if (c.populate_post_title) {
          await createNoLinkPost(randomUser.client, cid, c.populate_post_title + " " + randomUser.name + " " + Date.now());
        } else {
          await createNoLinkPost(randomUser.client, cid, "Content Post " + randomUser.name + " " + Date.now());
        }
      }
    }
  }
}


export async function set_show_nsfw_for_accout(account: API) {
  try {
    let a = await account.client.getSite({
      auth: account.auth
    });
    if (a.my_user?.local_user_view.local_user.show_nsfw) {
      console.log("user already has show_nsfw");
    } else {
      console.log(a.my_user?.local_user_view.local_user);
      await account.client.saveUserSettings(
        {
          auth: account.auth,
          show_nsfw: true,
          // a bug? in lemmy is that it won't save settings without modifying more than 1 field.
          bio: "updated bio to set show_nsfw " + Date.now(),
        }
      );
    };
  } catch (e0) {
    // "user_already_exists" means setting is on.
    console.log("exception updating show_nsfw", e0);
  }
}


export async function sim_vote_posts_specified_communities() {
  for (let i = 0; i < community_list.length; i++) {
    const c = community_list[i];
    if (!c.community) {
      throw "Community missing for creating posts"
    }
    if (c.populate_posts) {
      setTargetCommunityName(c.community.community_view.community.name);
      if (c.community.community_view.community.nsfw) {
        await set_show_nsfw_for_accout(alpha);
      }
      let postsResponse = await getPostsForTargetCommunity(alpha, 50, "New", true);
      expect (postsResponse.posts.length).toBeGreaterThanOrEqual(1);
      for (let y = 0; y < c.populate_posts; y++) {
        const howManyVotesForThisPost = Math.floor(Math.random() * username_list.length) + 1;
        for (let x = 0; x < howManyVotesForThisPost; x++) {
          const voteUser = username_list[x];
          if (!voteUser.client) {
            throw "need client for randomUser"
          }
          if (postsResponse.posts[y].post.creator_id != voteUser.first_post?.post_view.creator.id) {
            await likePost(voteUser.client, 1, postsResponse.posts[y].post);
          }
        }
      }
    }
  }
}


export async function sim_create_NSFW_posts_in_regular_community() {
  const user = username_list[36];
  if (user.client) {
    // create a NSFW posting in a community not marked for NSFW
    setTargetCommunityName("books");
    let postList = await getPostsForTargetCommunity(user.client, 1, "New", true);
    await createNoLinkPost(user.client, postList.posts[0].community.id, "Are NSFW book quotes and passages allowed here?", "example passage: 'hello world'", true);
    await createNoLinkPost(user.client, postList.posts[0].community.id, "Are mods responding? Are NSFW book quotes & passages allowed here?", "example passage: 'hello world'", true);
    // create a post with both NSFW and language, see if it flies under moderator radar
    await createNoLinkPost(user.client, postList.posts[0].community.id, "¡hola! ¿Se permiten aquí citas y pasajes de libros NSFW?", "example passage: 'discorrío, pasando por Adán y Eva, desvía la orilla hacia un recodo de bahía, llevándonos a una comodiosa vicositud recircular de vuelta a Howth Castle y Entornos.'", true, 39);
  };
}

export async function sim_create_multi_language_community_and_posts() {
  const user = username_list[36];
  if (user.client) {
    // create a NSFW posting in a community not marked for NSFW
    setTargetCommunityName("books");
    let postList = await getPostsForTargetCommunity(user.client, 8, "New", true);
    await createNoLinkPost(user.client, postList.posts[0].community.id, "Hola, Español", "Español", false, 39);
    await createNoLinkPost(user.client, postList.posts[0].community.id, "Latin? Are Latin book quotes & passages allowed here?", "Primum opifex, altus prosator, ad terram viviparam et cuncti-potentem sine ullo pudore nec venia, suscepto pluviali atque discinctis perizomatis, natibus nudis uti nati fuissent, sese adpropinquans, flens et gemens, in manum suam evacuavit (highly prosy, crap in his hand, sorry!), postea, animale nigro exoneratus, classicum pulsans, stercus proprium, quod appellavit deiectiones suas, in vas olim honorabile tristitiae posuit, eodem sub invocatione fratrorum gemino-rum Medardi et Godardi laete ac melliflue minxit, psalmum qui incipit: Lingua mea calamus scribae velociter scribentis: magna voce cantitans (did a piss, says he was dejected, asks to be exonerated), demum ex stercore turpi cum divi Orionis iucunditate mixto, cocto, frigorique exposito, encaustum sibi fecit indelibile (faked O’Ryan’s, the indelible ink).", false, 91);
    // ToDo: create comments in other languages on other posts
    let desired = postList.posts.length;
    if (desired > 6) {
      desired = 6;
    }
    for (let x = 0; x < desired; x++)
    {
      await createComment(user.client, postList.posts[x].post.id, undefined, "comment in Español", 39);
      await createComment(user.client, postList.posts[x].post.id, undefined, "Primum opifex, altus prosator, ad terram viviparam et cuncti-potentem sine ullo pudore nec venia, suscepto pluviali atque discinctis perizomatis, natibus nudis uti nati fuissent, sese adpropinquans, flens et gemens, in manum suam evacuavit (highly prosy, crap in his hand, sorry!), postea, animale nigro exoneratus, classicum pulsans, stercus proprium, quod appellavit deiectiones suas, in vas olim honorabile tristitiae posuit, eodem sub invocatione fratrorum gemino-rum Medardi et Godardi laete ac melliflue minxit, psalmum qui incipit: Lingua mea calamus scribae velociter scribentis: magna voce cantitans (did a piss, says he was dejected, asks to be exonerated), demum ex stercore turpi cum divi Orionis iucunditate mixto, cocto, frigorique exposito", 91);
    }
  };
}


// the createCommunity in shared doesn't take description parameter
export async function createCommunity(
  api: API,
  name_: string = randomString(8),
  title = "",
  description = "",
  flag_NSFW?: boolean | undefined,
  discussion_languages?: number[] | undefined
): Promise<CommunityResponse> {
  // some tests rely on auto-generated parameters
  let description_out = "a sample description for " + name_;
  if (description.length > 0) {
    description_out = description;
  }
  let title_out = name_;
  if (title.length > 0) {
    title_out = title;
  }
  let form: CreateCommunity = {
    name: name_,
    title: title_out,
    description: description_out,
    auth: api.auth,
    nsfw: flag_NSFW,
    discussion_languages,
  };
  return api.client.createCommunity(form);
}

export async function createComment(
  api: API,
  post_id: number,
  parent_id?: number,
  content = "a jest test comment",
  language_id?: number,
): Promise<CommentResponse> {
  let form: CreateComment = {
    content,
    post_id,
    parent_id,
    auth: api.auth,
    language_id,
  };
  return api.client.createComment(form);
}
