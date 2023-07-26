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
  return await User.findOne({ email: req.body.email }).then(
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
 * TODO: implement Google-Linkedin account consolidation
 * @param user
 */
const consolidateProfiles = (user: UserInterface) => {
  User.find({ email: user.email }).then((users) => {
    if (users.length > 1) {
      // TODO: >1 user profile exists under the same email
      console.log(`Profile consolidation needed`);
    } else {
      console.log(`No user profile consolidation necessary`);
    }
  });
};

const login = async (req: Request, res: Response) => {
  console.log(`Successfully reached consolidate login`);
  if ("linkedinid" in req.body) {
    const linkedinUser = await getOrCreateUser_LINKEDIN(req);
    console.log(`Found user: ${linkedinUser}`);
    consolidateProfiles(linkedinUser);
    res.send(linkedinUser);
  } else {
    verify(req.body.token)
      .then(async (user) => {
        if (user === undefined) return;
        const googleUser = await getOrCreateUser_GOOGLE(user);
        consolidateProfiles(googleUser);
        return googleUser;
      })
      .then((user) => {
        if (user === null || user === undefined) {
          throw new Error("Unable to retrieve user.");
        }
        req.session.user = user;
        res.send(user);
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
};
