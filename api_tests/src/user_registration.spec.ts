jest.setTimeout(120000);

import { PersonView } from "lemmy-js-client/dist/types/PersonView";
import {
  alpha,
  beta,
  registerUser,
  resolvePerson,
  getSite,
  createPost,
  resolveCommunity,
  createComment,
  resolveBetaCommunity,
  deleteUser,
  resolvePost,
  API,
  resolveComment,
  saveUserSettingsFederated,
  setupLogins,
} from "./shared";
import { EditSite, LemmyHttp, LoginResponse, Register } from "lemmy-js-client";
import { GetPosts } from "lemmy-js-client/dist/types/GetPosts";

beforeAll(async () => {
  await setupLogins();
});

let apShortname: string;

function assertUserFederation(userOne?: PersonView, userTwo?: PersonView) {
  expect(userOne?.person.name).toBe(userTwo?.person.name);
  expect(userOne?.person.display_name).toBe(userTwo?.person.display_name);
  expect(userOne?.person.bio).toBe(userTwo?.person.bio);
  expect(userOne?.person.actor_id).toBe(userTwo?.person.actor_id);
  expect(userOne?.person.avatar).toBe(userTwo?.person.avatar);
  expect(userOne?.person.banner).toBe(userTwo?.person.banner);
  expect(userOne?.person.published).toBe(userTwo?.person.published);
}


test("change lemmy-alpha server setting to require registration application", async () => {
  // Registration applications are now enabled by default, need to disable them
  let editSiteForm: EditSite = {
    registration_mode: "RequireApplication",
    auth: alpha.auth,
  };
  await alpha.client.editSite(editSiteForm);
});

test("Create user, attempting without application answer", async () => {
  let alpha_temp0: API = {
    client: new LemmyHttp("http://127.0.0.1:8541"),
    auth: "",
  };

  await expect(
    registerUser(alpha),
  ).rejects.toBe("registration_application_answer_required");
});


export let default_password = "rustcargo1970";

export async function registerUserExtra(
  api: API,
  username: string,
  answer: string,
): Promise<LoginResponse> {
  let form: Register = {
    username,
    password: default_password,
    password_verify: default_password,
    answer: answer,
    show_nsfw: true,
  };
  return api.client.register(form);
}

test("Create user, with application answer", async () => {
  let alpha_temp0: API = {
    client: new LemmyHttp("http://127.0.0.1:8541"),
    auth: "",
  };

  // ACTIVE development: this will crash
  let userRes;
  try {
    // userRes = await registerUserExtra(alpha_temp0, "Snoopy", "I'm Charlie's dog");
    // better exception with direct call in try?
    let form: Register = {
      username: "Snoopy",
      password: default_password,
      password_verify: default_password,
      answer: "I'm Charlie's dog",
      show_nsfw: true,
    };
    userRes = await alpha_temp0.client.register(form);
  } catch(e0) {
    console.error("exception during Account Registration");
    console.log(e0);
    process.exit(10);
  }
  expect(userRes.jwt).toBeDefined();
  alpha_temp0.auth = userRes.jwt ?? "";

  let site = await getSite(alpha_temp0);
  expect(site.my_user).toBeDefined();
  if (!site.my_user) {
    throw "Missing site user";
  }
  apShortname = `@${site.my_user.local_user_view.person.name}@lemmy-alpha:8541`;
});
