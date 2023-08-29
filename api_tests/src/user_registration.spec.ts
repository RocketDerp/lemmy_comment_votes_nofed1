jest.setTimeout(120000);

import { PersonView } from "lemmy-js-client/dist/types/PersonView";
import {
  alpha,
  registerUser,
  API,
  setupLogins,
} from "./shared";
import { EditSite, LemmyHttp, LoginResponse, Register } from "lemmy-js-client";
import { GetPosts } from "lemmy-js-client/dist/types/GetPosts";
import exp = require("constants");

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
  // check current registration state
  let siteRes = await alpha.client.getSite({
    auth: alpha.auth
  });
  if (siteRes.site_view.local_site.registration_mode == "RequireApplication") {
    console.log("Site already set to RegistratonMode wit application");
  } else {
    let editSiteForm: EditSite = {
      registration_mode: "RequireApplication",
      auth: alpha.auth,
    };
    let changeSiteRes = await alpha.client.editSite(editSiteForm);
    expect(changeSiteRes.site_view.local_site.registration_mode).toBe("RequireApplication");
  }
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

test("Create user, with registration application answer", async () => {
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

test("Create user, with registration application answer, repeat sanme username, validate denied response", async () => {
  if (! alpha_temp0?.client) {
    throw "Missing alpha_temp0 API client"
  }

  await expect(
    registerUserExtra(alpha_temp0, alpha_temp0_username, "I'm Charlie's dog")
    ).rejects.toBe("user_already_exists");
});



test.skip("Try to login with newly created user while registration application not yet approved", async () => {
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
    // expected exception: registration_application_is_pending
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

test("Try to login with newly created user while registration application not yet approved - login fail", async () => {
  if (! alpha_temp0?.client) {
    throw "Missing alpha_temp0 API client"
  }

  await expect(
    alpha_temp0.client.login( {
      username_or_email: alpha_temp0_username,
      password: default_password,
      } )
     ).rejects.toBe("registration_application_is_pending");
});

/*
***********************************************************************************************************************************
*** 132 character width forever ;)
***    "In 132 character per line mode, the screen is 132 characters wide by 14 lines high (24 lines if the VT100 is equipped with
***     the Advanced Video Option)."
***    "introduced in August 1978, replacing the VT50/VT52 family."
*** Phase II
*** Back in the broadband over-the-cable days, HBO would offer open weekends as promotion
***   maybe a team of moderators is running a Lemmy signup social-media-athon?
*/

test("change lemmy-alpha server back to open registration", async () => {
  // check current registration state
  let siteRes = await alpha.client.getSite({
    auth: alpha.auth
  });
  if (siteRes.site_view.local_site.registration_mode != "RequireApplication") {
    throw "Why is lemmy-alpha not on RequireApplication registration?"
  } else {
    let editSiteForm: EditSite = {
      registration_mode: "Open",
      auth: alpha.auth,
    };
    let changeSiteRes = await alpha.client.editSite(editSiteForm);
    expect(changeSiteRes.site_view.local_site.registration_mode).toBe("Open");
  }
});

test("Try to login with NEVER-APPROVED user while registration application not yet approved - login fail", async () => {
  if (! alpha_temp0?.client) {
    throw "Missing alpha_temp0 API client"
  }

  await expect(
    alpha_temp0.client.login( {
      username_or_email: alpha_temp0_username,
      password: default_password,
      } )
     ).rejects.toBe("registration_application_is_pending");
});


test("change lemmy-alpha server back to Application registration after being Open for signup-campaign", async () => {
  // check current registration state
  let siteRes = await alpha.client.getSite({
    auth: alpha.auth
  });
  if (siteRes.site_view.local_site.registration_mode != "Open") {
    throw "Why is lemmy-alpha not on Open registration?"
  } else {
    let editSiteForm: EditSite = {
      registration_mode: "RequireApplication",
      auth: alpha.auth,
    };
    let changeSiteRes = await alpha.client.editSite(editSiteForm);
    expect(changeSiteRes.site_view.local_site.registration_mode).toBe("RequireApplication");
  }
});

test("Try to login with NEVER-APPROVED user after open, RequireApplication transition - registration application not yet approved - login fail", async () => {
  if (! alpha_temp0?.client) {
    throw "Missing alpha_temp0 API client"
  }

  await expect(
    alpha_temp0.client.login( {
      username_or_email: alpha_temp0_username,
      password: default_password,
      } )
     ).rejects.toBe("registration_application_is_pending");
});



/*
***********************************************************************************************************************************
*** Phase III
*** in the name of understanding how this behaves, try again to create new account under current
***    circumstances - see if enforced.
*/


test("Phase III: Create user, attempting without application answer", async () => {
  let alpha_temp0: API = {
    client: new LemmyHttp("http://127.0.0.1:8541"),
    auth: "",
  };

  // name is randomized by shared library, unlikely to crash.
  await expect(
    registerUser(alpha),
  ).rejects.toBe("registration_application_answer_required");
});


/*
ToDo: previous call took 12ms, why does this call take nearly a fully second?
  Phase III: Create user, with registration application answer (970 ms)
  1. It has no federation, does it? (Sync federation is done for tests, but still? without posts or comments)
  2. no HTTP outbound connect?
  3. Database tables are empty when this is run after fresh api_tests reset of databases
*/
test("Phase III: Create user, with registration application answer", async () => {
  alpha_temp0 = {
    client: new LemmyHttp("http://127.0.0.1:8541"),
    auth: "",
  };

  // Change name from Snoopy to Woodstock to avoid clash.
  alpha_temp0_username = "Woodstock";

  // ACTIVE development: this will crash
  let userRes;
  try {
    userRes = await registerUserExtra(alpha_temp0, alpha_temp0_username, "I'm Charlie's dog's friend, a bird");
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


test("Phase III: Try to login with newly created user while registration application not yet approved - login fail", async () => {
  if (! alpha_temp0?.client) {
    throw "Missing alpha_temp0 API client"
  }

  await expect(
    alpha_temp0.client.login( {
      username_or_email: alpha_temp0_username,
      password: default_password,
      } )
     ).rejects.toBe("registration_application_is_pending");
});



/*
***********************************************************************************************************************************
*** Phase IV
*** Admin of instance approval behaviors
*/


test("Phase IV: Create user, with registration application answer", async () => {
  alpha_temp0 = {
    client: new LemmyHttp("http://127.0.0.1:8541"),
    auth: "",
  };

  // Change name from Woodstock to Spike to avoid clash.
  alpha_temp0_username = "Spike";

  // ACTIVE development: this will crash
  let userRes;
  try {
    userRes = await registerUserExtra(alpha_temp0, alpha_temp0_username, "I'm a dog, Snoopy's brother from Needles California");
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


test("Phase IV: Try to login before registration application approved - login fail", async () => {
  if (! alpha_temp0?.client) {
    throw "Missing alpha_temp0 API client"
  }

  await expect(
    alpha_temp0.client.login( {
      username_or_email: alpha_temp0_username,
      password: default_password,
      } )
     ).rejects.toBe("registration_application_is_pending");
});


test("Phase IV: admin approves registration application", async () => {
    let pendingApplicationsRes = await alpha.client.listRegistrationApplications(
      {
        auth: alpha.auth
      }
    );

    let app = pendingApplicationsRes.registration_applications[0];
    expect(app.creator.name).toBe(alpha_temp0_username);
    // confirm not already approved
    expect(app.registration_application.admin_id).toBeUndefined();

    let adminActionRes = await alpha.client.approveRegistrationApplication( {
      id: app.registration_application.id,
      auth: alpha.auth,
      approve: true,
      } );

    expect (adminActionRes.registration_application.registration_application.admin_id).toBeGreaterThanOrEqual(1);
});


test("Phase IV: Try to login after registration application APPROVED - login working", async () => {
  if (! alpha_temp0?.client) {
    throw "Missing alpha_temp0 API client"
  }

  let loginRes = await alpha_temp0.client.login( {
      username_or_email: alpha_temp0_username,
      password: default_password,
      } );

  expect(loginRes.jwt?.length).toBeGreaterThanOrEqual(8);
});


/*
Intention here isn't just to test that it works, but document behavior changes in code regarding
   outcomes based on interaction of different settings.
*/
test("Phase V: e-mail verification interaction with registration application" , async () => {
  // ToDo: this test
  expect(0).toBe(1);
});


test("Phase VI: account registration sanitize checks on username" , async () => {
  let userRes = await registerUserExtra(alpha_temp0, "jim&amy", "should fail");
  let userRes1 = await registerUserExtra(alpha_temp0, "jim<amy", "should fail");
});

test("Phase VI: account registration slur filter on username" , async () => {
  // Is there a default slur default?
  let userRes = await registerUserExtra(alpha_temp0, "fuck", "should fail");
  let userRes1 = await registerUserExtra(alpha_temp0, "cunt", "should fail");
});

test("Phase VI: account registration slur filter on registraiton answer" , async () => {
  // ToDo: this test
  expect(0).toBe(1);
});
