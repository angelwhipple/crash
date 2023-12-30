import { OAuth2Client, TokenPayload } from "google-auth-library";
import { NextFunction, Request, Response } from "express";
import User from "./models/User";
import UserInterface from "../shared/User";
import socketManager from "./server-socket";
import axios from "axios";
import dotenv from "dotenv";
import url from "url";
import { TokenResponse, DOMAIN } from "./types";
import helpers from "./helpers";

dotenv.config({});

// create a new OAuth client used to verify google sign-in
const GOOGLE_CLIENT_ID = "281523827651-6p2ui3h699r3378i6emjqdm4o68hhnbi.apps.googleusercontent.com";
const LINKEDIN_CLIENT_ID = "78kxc3fzhb4yju";
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = `${DOMAIN}/api/user/linkedin`;
const SALT_ROUNDS = 10;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const { v4: uuidv4 } = require("uuid"); // for generating unique keys
const bcrypt = require("bcrypt");

const verify = (token: string) => {
  return client
    .verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    })
    .then((ticket) => ticket.getPayload());
};

/**
 * TODO
 * @param req
 * @param res
 */
const existingUser = async (req: Request, res: Response) => {
  User.findOne({ email: req.query.email?.toString(), originid: { $exists: true } }).then((user) => {
    if (user !== null) {
      res.send({ exists: true });
    } else {
      res.send({ exists: false });
    }
  });
};

/**
 * TODO
 * @param req
 * @param res
 */
const createUser = async (req: Request, res: Response) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS); // encryption
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const newUser = new User({
    email: req.body.email,
    dob: req.body.dob,
    name: `Crash User`,
    username: req.body.username,
    hashed_pw: hashedPassword,
    pw_salt: salt,
    originid: uuidv4().toString(),
  });
  await newUser.save().then((user) => {
    res.send(user);
  });
};

/**
 * TODO
 * @param user
 * @returns
 */
const getOrCreateUser_GOOGLE = async (user: TokenPayload) => {
  return User.findOne({ googleid: user.sub }).then(
    async (existingUser: UserInterface | null | undefined) => {
      if (existingUser !== null && existingUser !== undefined) return existingUser;
      const uniqueId = uuidv4().toString();
      const newUser = new User({
        name: user.name,
        username: `user_${uniqueId.slice(0, 8)}`,
        googleid: user.sub,
        email: user.email,
      });
      return await newUser.save();
    }
  );
};

/**
 * TODO
 * @param req
 * @returns
 */
const getOrCreateUser_LINKEDIN = async (req: Request) => {
  return await User.findOne({ email: req.body.email, linkedinid: { $exists: true } }).then(
    async (existingUser: UserInterface | null | undefined) => {
      if (existingUser !== null && existingUser !== undefined) return existingUser;
      const uniqueId = uuidv4().toString();
      const newUser = new User({
        name: req.body.name,
        username: `user_${uniqueId.slice(0, 8)}`,
        linkedinid: req.body.linkedinid,
        email: req.body.email,
      });
      return await newUser.save();
    }
  );
};

/**
 * TODO
 * @param req
 * @returns
 */
const loginUser_ORIGIN = async (req: Request) => {
  return await User.findOne({
    email: req.body.email?.toString(),
    originid: { $exists: true },
  }).then(async (user) => {
    const hashedEnteredPassword = await bcrypt.hash(req.body.password, user!.pw_salt);
    if (hashedEnteredPassword === user!.hashed_pw) {
      return { user: user, status: { valid: true, account: user, message: "" } };
    } else {
      return {
        user: undefined,
        status: {
          valid: false,
          account: undefined,
          message: "Incorrect password, please try again",
        },
      };
    }
  });
};

/**
 * TODO
 * Google-Linkedin account consolidation
 * @param user
 */
const consolidateProfiles = async (req: Request, res: Response) => {
  const fields = ["linkedinid", "googleid", "originid"];
  // extract ALL original fields from the currently active profile: use User.findbyID()
  // for each additional chosen profile, set missing fields one by one
  const originalUser = await User.findById(req.body.id);

  // extract user selected profiles for consolidation only
  const chosenProfiles = fields.filter((field) => req.body.profiles.includes(field));
  for (const field of chosenProfiles) {
    console.log(field);
    const query = { email: req.body.email, [field]: { $exists: true } };
    await User.findOneAndDelete(query).then(async (user) => {
      if (user) {
        user.schema.eachPath(async (path: string) => {
          if (originalUser?.get(path) === undefined && user.get(path) !== undefined) {
            await User.findByIdAndUpdate(req.body.id, { [path]: user[path] });
          }
        });
      }
    });
  }
  const consolidatedUser = await User.findById(req.body.id);
  res.send(consolidatedUser);
};

/**
 * TODO
 * @param user
 * @returns
 */
const countProfiles = async (user: UserInterface) => {
  const fields = ["linkedinid", "googleid", "originid"];
  const currentProfile: string = fields.filter((field) => user.get(field) !== undefined)[0];
  const query = { email: user.email, [currentProfile]: { $ne: user[currentProfile] } };
  return User.find(query).then((additionalUsers) => {
    console.log(`[MONGODB] Found extra profiles: ${additionalUsers}`);
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
  } else if ("originid" in req.body) {
    const { user, status } = await loginUser_ORIGIN(req);
    if (status.valid && user !== undefined) {
      console.log(`Logged in user: ${user!.username}`);
      socketManager.getIo().emit("origin", { user: user, consolidate: await countProfiles(user!) });
      res.send({
        valid: status.valid,
        account: status.account,
      });
    } else {
      res.send({ valid: status.valid, message: status.message });
    }
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

const linkedin = async (req: Request, res: Response) => {
  console.log("[LINKEDIN] Initializing OAuth flow");
  // LINKEDIN OAUTH STEP 1: AUTHORIZATION CODE
  const query = url.parse(req.url, true).query;
  const auth_code = query.code;
  console.log(`[LINKEDIN] Authorization code: ${auth_code}`);

  console.log("[LINKEDIN] Requesting access token");
  // LINKEDIN OAUTH STEP 2: TOKEN REQUEST
  let endpoint_url = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${auth_code}&client_id=${LINKEDIN_CLIENT_ID}&client_secret=${LINKEDIN_CLIENT_SECRET}&redirect_uri=${LINKEDIN_REDIRECT_URI}`;
  await helpers
    .callExternalAPI(endpoint_url)
    .then(async (token_response: TokenResponse) => {
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
            const loginUrl = `${DOMAIN}/api/login`;
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
  linkedin,
  consolidateProfiles,
  createUser,
  existingUser,
};
