jest.setTimeout(120000);

import {
  alpha,
  setupLogins,
  resolveBetaCommunity,
  followCommunity,
  unfollowRemotes,
  getSite,
  createCommunity,
  createPost,
} from "./shared";

beforeAll(async () => {
  await setupLogins();
});

afterAll(async () => {
  await unfollowRemotes(alpha);
});

test("multipass create community", async () => {
  let communityRes = await createCommunity(alpha, "MultiPass_MusicAll0");
  // Twi -- 167 | tw
  // Youruba / Yorùbá -- 180 | yo
  alpha.client.editCommunity({
    community_id: communityRes.community_view.community.id,
    auth: alpha.auth,
    posting_restricted_to_mods: true,
    discussion_languages: [180, 167],
    description: 'This is a MultiPass community.\n\nOnly moderators can post here.\n\n' +
       "On this Instance Server, the id is " + communityRes.community_view.community.id
    }
  )
});

test("create several music communities and posts", async () => {
  let communityRes = await createCommunity(alpha, "Bob_Seger");
  let communityRes1 = await createCommunity(alpha, "Britney_Spears");
  let communityRes2 = await createCommunity(alpha, "197x_music");

  let communityListA = [ communityRes.community_view.community,
  communityRes1.community_view.community,
  communityRes2.community_view.community];

  for (let i = 0; i < communityListA.length; i++) {
    let c = communityListA[i];
    await createPost(alpha, c.id);
    await createPost(alpha, c.id);
    await createPost(alpha, c.id);
  }
});


test("multipass create featured posting in community", async () => {
  // ToDo: create featured post in community
  // feature it, lock it

  // some that the local instance won't be able to resolve
  // !pinkfloyd@lemmy.sdf.org !steely@sh.itjust.works !jukebox@sh.itjust.works !entershikari@lemmy.ml !taylorswift@lemmy.world !beatles@sopuli.xyz

  // API call to /post/list should reveal 9 posts
});
