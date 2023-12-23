import express, { json, Request, response, Response } from "express";
import auth from "./auth";
import socketManager from "./server-socket";
import User from "./models/User";
import Community from "./models/Community";
import CommunityInterface from "../shared/Community";
const router = express.Router();
import mailjet from "node-mailjet";
import helpers from "./helpers";
import { CustomRequest, TokenResponse } from "./types";

/**
 * SECRETS & KEYS
 */

const LINKEDIN_CLIENT_ID = "78kxc3fzhb4yju";
const LINKEDIN_CLIENT_SECRET = "g23XbgeEPXedo7Ag";
const LINKEDIN_REDIRECT_URI = "http://localhost:5050/api/user/linkedin";
const MAILJET_API_KEY = "ad0a209d6cdfaf5bc197bdc13c5b5715";
const MAILJET_SECRET_KEY = "301cba84814bffab66a60d29e22b7235";
const S3_BUCKET_NAME = "crash-images";

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

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

/**
 * USERS, ACCOUNTS, & VERIFICATION
 */

router.post("/user/create", auth.createUser);
router.post("/user/linkedin", auth.login);
router.post("/user/consolidate", auth.consolidateProfiles);
router.get("/user/exists", auth.existingUser);
router.get("/user/linkedin", auth.linkedin);

router.get("/user/fetch", async (req, res) => {
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

router.post("/user/verification", async (req, res) => {
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

router.get("/user/verified", async (req, res) => {
  const userId = req.query.id;
  console.log(`[MONGODB] Verifying user: ${userId}`);
  User.findByIdAndUpdate(userId, { verified: true }).then((user) => {
    socketManager.getIo().emit("verified", { userId: userId });
    res.redirect("/verified");
  });
});

router.post("/user/update", upload.any(), async (req: CustomRequest, res) => {
  if (req.files && req.files[0]) {
    const key = `profilePhotos/${req.body.userId}_${uuidv4()}`;
    const file = req.files[0];
    try {
      const { url, buffer } = await helpers.uploadImageToS3(file, key);
      User.findByIdAndUpdate(req.body.userId, { aws_img_key: key }).then((user) => {
        socketManager.getIo().emit("profile photo", { image: buffer });
        res.send({ valid: true, url: url });
      });
    } catch (error) {
      console.error(`[S3] Error uploading image: ${error}`);
      res.status(500).send({ valid: false, url: "" });
    }
  } else res.send({});
});

router.get("/user/loadphoto", async (req, res) => {
  User.findById(req.query.userId).then(async (user) => {
    if (user?.aws_img_key) {
      try {
        const buffer = await helpers.getImageS3(user.aws_img_key.toString());
        res.send({ valid: true, buffer: buffer });
      } catch (error) {
        console.error(`[S3] Error loading image from S3: ${error}`);
        res.status(500).send({ valid: false });
      }
    } else {
      res.send({ valid: false });
    }
  });
});

// return a list of community objects associated to a single user
router.get("/user/communities", async (req, res) => {
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
 * COMMUNITIES
 */

router.post("/community/description", async (req, res) => {
  Community.findByIdAndUpdate(req.body.communityId, { description: req.body.description }).then(
    (community) => {
      socketManager.getIo().emit("community description", { description: req.body.description });
      res.send({ updated: community });
    }
  );
});
router.get("/community/loadphoto", async (req, res) => {
  Community.findById(req.query.communityId).then(async (community) => {
    if (community?.aws_img_key) {
      try {
        const buffer = await helpers.getImageS3(community.aws_img_key.toString());
        res.send({ valid: true, buffer: buffer });
      } catch (error) {
        console.error(`[S3] Error loading image from S3: ${error}`);
        res.status(500).send({ valid: false });
      }
    } else {
      res.send({ valid: false });
    }
  });
});

router.post("/community/updatephoto", upload.any(), async (req: CustomRequest, res) => {
  if (req.files) {
    const key = `communityPhotos/${req.body.communityId}_${uuidv4()}`;
    const file = req.files[0];
    try {
      const { url, buffer } = await helpers.uploadImageToS3(file, key);
      Community.findByIdAndUpdate(req.body.communityId, { aws_img_key: key }).then((community) => {
        socketManager.getIo().emit("community photo", { image: buffer });
        res.send({ valid: true, url: url });
      });
    } catch (error) {
      console.error(`[S3] Error uploading image: ${error}`);
      res.status(500).send({ valid: false, url: "" });
    }
  } else res.send({});
});

router.get("/community/fetch", async (req, res) => {
  Community.findById(req.query.communityId).then((community) => {
    if (community !== undefined) res.send({ valid: true, community: community });
    else res.send({ valid: false, community: undefined });
  });
});

router.post("/community/create", async (req, res) => {
  await helpers.createCommunity(req).then((communityInfo) => {
    socketManager
      .getIo()
      .emit("new community", { owner: communityInfo.owner, code: communityInfo.communityCode });
    res.send(communityInfo.community);
  });
});

router.post("/community/join", async (req, res) => {
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

router.get("/community/join", async (req, res) => {
  socketManager.getIo().emit("join link", { communityCode: req.body.code }); // emit that someone used an invite link (while logged out)
  res.redirect("/");
});

/**
 * SEARCH
 */

router.post("/search/profiles", async (req, res) => {
  console.log(`[BACKEND] Profile search query: ${req.body.query}`); // main search, filtered by user profiles
  res.send({});
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  const msg = `Api route not found: ${req.method} ${req.url}`;
  res.status(404).send({ msg });
});

export default router;
