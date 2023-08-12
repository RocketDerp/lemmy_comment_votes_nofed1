import { alpha } from "./shared";

/*
When experimenting and prototyping, the JavaScript library may not yet have a call.
Yes, this code is spaghetti, combat-wounded ;)
*/
export async function serverFetchJSON0(params0: any) {
  let result0 = {
    params0: params0,
    failureCode: -1,
    failureText: "",
    json: {},
  };
  let serverURL0 = params0.serverChoice0 + params0.serverURLpath0;
  if (serverURL0.indexOf("?") > 0) {
    serverURL0 += "&z0=lemmy_api_testing";
  } else {
    serverURL0 += "?z0=lemmy_api_testing";
  }

  const startTime = process.hrtime();
  try {
    let resp;
    if (params0.bodyJSON0) {
      resp = await fetch(serverURL0, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: params0.bodyJSON0,
      });
    } else {
      // GET method instead of POST
      resp = await fetch(serverURL0);
    }
    //result0.timeConnect = parseHrtimeToSeconds(process.hrtime(startTime));

    if (resp.ok) {
      const queryTimeStart = process.hrtime();
      try {
        result0.json = await resp.json();
        // console.log(result0.json);
      } catch (e0) {
        console.error("JSON parse exception ", serverURL0);
        console.log(e0);
        result0.failureCode = -1000;
        result0.failureText = "JSON parse failure";
      }
      //result0.timeParse = parseHrtimeToSeconds(process.hrtime(queryTimeStart))
    } else {
      console.error("fetch was not OK ", serverURL0);
      result0.failureCode = resp.status;
      result0.failureText = resp.statusText;
    }
  } catch (err) {
    console.error("fetch exception ", serverURL0);
    console.log(err);
    result0.failureCode = -2000;
    result0.failureText = err;
  }

  return result0;
}

export async function lemmyServerDattabaseStatement(statement_number: number) {
  let params = {
    serverChoice0: "http://lemmy-alpha:8541/",
    serverURLpath0:
      "api/v3/admin/database/checkbug0" +
      "?statement=" +
      statement_number +
      "&auth=" +
      alpha.auth,
  };
  let adminActionResult = await serverFetchJSON0(params);
  console.log(adminActionResult);
}
