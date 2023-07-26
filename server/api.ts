import express, { Request, Response } from "express";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import auth from "./auth";
import socketManager from "./server-socket";
import url from "url";
import request from "request";
import assert from "assert";
// import fetch, { Headers, Request } from "node-fetch";
import { UnaryExpression } from "typescript";
import http from "http";
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

router.post("/linkedin", auth.login);
router.post("/consolidate", auth.consolidateProfiles);

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

// Linkedin redirect URI: http://localhost:5050/api/linkedin?
router.get("/linkedin", async (req, res) => {
  console.log("Linkedin API route reached successfully");
  // LINKEDIN OAUTH STEP 1: AUTHORIZATION CODE
  const query = url.parse(req.url, true).query;
  const auth_code = query.code;
  console.log(`Authorization code: ${auth_code}`);

  console.log("Requesting Linkedin access token");
  // LINKEDIN OAUTH STEP 2: TOKEN REQUEST
  let endpoint_url = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${auth_code}&client_id=${LINKEDIN_CLIENT_ID}&client_secret=${LINKEDIN_CLIENT_SECRET}&redirect_uri=${LINKEDIN_REDIRECT_URI}`;
  await callExternalAPI(endpoint_url)
    .then(async (token_response: tokenResponse) => {
      const access_token = token_response.access_token; // default: 60 day lifespan
      console.log(`Access token: ${access_token}`);

      // LINKEDIN OAUTH STEP 3: AUTHENTICATED REQUESTS FOR USER INFORMATION
      console.log(`Attempting user info requests with token ${access_token}`);
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
        console.log(`Name: ${firstName} ${lastName}, Linkedin ID: ${linkedinId}`);
        endpoint_url = `https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))`;
        axios.get(endpoint_url, axiosConfig).then((response) => {
          // const email = JSON.stringify(response.data); // convert Response Object back into readable JSON
          const emailAddress = response.data.elements[0]["handle~"]["emailAddress"];
          console.log(`Email address: ${emailAddress}`);
          endpoint_url = `https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))`;
          axios.get(endpoint_url, axiosConfig).then((response) => {
            const profilePictureUrl =
              response.data.profilePicture["displayImage~"]["elements"][0]["identifiers"][0][
                "identifier"
              ];
            console.log(`Profile picture url: ${profilePictureUrl}`);
            const consolidateUrl = `http://localhost:5050/api/login`;
            const consolidateBody = {
              name: `${firstName} ${lastName}`,
              linkedinid: linkedinId,
              email: emailAddress,
              pfp: profilePictureUrl,
            };

            axios.post(consolidateUrl, consolidateBody).then((response) => {
              // const readable = JSON.stringify(response.data);
              socketManager.getIo().emit("linkedin", response.data);
            });
          });
        });
      });
    })
    .catch((token_error) => {
      console.log(`Token response error: ${token_error}`);
      res.send(token_error);
    });
  res.redirect("/"); // redirects back to homepage
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  const msg = `Api route not found: ${req.method} ${req.url}`;
  res.status(404).send({ msg });
});

export default router;
