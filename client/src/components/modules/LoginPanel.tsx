import React, { useState, useEffect } from "react";
import { RouteComponentProps, useNavigate } from "@reach/router";
import { get, post } from "../../utilities";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
  CredentialResponse,
} from "@react-oauth/google";
import { socket } from "../../client-socket";
import "./Modal.css";
import "./LoginPanel.css";
import { set } from "mongoose";

const GOOGLE_CLIENT_ID = "281523827651-6p2ui3h699r3378i6emjqdm4o68hhnbi.apps.googleusercontent.com";

const LoginPanel = (props) => {
  const [visibility, setVisibility] = useState(true);

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
              onClick={() => {
                props.googleLogout();
                props.handleLogout();
              }}
            >
              Logout
            </button>
          ) : (
            <GoogleLogin
              onSuccess={(credentialResponse: CredentialResponse) => {
                props.handleLogin(credentialResponse);
                setVisibility(false);
              }}
              onError={() => {
                console.log("Error logging in");
              }}
            ></GoogleLogin>
          )}
          <h1>this is a test</h1>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPanel;
