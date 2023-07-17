import express from "express";
import auth from "./auth";
import socketManager from "./server-socket";
import url from "url";
import request from "request";
const router = express.Router();

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

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

const LINKEDIN_CLIENT_ID = "78kxc3fzhb4yju";
const LINKEDIN_CLIENT_SECRET = "g23XbgeEPXedo7Ag";
const LINKEDIN_REDIRECT_URI = "http://localhost:5050/api/linkedin";

/**
 * Async helper for making requests to external APIs
 * @param url URL of the desired API endpoint
 * @returns a Promise that resolves when the API call resolves,
 * otherwise the Promise rejects if the call returns an error
 */
const callExternalAPI = (url: string) => {
  return new Promise((resolve, reject) => {
    request(url, { json: true }, (err, res, body) => {
      if (err) reject(err);
      resolve(body);
    });
  });
};

// Linkedin redirect URI: http://localhost:5050/api/linkedin?
router.get("/linkedin", (req, res) => {
  console.log("Linkedin API route reached successfully");
  // LINKEDIN OAUTH STEP 1: AUTHORIZATION CODE
  const query = url.parse(req.url, true).query;
  const auth_code = query.code;
  console.log(`Authorization code: ${auth_code}`);

  // LINKEDIN OAUTH STEP 2: TOKEN REQUEST
  const endpoint_url = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${auth_code}&client_id=${LINKEDIN_CLIENT_ID}&client_secret=${LINKEDIN_CLIENT_SECRET}&redirect_uri=${LINKEDIN_REDIRECT_URI}`;
  callExternalAPI(endpoint_url)
    .then((token_response) => {
      console.log(`Access token response: ${token_response}`);
    })
    .catch((error) => {
      console.log(error);
      res.send(error);
    });
  res.redirect("/"); // redirects back to homepage
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  const msg = `Api route not found: ${req.method} ${req.url}`;
  res.status(404).send({ msg });
});

export default router;
