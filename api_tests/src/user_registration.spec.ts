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
export let alpha_temp0: API;
export let alpha_temp0_username = "Snoopy";

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
  alpha_temp0 = {
    client: new LemmyHttp("http://127.0.0.1:8541"),
    auth: "",
  };

  // ACTIVE development: this will crash
  let userRes;
  try {
    userRes = await registerUserExtra(alpha_temp0, alpha_temp0_username, "I'm Charlie's dog");
  } catch(e0) {
    // possible exception: user_already_exists
    console.error("exception during Account Registration with application answer");
    console.log(e0);
    // process.exit(10);
  }

  if (userRes) {
    // NOTE: do not expect to have jwt, login, after registration with registration pre-processing
    expect(userRes.jwt).toBeUndefined();

    // This switches to the alpha user account to look at profile, not the user just created.
    let personDetailsRes = await alpha.client.getPersonDetails({
      username: alpha_temp0_username
    });
    expect(personDetailsRes.person_view.person.name).toBe(alpha_temp0_username);
  } else {
    expect("userRes defined").toBe("not defined");
  }
});


test("Try to login with newly created user while registration application not yet approved", async () => {
  if (! alpha_temp0?.client) {
    throw "Missing alpha_temp0 API client"
  }

  // ACTIVE development: this will crash
  let loginRes;
  try {
    loginRes = await alpha_temp0.client.login( {
       username_or_email: alpha_temp0_username,
       password: default_password,
    } );
  } catch(e0) {
    console.error("exception during Account Login while registration application not yet responded to");
    console.log(e0);
    process.exit(10);
  }

  if (loginRes) {
    // NOTE: do not expect to have jwt, login, after registration with registration pre-processing
    expect(loginRes.jwt).toBeUndefined();
  } else {
    expect("loginRes defined").toBe("not defined");
  }
});
