import CommunityInterface from "../shared/Community";
import { Request, Response } from "express";

/**
 * TYPES & CONSTANTS
 */

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface CustomRequest extends Request {
  files?: MulterFile[];
}

// Record type for a Linkedin access token response
export type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
};

export type ProfileResponse = Response & {
  ID: string | undefined;
  firstName: Object;
  lastName: Object;
  profilePicture: Object;
};

export enum CommunityType {
  "UNIVERSITY",
  "WORKPLACE",
  "LIVING",
  "LOCAL",
}

export type CommunityInfo = {
  community: CommunityInterface;
  communityCode: String;
  owner: String;
};

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
