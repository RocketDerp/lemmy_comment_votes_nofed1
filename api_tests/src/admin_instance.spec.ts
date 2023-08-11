jest.setTimeout(10 * 60 * 1000);

import { alpha, setupLogins } from "./shared";
import { serverFetchJSON0 } from "./shared_experimental";


beforeAll(async () => {
  await setupLogins();
});

afterAll(async () => {
});


/*
This test goes out of band, bypassing JavaScript client library
  because it uses an API not yet published.
*/
test(
  "admin bugcheck0",
  async () => {
    let a = {
      auth: alpha.auth,
    };
    let params = {
      serverChoice0: "http://lemmy-alpha:8541/",
      serverURLpath0: "api/v3/admin/database/checkbug0",
      bodyJSON0: JSON.stringify(a),
    };
    let adminActionResult = await serverFetchJSON0(params);
    console.log(adminActionResult);
    },
  2 * 60 * 60 * 1000,
);
