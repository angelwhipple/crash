import express, { json, Request, response, Response } from "express";
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
import { socket } from "../client/src/client-socket";

/**
 * AWS S3
 */
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const { v4: uuidv4 } = require("uuid"); // for generating unique keys
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory as Buffers

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

    AWS.config.getCredentials(function (err) {
      if (err) console.log(err.stack);
      // credentials not loaded
      else {
        console.log(`AWS Access key ID: ${AWS.config.credentials.accessKeyId}`);
        console.log(`AWS Secret access key: ${AWS.config.credentials.secretAccessKey}`);
      }
    });
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

/**
 * SECRETS & KEYS
 */

const LINKEDIN_CLIENT_ID = "78kxc3fzhb4yju";
const LINKEDIN_CLIENT_SECRET = "g23XbgeEPXedo7Ag";
const LINKEDIN_REDIRECT_URI = "http://localhost:5050/api/linkedin";
const MAILJET_API_KEY = "ad0a209d6cdfaf5bc197bdc13c5b5715";
const MAILJET_SECRET_KEY = "301cba84814bffab66a60d29e22b7235";
const S3_BUCKET_NAME = "crash-images";

/**
 * TYPES & CONSTANTS
 */

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
interface CustomRequest extends Request {
  files?: MulterFile[];
}
// Record type for a Linkedin access token response
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
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * HELPER FUNCTIONS
 */

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

/**
 * TODO
 *
 * Generates a random invitation code for a newly created
 * community, of the format XXXXX-XX
 * @param req
 * @returns
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

/**
 * USERS, ACCOUNTS, & VERIFICATION
 */

// Linkedin redirect URI: http://localhost:5050/api/linkedin?
router.get("/linkedin", async (req, res) => {
  console.log("[LINKEDIN] Initializing OAuth flow");
  // LINKEDIN OAUTH STEP 1: AUTHORIZATION CODE
  const query = url.parse(req.url, true).query;
  const auth_code = query.code;
  console.log(`[LINKEDIN] Authorization code: ${auth_code}`);

  console.log("[LINKEDIN] Requesting access token");
  // LINKEDIN OAUTH STEP 2: TOKEN REQUEST
  let endpoint_url = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${auth_code}&client_id=${LINKEDIN_CLIENT_ID}&client_secret=${LINKEDIN_CLIENT_SECRET}&redirect_uri=${LINKEDIN_REDIRECT_URI}`;
  await callExternalAPI(endpoint_url)
    .then(async (token_response: tokenResponse) => {
      const access_token = token_response.access_token; // default: 60 day lifespan
      console.log(`[LINKEDIN] Access token: ${access_token}`);

      // LINKEDIN OAUTH STEP 3: AUTHENTICATED REQUESTS FOR USER INFORMATION
      console.log(`[LINKEDIN] Attempting user info requests with token ${access_token}`);
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
        console.log(`[LINKEDIN] Name: ${firstName} ${lastName}, Linkedin ID: ${linkedinId}`);
        endpoint_url = `https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))`;
        axios.get(endpoint_url, axiosConfig).then((response) => {
          // const email = JSON.stringify(response.data); // convert Response Object back into readable JSON
          const emailAddress = response.data.elements[0]["handle~"]["emailAddress"];
          console.log(`[LINKEDIN] Email address: ${emailAddress}`);
          endpoint_url = `https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))`;
          axios.get(endpoint_url, axiosConfig).then((response) => {
            const profilePictureUrl =
              response.data.profilePicture["displayImage~"]["elements"][0]["identifiers"][0][
                "identifier"
              ];
            console.log(`[LINKEDIN] Profile picture url: ${profilePictureUrl}`);
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
      console.log(`[LINKEDIN] Token response error: ${token_error}`);
      res.send(token_error);
    });
  res.redirect("/"); // redirects back to homepage
});

router.get("/getuser", async (req, res) => {
  console.log(`[MONGODB] Requesting user: ${req.query.id}`);
  await User.findById(req.query.id).then((user) => {
    console.log(`[MONGODB] Got user: ${user}`);
    if (user !== null) {
      res.send({ valid: true, user: user });
    } else {
      res.send({ valid: false, user: undefined });
    }
  });
});

// router.get("/fetchusers", async (req, res) => {
//   const userObjs = [];
//   for (const userId of req.query.users!) {
//     await User.findById(userId).then((user) => {
//       userObjs.push(user!);
//     });
//   }
// });

router.post("/userverification", async (req, res) => {
  const request = mailjet
    .apiConnect(MAILJET_API_KEY, MAILJET_SECRET_KEY)
    .post("send", { version: "v3.1" })
    .request(req.body.messages);

  request
    .then((result) => {
      console.log(`[MAILJET] API response: ${result.body}`);
    })
    .catch((err) => {
      console.log(`[MAILJET] API error: ${err}`);
    });
});

router.get("/verified", async (req, res) => {
  const userId = req.query.id;
  console.log(`[MONGODB] Verifying user: ${userId}`);
  User.findByIdAndUpdate(userId, { verified: true }).then((user) => {
    socketManager.getIo().emit("verified", { userId: userId });
    res.redirect("/verified");
  });
});

/**
 * COMMUNITIES
 */

router.post("/community/description", async (req, res) => {
  Community.findByIdAndUpdate(req.body.communityId, { description: req.body.description }).then(
    (community) => {
      res.send({ updated: community });
    }
  );
});
router.get("/community/loadphoto", async (req, res) => {
  Community.findById(req.query.communityId).then((community) => {
    if (community?.aws_img_key) {
      const objectParams = { Bucket: S3_BUCKET_NAME, Key: community?.aws_img_key };
      s3.getObject(objectParams, (err, data) => {
        if (err) console.log(err, err.stack);
        else {
          res.send({ valid: true, buffer: data });
        }
      });
    } else {
      res.send({ valid: false });
    }
  });
});

router.post("/communityphoto", upload.any(), async (req: CustomRequest, res) => {
  console.log("[S3] Listing buckets");
  s3.listBuckets({}, (err, data) => {
    if (err) console.error(err);
    else console.log(data);
  });

  if (req.files) {
    const key = `communityPhotos/${req.body.communityId}_${uuidv4()}`;
    const file = req.files[0];
    const arrayBuffer = Buffer.from(file.buffer);
    const objectParams = {
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: arrayBuffer,
    };

    s3.upload(objectParams, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "[S3]: Failed to upload community picture" });
      }

      const s3Url = data.Location;
      Community.findByIdAndUpdate(req.body.communityId, { aws_img_key: key }).then((community) => {
        res.send({ url: s3Url });
      });
    });
  } else res.send({});
});

router.get("/fetchcommunity", async (req, res) => {
  Community.findById(req.query.communityId).then((community) => {
    if (community !== undefined) res.send({ valid: true, community: community });
    else res.send({ valid: false, community: undefined });
  });
});

router.post("/createcommunity", async (req, res) => {
  await createCommunity(req).then((communityInfo) => {
    socketManager
      .getIo()
      .emit("new community", { owner: communityInfo.owner, code: communityInfo.communityCode });
    res.send(communityInfo.community);
  });
});

router.post("/joincommunity", async (req, res) => {
  await Community.find({ code: req.body.code }).then(async (communities) => {
    if (communities.length !== 0) {
      const dstCommunity = communities[0]; // only 1 unique join code per community
      await Community.findById(dstCommunity._id).then(async (community) => {
        if (community?.members.includes(req.body.userId)) {
          // user already joined community
          res.send({ valid: true, community: community });
        } else {
          await Community.findByIdAndUpdate(dstCommunity._id, {
            $push: { members: req.body.userId },
          }).then(async (updatedCommunity) => {
            await User.findByIdAndUpdate(req.body.userId, {
              $push: { communities: updatedCommunity?._id },
            }).then((updatedUser) => {
              socketManager.getIo().emit("joined community", {
                communityId: updatedCommunity?._id,
                user: updatedUser?._id,
              });
              res.send({ valid: true, community: updatedCommunity });
            });
          });
        }
      });
    } else {
      res.send({ valid: false, community: undefined });
    }
  });
});

router.get("/joincommunity", async (req, res) => {
  socketManager.getIo().emit("join link", { communityCode: req.body.code }); // emit that someone used an invite link (while logged out)
  res.redirect("/");
});

// return a list of community objects associated to a single user
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

/**
 * SEARCH
 */

router.post("/searchprofiles", async (req, res) => {
  console.log(`[BACKEND] Profile search query: ${req.body.query}`); // main search, filtered by user profiles
  res.send({});
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  const msg = `Api route not found: ${req.method} ${req.url}`;
  res.status(404).send({ msg });
});

export default router;
