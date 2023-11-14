import { OAuth2Client, TokenPayload } from "google-auth-library";
import { NextFunction, Request, Response } from "express";
import User from "./models/User";
import UserInterface from "../shared/User";
import socketManager from "./server-socket";

// create a new OAuth client used to verify google sign-in
const GOOGLE_CLIENT_ID = "281523827651-6p2ui3h699r3378i6emjqdm4o68hhnbi.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// holds next new account ID, revise to avoid resetting to 0 on server restart
const ID_MAP = { nextID: 0 };

const verify = (token: string) => {
  return client
    .verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    })
    .then((ticket) => ticket.getPayload());
};

const existingUser = async (req: Request, res: Response) => {
  User.findOne({ email: req.query.email?.toString(), originid: { $exists: true } }).then((user) => {
    if (user !== null) {
      res.send({ exists: true });
    } else {
      res.send({ exists: false });
    }
  });
};

const createUser = async (req: Request, res: Response) => {
  // ENCRYPT

  const newUser = new User({
    email: req.body.email,
    dob: req.body.dob,
    username: req.body.username,
    password: req.body.password,
  });
  const savedUser = await newUser.save();
  // assign the created account an origin ID
  User.findByIdAndUpdate(savedUser._id, { originid: ID_MAP.nextID.toString() }).then((user) => {
    ID_MAP.nextID++; // increment the ID counter
    res.send(user);
  });
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

const loginUser_ORIGIN = async (req: Request) => {
  return await User.findOne({
    email: req.body.email?.toString(),
    originid: { $exists: true },
    password: req.body.password?.toString(),
  }).then(async (user) => {
    // if login credentials match, returns a valid user & status
    if (user !== null) return { user: user, status: { valid: true, account: user, message: "" } };
    else
      return {
        user: undefined,
        status: {
          valid: false,
          account: undefined,
          message: "Incorrect password, please try again",
        },
      };
  });
};

/**
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
 *
 * @param user
 * @returns
 */
const countProfiles = async (user: UserInterface) => {
  const fields = ["linkedinid", "googleid", "originid"];
  const currentProfile: string = fields.filter((field) => user.get(field) !== undefined)[0];
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
  } else if ("originid" in req.body) {
    const { user, status } = await loginUser_ORIGIN(req);
    if (status.valid && user !== undefined) {
      console.log(`Logged in user: ${user.username}`);
      socketManager.getIo().emit("origin", { user: user, consolidate: await countProfiles(user) });
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
  existingUser,
};
