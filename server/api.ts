import express, { Request, Response } from "express";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import auth from "./auth";
import socketManager from "./server-socket";
import url from "url";
import request from "request";
import User from "./models/User";
import Community from "./models/Community";
import CommunityInterface from "../shared/Community";
const router = express.Router();
import mailjet from "node-mailjet";
import e from "express";
import assert from "assert";

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // Not logged in.
    return res.send({});
  }
  res.send(req.user);
});
router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user) {
    const socket = socketManager.getSocketFromSocketID(req.body.socketid);
    if (socket !== undefined) socketManager.addUser(req.user, socket);
  }
  res.send({});
});

router.post("/linkedin", auth.login);
router.post("/consolidate", auth.consolidateProfiles);
router.post("/createuser", auth.createUser);
router.get("/existingaccount", auth.existingUser);

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

const LINKEDIN_CLIENT_ID = "78kxc3fzhb4yju";
const LINKEDIN_CLIENT_SECRET = "g23XbgeEPXedo7Ag";
const LINKEDIN_REDIRECT_URI = "http://localhost:5050/api/linkedin";

/**
 * Record type for a Linkedin access token response
 */
type tokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
};

type profileResponse = Response & {
  ID: string | undefined;
  firstName: Object;
  lastName: Object;
  profilePicture: Object;
};

enum CommunityType {
  "UNIVERSITY",
  "WORKPLACE",
  "LIVING",
  "LOCAL",
}

type CommunityInfo = {
  community: CommunityInterface;
  communityCode: String;
  owner: String;
};

const MAILJET_API_KEY = "ad0a209d6cdfaf5bc197bdc13c5b5715";
const MAILJET_SECRET_KEY = "301cba84814bffab66a60d29e22b7235";

/**
 * Async helper for making requests to external APIs
 * @param url URL of the desired API endpoint
 * @returns a Promise that resolves when the API call resolves,
 * otherwise the Promise rejects if the call returns an error
 */
const callExternalAPI = (
  endpoint_url: string
): Promise<tokenResponse & profileResponse & undefined> => {
  return new Promise((resolve, reject) => {
    request(endpoint_url, { json: true }, (err, res, body) => {
      if (err) reject(err);
      resolve(body);
    });
  });
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Generates a random invitation code for a newly created
 * community, of the format XXXXX-XX
 */
const createCommunity = async (req: Request): Promise<CommunityInfo> => {
  let communityType;
  switch (req.body.communityType) {
    case CommunityType.UNIVERSITY: {
      communityType = "UNIVERSITY";
    }
    case CommunityType.WORKPLACE: {
      communityType = "WORKPLACE";
    }
    case CommunityType.LIVING: {
      communityType = "LIVING";
    }
    case CommunityType.LOCAL: {
      communityType = "LOCAL";
    }
  }
  // generate community code, need some way of checking uniqueness
  let communityCode = "";
  for (let i = 0; i < 5; i++) {
    const rand1 = Math.floor(Math.random() * 10); // generate random int btwn [0, 9] inclusive
    communityCode += `${rand1}`;
  }
  communityCode += `-`;
  let [min, max] = [0, 24];
  for (let i = 0; i < 2; i++) {
    const rand2 = Math.floor(Math.random() * (max - min + 1) + min);
    communityCode += LETTERS[rand2];
  }

  const community = new Community({
    name: req.body.communityName,
    owner: req.body.userId,
    members: [req.body.userId],
    admin: [req.body.userId],
    type: communityType,
    code: communityCode,
  });
  return await community.save().then((newCommunity) => {
    return User.findByIdAndUpdate(req.body.userId, {
      $push: { communities: newCommunity._id },
    }).then((user) => {
      return {
        community: newCommunity,
        communityCode: newCommunity.code,
        owner: newCommunity.owner,
      };
    });
  });
};

// Linkedin redirect URI: http://localhost:5050/api/linkedin?
router.get("/linkedin", async (req, res) => {
  console.log("[BACKEND] Initializing Linkedin OAuth flow");
  // LINKEDIN OAUTH STEP 1: AUTHORIZATION CODE
  const query = url.parse(req.url, true).query;
  const auth_code = query.code;
  console.log(`[BACKEND] Authorization code: ${auth_code}`);

  console.log("[BACKEND] Requesting Linkedin access token");
  // LINKEDIN OAUTH STEP 2: TOKEN REQUEST
  let endpoint_url = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${auth_code}&client_id=${LINKEDIN_CLIENT_ID}&client_secret=${LINKEDIN_CLIENT_SECRET}&redirect_uri=${LINKEDIN_REDIRECT_URI}`;
  await callExternalAPI(endpoint_url)
    .then(async (token_response: tokenResponse) => {
      const access_token = token_response.access_token; // default: 60 day lifespan
      console.log(`[BACKEND] Access token: ${access_token}`);

      // LINKEDIN OAUTH STEP 3: AUTHENTICATED REQUESTS FOR USER INFORMATION
      console.log(`[BACKEND] Attempting user info requests with token ${access_token}`);
      endpoint_url = `https://api.linkedin.com/v2/me`;
      const headers = { Authorization: `Bearer ${access_token}` };
      const axiosConfig = { headers };
      axios.get(endpoint_url, axiosConfig).then((response) => {
        const liteProfile = response.data;
        const [firstName, lastName, linkedinId] = [
          liteProfile.localizedFirstName,
          liteProfile.localizedLastName,
          liteProfile.id,
        ];
        console.log(`[BACKEND] Name: ${firstName} ${lastName}, Linkedin ID: ${linkedinId}`);
        endpoint_url = `https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))`;
        axios.get(endpoint_url, axiosConfig).then((response) => {
          // const email = JSON.stringify(response.data); // convert Response Object back into readable JSON
          const emailAddress = response.data.elements[0]["handle~"]["emailAddress"];
          console.log(`[BACKEND] Email address: ${emailAddress}`);
          endpoint_url = `https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))`;
          axios.get(endpoint_url, axiosConfig).then((response) => {
            const profilePictureUrl =
              response.data.profilePicture["displayImage~"]["elements"][0]["identifiers"][0][
                "identifier"
              ];
            console.log(`[BACKEND] Profile picture url: ${profilePictureUrl}`);
            const loginUrl = `http://localhost:5050/api/login`;
            const loginBody = {
              name: `${firstName} ${lastName}`,
              linkedinid: linkedinId,
              email: emailAddress,
              pfp: profilePictureUrl,
            };

            axios.post(loginUrl, loginBody).then((response) => {
              // const readable = JSON.stringify(response.data);
              socketManager.getIo().emit("linkedin", response.data);
            });
          });
        });
      });
    })
    .catch((token_error) => {
      console.log(`[BACKEND] Token response error: ${token_error}`);
      res.send(token_error);
    });
  res.redirect("/"); // redirects back to homepage
});

router.post("/searchprofiles", async (req, res) => {
  console.log(`[BACKEND] Profile search query: ${req.body.query}`); // main search, filtered by user profiles
  res.send({});
});

router.post("/createcommunity", async (req, res) => {
  await createCommunity(req).then((communityInfo) => {
    socketManager
      .getIo()
      .emit("new community", { owner: communityInfo.owner, code: communityInfo.communityCode });
    res.send(communityInfo.community);
  });
});

router.get("/getuser", async (req, res) => {
  console.log(`[BACKEND] Requesting user: ${req.query.id}`);
  await User.findById(req.query.id).then((user) => {
    console.log(`[BACKEND] Got user: ${user}`);
    if (user !== null) {
      res.send({ valid: true, user: user });
    } else {
      res.send({ valid: false, user: undefined });
    }
  });
});

// send back a list of community objects
router.get("/communities", async (req, res) => {
  await User.findById(req.query.id).then(async (user) => {
    if (user && user.communities.length > 0) {
      const communityInfos: CommunityInterface[] = [];
      for (const communityId of user.communities) {
        await Community.findById(communityId).then((communityInfo) => {
          communityInfos.push(communityInfo!);
        });
      }
      res.send({ valid: true, communities: communityInfos });
    } else res.send({ valid: false, communities: [] });
  });
});

router.post("/userverification", async (req, res) => {
  const request = mailjet
    .apiConnect(MAILJET_API_KEY, MAILJET_SECRET_KEY)
    .post("send", { version: "v3.1" })
    .request(req.body.messages);

  request
    .then((result) => {
      console.log(`[BACKEND] Mailjet API response: ${result.body}`);
    })
    .catch((err) => {
      console.log(`[BACKEND] Mailjet API error: ${err}`);
    });
});

router.get("/verified", async (req, res) => {
  // assert(typeof req.query.id === "string", "invalid verified user ID");
  const userId = req.query.id;
  console.log(`[BACKEND] Verifying user: ${userId}`);
  User.findByIdAndUpdate(userId, { verified: true }).then((user) => {
    socketManager.getIo().emit("verified", { userId: userId });
    res.redirect("/verified");
  });
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  const msg = `Api route not found: ${req.method} ${req.url}`;
  res.status(404).send({ msg });
});

export default router;
