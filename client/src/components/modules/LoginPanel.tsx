import React, { useState, useEffect } from "react";
import { RouteComponentProps, useNavigate } from "@reach/router";
import { get, post } from "../../utilities";
import { set } from "mongoose";
import { socket } from "../../client-socket";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
  CredentialResponse,
} from "@react-oauth/google";
import "./Modal.css";
import "./LoginPanel.css";

type Props = RouteComponentProps & {}; // TODO: define specific prop types

const GOOGLE_CLIENT_ID = "281523827651-6p2ui3h699r3378i6emjqdm4o68hhnbi.apps.googleusercontent.com";
const LINKEDIN_CLIENT_ID = "78kxc3fzhb4yju";
const LINKEDIN_REDIRECT_URI = "http://localhost:5050/api/linkedin";
const LINKEDIN_AUTH_URL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${LINKEDIN_REDIRECT_URI}&scope=r_liteprofile%20r_emailaddress`;

const LoginPanel = (props) => {
  const [visibility, setVisibility] = useState(true);

  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };
  const launch_linkedin = (event) => {
    window.open(LINKEDIN_AUTH_URL, "_self");
  };

  useEffect(() => {
    if (props.userId) {
      setVisibility(false);
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="modal-Container">
        <div className="modal-Content">
          {props.userId ? ( // revise
            <button
              className="login-button u-pointer"
              onClick={() => {
                props.googleLogout();
                props.handleLogout();
              }}
            >
              Logout
            </button>
          ) : (
            <div className="login-container">
              <GoogleLogin
                onSuccess={(credentialResponse: CredentialResponse) => {
                  props.handleLogin(credentialResponse);
                  setVisibility(false);
                }}
                onError={() => {
                  console.log("Error logging in");
                }}
              ></GoogleLogin>
              <button className="login-button u-pointer" onClick={launch_linkedin}>
                Sign in with Linkedin
              </button>
              <button
                className="login-button u-pointer"
                onClick={(event) => {
                  route("/facebook");
                }}
              >
                Sign in with Facebook
              </button>
              <button
                className="login-button u-pointer"
                onClick={(event) => {
                  route("/airbnb");
                }}
              >
                Sign in with Airbnb
              </button>
              <button
                className="login-button u-pointer"
                onClick={(event) => {
                  route("/join");
                }}
              >
                Create an account
              </button>
            </div>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPanel;
