import { OAuth2Client, TokenPayload } from "google-auth-library";
import { NextFunction, Request, Response } from "express";
import User from "./models/User";
import UserInterface from "../shared/User";
import assert from "assert";
import fetch from "node-fetch";

// create a new OAuth client used to verify google sign-in
const GOOGLE_CLIENT_ID = "281523827651-6p2ui3h699r3378i6emjqdm4o68hhnbi.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const verify = (token: string) => {
  return client
    .verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    })
    .then((ticket) => ticket.getPayload());
};

const createUser = async (req: Request, res: Response) => {
  // encrypt password here
  const newUser = new User({
    email: req.body.email,
    dob: req.body.dob,
    username: req.body.username,
    password: req.body.password,
  });
  res.send(await newUser.save());
};

// TODO: DRY out getOrCreate functions
// refactor to check for existing accounts based on input type
const getOrCreateUser_GOOGLE = async (user: TokenPayload) => {
  return User.findOne({ googleid: user.sub }).then(
    async (existingUser: UserInterface | null | undefined) => {
      if (existingUser !== null && existingUser !== undefined) return existingUser;
      const newUser = new User({
        name: user.name,
        googleid: user.sub,
        email: user.email,
      });
      return await newUser.save();
    }
  );
};

const getOrCreateUser_LINKEDIN = async (req: Request) => {
  return await User.findOne({ email: req.body.email, linkedinid: { $exists: true } }).then(
    async (existingUser: UserInterface | null | undefined) => {
      if (existingUser !== null && existingUser !== undefined) return existingUser;
      const newUser = new User({
        name: req.body.name,
        linkedinid: req.body.linkedinid,
        email: req.body.email,
      });
      return await newUser.save();
    }
  );
};

/**
 * Google-Linkedin account consolidation
 * @param user
 */
const consolidateProfiles = async (req: Request, res: Response) => {
  const fields = ["linkedinid", "googleid"];
  const consolidatedUser = new User({
    name: req.body.name,
    email: req.body.email,
  });
  // extract user selected profiles for consolidation only
  const chosenProfiles = fields.filter((field) => req.body.profiles.includes(field));
  for (const field of chosenProfiles) {
    const query = { email: req.body.email, [field]: { $exists: true } };
    await User.findOneAndDelete(query).then((user) => {
      if (user) consolidatedUser[field] = user[field];
    });
  }
  res.send(await consolidatedUser.save());
};

/**
 *
 * @param user
 * @returns
 */
const countProfiles = async (user: UserInterface) => {
  const fields = ["linkedinid", "googleid"];
  const currentProfile: string = fields.filter((field) => field in user)[0];

  const query = { email: user.email, [currentProfile]: { $ne: user[currentProfile] } };
  return User.find(query).then((additionalUsers) => {
    console.log(`[BACKEND] Found extra profiles: ${additionalUsers}`);
    const response = { eligible: additionalUsers.length > 0, profiles: additionalUsers };
    return response;
  });
};

const login = async (req: Request, res: Response) => {
  console.log(`[BACKEND] Reached user profile consolidation check`);
  if ("linkedinid" in req.body) {
    const linkedinUser = await getOrCreateUser_LINKEDIN(req);
    console.log(`Found MongoDB user: ${linkedinUser}`);
    res.send({
      user: linkedinUser,
      consolidate: await countProfiles(linkedinUser),
    });
  } else {
    verify(req.body.token)
      .then(async (user) => {
        if (user === undefined) return;
        const googleUser = await getOrCreateUser_GOOGLE(user);
        return googleUser;
      })
      .then(async (user) => {
        if (user === null || user === undefined) {
          throw new Error("Unable to retrieve user.");
        }
        req.session.user = user;
        res.send({ user: user, consolidate: await countProfiles(user) });
      })
      .catch((err) => {
        console.log(`Failed to login: ${err}`);
        res.status(401).send({ err });
      });
  }
};

const logout = (req: Request, res: Response) => {
  req.session.user = undefined;
  res.send({});
};

const populateCurrentUser = (req: Request, _res: Response, next: NextFunction) => {
  req.user = req.session.user;
  next();
};

// We use any because
const ensureLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).send({ err: "Not logged in." });
  }
  next();
};

export default {
  ensureLoggedIn,
  populateCurrentUser,
  login,
  logout,
  consolidateProfiles,
  createUser,
};
