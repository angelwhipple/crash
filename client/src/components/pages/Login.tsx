import React, { useState, useEffect } from "react";
import { RouteComponentProps, useNavigate } from "@reach/router";
import gapi from "@react-oauth/google";
import { get, post } from "../../utilities";
import { set } from "mongoose";
import { socket } from "../../client-socket";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
  CredentialResponse,
} from "@react-oauth/google";
import "../modules/modals/Modal.css";
import "./Login.css";
import "../modules/accounts/CreateAccount.css";
import { DOMAIN } from "../../../../server/types";
import { CustomError } from "../types";
import { TbPlayerTrackNextFilled } from "react-icons/tb";
import { TbPlayerTrackPrevFilled } from "react-icons/tb";
import helpers from "../helpers";

type Props = RouteComponentProps & {
  handleLogin: any;
  setLogin: any;
  setCreate: any;
  setUserId: (newUserId: string) => void;
  userId: string;
  error: CustomError;
  setError: (err: CustomError) => void;
};

const PLATFORMS = {
  linkedin: "linkedinid",
  google: "googleid",
  fb: "facebookid",
  origin: "originid",
};
const GOOGLE_CLIENT_ID = "281523827651-6p2ui3h699r3378i6emjqdm4o68hhnbi.apps.googleusercontent.com";
const LINKEDIN_CLIENT_ID = "78kxc3fzhb4yju";
const LINKEDIN_REDIRECT_URI = `${DOMAIN}/api/user/linkedin`;
const LINKEDIN_AUTH_URL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${LINKEDIN_REDIRECT_URI}&scope=r_liteprofile,r_emailaddress`;

const LoginPage = (props: Props) => {
  const [localAccount, setLocalAccount] = useState(false);
  const [error, setError] = useState<CustomError>(props.error);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };
  const launch_linkedin = (event) => {
    window.open(LINKEDIN_AUTH_URL, "_self");
  };

  const handleLogin = async (emailInput: HTMLInputElement, passwordInput: HTMLInputElement) => {
    console.log(`Email: ${emailInput.value}, Password: ${passwordInput.value}`);
    if (helpers.validateEmail(emailInput.value)) {
      await get("/api/user/exists", { email: emailInput.value }).then((res) => {
        if (!res.exists) {
          // props.setError({
          //   valid: true,
          //   message: "No account was found with that email address. Please create an account",
          // });
          props.setCreate(true);
          props.setLogin(false);
          return;
        } else setEmail(emailInput.value);
      });
    } else {
      emailInput.value = "";
      setError({ valid: true, message: "Invalid email address" });
      return;
    }
    if (passwordInput.value !== "") {
      await post("/api/login", {
        originid: "originid",
        email: emailInput.value,
        password: passwordInput.value,
      }).then((res) => {
        if (res.valid) {
          props.setError({ valid: false });
          setLocalAccount(false);
          props.setLogin(false);
        } else {
          passwordInput.value = "";
          setError({ valid: true, message: res.message });
        }
      });
    } else {
      setError({ valid: true, message: "Please enter your password" });
    }
  };

  // useEffect order matters!
  // useEffect(() => {
  //   setError({ valid: false });
  // }, [email, props.userId]);

  // useEffect(() => {
  //   setError(props.error);
  //   if (props.error.valid) setLocalAccount(true);
  // }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="login-page">
        <div className="login-panel">
          <p>Sign in</p>
          {localAccount ? (
            <>
              <label className="create-label">
                Enter your email address
                <input id="email" className="create-input" type="email"></input>
              </label>
              <label className="create-label">
                Enter your password{" "}
                <input
                  id="password"
                  className="create-input"
                  type="password"
                  onKeyDown={(event) => {
                    const emailInput = document.getElementById("email")! as HTMLInputElement;
                    const passwordInput = document.getElementById("password")! as HTMLInputElement;
                    if (event.key === "Enter") handleLogin(emailInput, passwordInput);
                  }}
                ></input>
              </label>
              <div className="action-container">
                <TbPlayerTrackPrevFilled
                  className="login-icon u-pointer"
                  onClick={(event) => {
                    setError({ valid: false });
                    setLocalAccount(false);
                  }}
                ></TbPlayerTrackPrevFilled>
                <TbPlayerTrackNextFilled
                  className="login-icon u-pointer"
                  onClick={(event) => {
                    const emailInput = document.getElementById("email")! as HTMLInputElement;
                    const passwordInput = document.getElementById("password")! as HTMLInputElement;
                    handleLogin(emailInput, passwordInput);
                  }}
                ></TbPlayerTrackNextFilled>
              </div>

              {error.valid ? (
                <p className="error-text">{error.message}</p>
              ) : (
                <p className="error-text-hidden">Default</p>
              )}
            </>
          ) : (
            <>
              <button className="default-button u-pointer" onClick={() => setLocalAccount(true)}>
                I have a Crash account
              </button>
              <hr style={{ width: "100%" }}></hr>
              <GoogleLogin
                onSuccess={(credentialResponse: CredentialResponse) => {
                  props.handleLogin(credentialResponse);
                }}
                onError={() => {
                  console.log("Error logging in");
                }}
                type="standard"
                shape="pill"
                size="medium"
                text="signin_with"
                logo_alignment="left"
                click_listener={() => {}}
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
              <button className="login-button u-pointer" onClick={(event) => props.setLogin(false)}>
                Go back
              </button>
            </>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
