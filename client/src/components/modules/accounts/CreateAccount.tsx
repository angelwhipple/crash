import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./CreateAccount.css";
import "../NavBar.css";
import { TbPlayerTrackNextFilled } from "react-icons/tb";
import { MdInfoOutline } from "react-icons/md";
import helpers from "../helpers";
import InfoModal from "../InfoModal";

type Props = RouteComponentProps & {
  setCreate: (bool: boolean) => void;
  setUserId: (newUserId: string) => void;
};

type Invalid = {
  ind: boolean;
  message: string;
};

const CreateAccount = (props: Props) => {
  const [exists, setExists] = useState(false);
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [invalid, setInvalid] = useState({ ind: false, message: "" });
  const [showReq, setShowReq] = useState(false);

  const passwordInfo = (
    <div>
      <p>1. Your password must be atleast 8 characters long.</p>
      <p>2. Must include a mix of letters, numbers, and special characters.</p>
      <p>3. Avoid common passwords and consider using passphrases for added security.</p>
    </div>
  );

  const handleDob = (event, dobInput) => {
    event.preventDefault();
    console.log(`Date of birth: ${dobInput.value}`);
    if (!dobInput.value) {
      setInvalid({ ind: true, message: "Please enter a valid date of birth" });
    } else if (helpers.validateAge(dobInput.value)) {
      setDob(dobInput.value);
      setInvalid({ ind: false, message: "" });
    } else {
      setInvalid({ ind: true, message: "Must be atleast 16 years of age" });
    }
    dobInput.value = "";
  };

  const handleEmail = (event, emailInput) => {
    event.preventDefault();
    console.log(`Email: ${emailInput.value}`);
    if (helpers.validateEmail(emailInput.value)) {
      get("/api/user/exists", { email: emailInput.value }).then((res) => {
        // if existing account is returned, skip to password step for login
        if (res.exists) {
          setExists(true);
          setInvalid({
            ind: true,
            message: "An existing account was found with that email address. Please login",
          });
          setInvalid({ ind: false, message: "" });
        }
      });
      setEmail(emailInput.value);
    } else {
      emailInput.value = "";
      setInvalid({ ind: true, message: "Invalid email address" });
    }
  };

  const handleLogin = (event, emailInput, passwordInput) => {
    event.preventDefault();
    post("/api/login", {
      originid: "originid",
      email: emailInput.value,
      password: passwordInput.value,
    }).then((res) => {
      if (res.valid) {
        setInvalid({ ind: false, message: "" });
        props.setCreate(false);
      } else {
        passwordInput.value = "";
        setInvalid({ ind: true, message: res.message });
      }
    });
  };

  const handleUserPass = (event) => {
    event.preventDefault();
    const usernameInput = document.getElementById("username")! as HTMLInputElement;
    const passwordInput = document.getElementById("password")! as HTMLInputElement;
    const confirmInput = document.getElementById("confirm")! as HTMLInputElement;
    console.log(`Username: ${usernameInput.value}`);
    if (passwordInput.value !== confirmInput.value) {
      passwordInput.value = "";
      confirmInput.value = "";
      setInvalid({ ind: true, message: "Passwords must match" });
    } else {
      console.log(`Password: ${passwordInput.value}`);
      const validUsername = helpers.validateUsername(usernameInput.value);
      const invalidPassword = helpers.validatePassword(passwordInput.value);
      if (!invalidPassword.ind && validUsername) {
        setUsername(usernameInput.value);
        setPassword(passwordInput.value);
        setInvalid({ ind: false, message: "" });
        const body = {
          username: usernameInput.value,
          password: passwordInput.value,
          email: email,
          dob: dob,
        };
        post("/api/user/create", body).then((user) => {
          console.log(user);
          props.setUserId(user._id);
          props.setCreate(false);
          // switch to profile page for setup here
        });
      } else if (!validUsername) {
        setInvalid({ ind: true, message: "Invalid username" });
        usernameInput.value = "";
        passwordInput.value = "";
        confirmInput.value = "";
      } else if (invalidPassword.ind) {
        setInvalid({ ind: true, message: invalidPassword.message });
        passwordInput.value = "";
        confirmInput.value = "";
      }
    }
  };

  useEffect(() => {
    return () => {};
  });

  // TODO: login OR create account
  // IF login, POST to "/api/login": include originid, email, & password in request body
  // IF create, use existing logic
  return (
    <>
      {showReq ? (
        <InfoModal
          header="Password requirements"
          info={passwordInfo}
          setRequirements={setShowReq}
        ></InfoModal>
      ) : (
        <></>
      )}
      <div className="centered default-container create-container">
        {exists === true ? <h3>Sign in</h3> : <h3>Create an account</h3>}
        {email === "" ? (
          <>
            <label className="create-label">
              Enter your email address
              <input
                id="email"
                className="create-input"
                onKeyDown={(event) => {
                  const emailInput = document.getElementById("email")! as HTMLInputElement;
                  if (event.key === "Enter") handleEmail(event, emailInput);
                }}
                type="email"
              ></input>
            </label>
            <TbPlayerTrackNextFilled
              className="nav-icon u-pointer"
              onClick={(event) => {
                const emailInput = document.getElementById("email")! as HTMLInputElement;
                handleEmail(event, emailInput);
              }}
            ></TbPlayerTrackNextFilled>
          </>
        ) : exists === true ? (
          <>
            <label className="create-label">
              Enter your email address
              <input
                id="email2"
                className="create-input"
                onKeyDown={(event) => {
                  const emailInput = document.getElementById("email2")! as HTMLInputElement;
                  if (event.key === "Enter") handleEmail(event, emailInput);
                }}
                type="email"
                value={email}
              ></input>
            </label>
            <label className="create-label">
              Enter your password{" "}
              <input
                id="password"
                className="create-input"
                type="password"
                onKeyDown={(event) => {
                  const emailInput = document.getElementById("email2")! as HTMLInputElement;
                  const passwordInput = document.getElementById("password")! as HTMLInputElement;
                  if (event.key === "Enter") handleLogin(event, emailInput, passwordInput);
                }}
              ></input>
            </label>
            <TbPlayerTrackNextFilled
              className="nav-icon u-pointer"
              onClick={(event) => {
                const emailInput = document.getElementById("email")! as HTMLInputElement;
                const passwordInput = document.getElementById("password")! as HTMLInputElement;
                handleLogin(event, emailInput, passwordInput);
              }}
            ></TbPlayerTrackNextFilled>
          </>
        ) : dob === "" ? (
          <>
            <label className="create-label">
              What is your date of birth?
              <input
                id="dob"
                className="create-input"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    const dobInput = document.getElementById("dob")! as HTMLInputElement;
                    handleDob(event, dobInput);
                  }
                }}
                type="date"
              ></input>
            </label>
            <TbPlayerTrackNextFilled
              className="nav-icon u-pointer"
              onClick={(event) => {
                const dobInput = document.getElementById("dob")! as HTMLInputElement;
                handleDob(event, dobInput);
              }}
            ></TbPlayerTrackNextFilled>
          </>
        ) : username === "" || password === "" ? (
          <>
            <label className="create-label" title="username">
              Select a username <input id="username" className="create-input" type="text"></input>
            </label>
            <label className="create-label">
              <MdInfoOutline
                className="info-icon-create u-pointer"
                onClick={(event) => {
                  setShowReq(true);
                }}
              ></MdInfoOutline>
              Enter a password{" "}
              <input
                id="password"
                className="create-input"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleUserPass(event);
                  }
                }}
                type="password"
              ></input>
            </label>
            <label className="create-label">
              Re-enter your password{" "}
              <input
                id="confirm"
                className="create-input"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleUserPass(event);
                  }
                }}
                type="password"
              ></input>
            </label>
            <TbPlayerTrackNextFilled
              className="nav-icon u-pointer"
              onClick={(event) => {
                handleUserPass(event);
              }}
            ></TbPlayerTrackNextFilled>
          </>
        ) : (
          <>
            {/* <label className="create-label">
          Upload a profile picture <input className="create-input" type="file"></input>
        </label> */}
          </>
        )}
        {invalid.ind ? (
          <p className="invalid-msg">{invalid.message}</p>
        ) : (
          <p className="invalid-msg-hidden">Default</p>
        )}
      </div>
    </>
  );
};

export default CreateAccount;
