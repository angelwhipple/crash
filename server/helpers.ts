import { Request } from "express";
import request from "request";
import Community from "./models/Community";
import User from "./models/User";
import {
  TokenResponse,
  ProfileResponse,
  CommunityType,
  CommunityInfo,
  LETTERS,
  MulterFile,
} from "./types";

/**
 * AWS S3 CONFIG
 */

const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const sts = new AWS.STS();
const S3_BUCKET_NAME = "crash-images";
const IAM_ROLE_ARN = "arn:aws:iam::416540946578:user/crash-admin";

/**
 * HELPER FUNCTIONS
 */

const uploadImageToS3 = async (
  file: MulterFile,
  key: string
): Promise<{ url: string; buffer: ArrayBuffer }> => {
  return new Promise<{ url: string; buffer: ArrayBuffer }>((resolve, reject) => {
    console.log("[S3] Uploading image file");
    const arrayBuffer = Buffer.from(file.buffer);
    const objectParams = {
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: arrayBuffer,
      ContentType: "image/jpeg",
    };
    s3.upload(objectParams, (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      const s3Url = data.Location;
      resolve({ url: s3Url, buffer: arrayBuffer });
    });
  });
};

const getImageS3 = async (key: string): Promise<ArrayBuffer> => {
  console.log("[S3] Loading image file");
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const objectParams = { Bucket: S3_BUCKET_NAME, Key: key };
    s3.getObject(objectParams, (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve(data);
    });
  });
};

/**
 * Async helper for making requests to external APIs
 * @param url URL of the desired API endpoint
 * @returns a Promise that resolves when the API call resolves,
 * otherwise the Promise rejects if the call returns an error
 */
const callExternalAPI = (
  endpoint_url: string
): Promise<TokenResponse & ProfileResponse & undefined> => {
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

export default {
  createCommunity,
  callExternalAPI,
  uploadImageToS3,
  getImageS3,
};
