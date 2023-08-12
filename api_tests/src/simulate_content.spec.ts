/*
Intention here is to create some content
using non-admin accounts.
Try to use screenshot worthy user names, community, posts.
Perhaps try to run this before all other tests
to have tests assume certain content / counting is done.
*/
jest.setTimeout(20 * 60 * 1000);

import { clearConfigCache } from "prettier";
import { API, alpha, createCommunity, createPost, setupLogins } from "./shared";
import { createNoLinkPost, registerUserClient } from "./shared_benchmark";
import { lemmyServerDattabaseStatement, serverFetchJSON0 } from "./shared_experimental";
import { CommunityResponse, PostResponse, PostView } from "lemmy-js-client";


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
  first_post?: PostResponse
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
biography: "Girls! Girls! Girls!"}
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
        c.community = await createCommunity(cc, c.name);
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
        u.first_post = await createNoLinkPost(u.client, cid, "I am " + u.name);
      }
    },
  3 * 60 * 1000,
);
