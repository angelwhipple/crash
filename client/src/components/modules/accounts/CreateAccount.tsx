import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./CreateAccount.css";
import "../NavBar.css";
import { TbPlayerTrackNextFilled } from "react-icons/tb";
import { MdInfoOutline } from "react-icons/md";
import helpers from "../../helpers";
import InfoModal from "../InfoModal";
import { USERNAME_INFO, PASSWORD_INFO, Policy, CustomError } from "../../types";

type Props = RouteComponentProps & {
  setCreate: (bool: boolean) => void;
  setLogin: (bool: boolean) => void;
  setUserId: (newUserId: string) => void;
  error: CustomError;
  setError: (err: CustomError) => void;
};

type Acknowledgements = {
  privacy: boolean;
  terms: boolean;
};

const CreateAccount = (props: Props) => {
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [policy, setPolicy] = useState<Policy>({ show: false });
  const [acknowledgements, setAcknowledgements] = useState<Acknowledgements>({
    privacy: false,
    terms: false,
  });
  const [error, setError] = useState<CustomError>(props.error);

  const handleDob = (event, dobInput) => {
    event.preventDefault();
    // console.log(`Date of birth: ${dobInput.value}`);
    if (!dobInput.value) {
      setError({ valid: true, message: "Please enter a valid date of birth" });
    } else if (helpers.validateAge(dobInput.value)) {
      setDob(dobInput.value);
      setError({ valid: false });
    } else {
      setError({ valid: true, message: "Must be atleast 16 years of age" });
    }
    dobInput.value = "";
  };

  const handleEmail = (event, emailInput) => {
    event.preventDefault();
    // console.log(`Email: ${emailInput.value}`);
    if (helpers.validateEmail(emailInput.value)) {
      get("/api/user/exists", { email: emailInput.value }).then((res) => {
        if (res.exists) {
          // props.setError({
          //   valid: true,
          //   message: "An existing account was found with that email address. Please login",
          // });
          props.setLogin(true);
          props.setCreate(false);
        } else setEmail(emailInput.value);
      });
    } else {
      emailInput.value = "";
      setError({ valid: true, message: "Invalid email address" });
    }
  };

  const handleUserPass = async (event) => {
    event.preventDefault();
    const usernameInput = document.getElementById("username")! as HTMLInputElement;
    const passwordInput = document.getElementById("password")! as HTMLInputElement;
    const confirmInput = document.getElementById("confirm")! as HTMLInputElement;
    // console.log(`Username: ${usernameInput.value}`);
    if (passwordInput.value !== confirmInput.value) {
      passwordInput.value = "";
      confirmInput.value = "";
      setError({ valid: true, message: "Passwords must match" });
    } else {
      // console.log(`Password: ${passwordInput.value}`);
      const usernameError = await helpers.validateUsername(usernameInput.value);
      const passwordError = helpers.validatePassword(passwordInput.value);
      const acknowledged = acknowledgements.privacy && acknowledgements.terms;
      if (!usernameError.valid && !passwordError.valid && acknowledged) {
        setUsername(usernameInput.value);
        setPassword(passwordInput.value);
        props.setError({ valid: false });
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
          helpers.route("/profile");
        });
      } else if (usernameError.valid) {
        setError(usernameError);
        usernameInput.value = "";
        passwordInput.value = "";
        confirmInput.value = "";
      } else if (passwordError.valid) {
        setError(passwordError);
        passwordInput.value = "";
        confirmInput.value = "";
      } else if (!acknowledged) {
        setError({
          valid: true,
          message: "Please read and accept our Privacy Policy and Terms of Service",
        });
      }
    }
  };

  useEffect(() => {
    setError({ valid: false }); // clear error
  }, [email, dob, username, password]);

  useEffect(() => {
    setError(props.error);
  }, []);

  socket.on("privacy policy", () =>
    setAcknowledgements({ privacy: true, terms: acknowledgements.terms })
  );
  socket.on("terms of service", () =>
    setAcknowledgements({ privacy: acknowledgements.privacy, terms: true })
  );

  return (
    <>
      {policy.show ? (
        <InfoModal header={policy.header!} info={policy.text} setDisplay={setPolicy}></InfoModal>
      ) : (
        <></>
      )}

      <div className="centered default-container create-container">
        <h3>Create an account</h3>
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
              <TbPlayerTrackNextFilled
                className="nav-icon u-pointer"
                onClick={(event) => {
                  const emailInput = document.getElementById("email")! as HTMLInputElement;
                  handleEmail(event, emailInput);
                }}
              ></TbPlayerTrackNextFilled>
            </label>

            <button
              className="default-button u-pointer"
              onClick={(event) => props.setCreate(false)}
            >
              Go back
            </button>
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
              <TbPlayerTrackNextFilled
                className="nav-icon u-pointer"
                onClick={(event) => {
                  const dobInput = document.getElementById("dob")! as HTMLInputElement;
                  handleDob(event, dobInput);
                }}
              ></TbPlayerTrackNextFilled>
            </label>
          </>
        ) : username === "" || password === "" ? (
          <>
            <label className="create-label" title="username">
              <MdInfoOutline
                className="info-icon-create u-pointer"
                onClick={(event) => {
                  setPolicy({
                    show: true,
                    header: "Username requirements",
                    text: USERNAME_INFO,
                  });
                }}
              ></MdInfoOutline>
              Select a username <input id="username" className="create-input" type="text"></input>
            </label>
            <label className="create-label">
              <MdInfoOutline
                className="info-icon-create u-pointer"
                onClick={(event) => {
                  setPolicy({
                    show: true,
                    header: "Password requirements",
                    text: PASSWORD_INFO,
                  });
                }}
              ></MdInfoOutline>
              Enter a password
              <input
                id="password"
                className="create-input"
                onKeyDown={async (event) => {
                  if (event.key === "Enter") {
                    await handleUserPass(event);
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
                onKeyDown={async (event) => {
                  if (event.key === "Enter") {
                    await handleUserPass(event);
                  }
                }}
                type="password"
              ></input>
            </label>
            <label className="create-label">
              I have read and accept the{" "}
              <a
                className="u-pointer default-button"
                onClick={async () => {
                  await get("/api/privacy").then((res) => {
                    setPolicy({ show: true, header: "Crash Privacy Policy", text: res.text });
                  });
                }}
              >
                Privacy Policy{" "}
              </a>
              and{" "}
              <a
                className="u-pointer default-button"
                onClick={async () => {
                  await get("/api/terms").then((res) => {
                    setPolicy({ show: true, header: "Crash Terms of Service", text: res.text });
                  });
                }}
              >
                Terms of Service
              </a>
            </label>
            <TbPlayerTrackNextFilled
              className="nav-icon u-pointer"
              onClick={async (event) => {
                await handleUserPass(event);
              }}
            ></TbPlayerTrackNextFilled>
          </>
        ) : (
          <></>
        )}
        {error.valid ? (
          <p className="error-text">{error.message}</p>
        ) : (
          <p className="error-text-hidden">Default</p>
        )}
      </div>
    </>
  );
};

export default CreateAccount;
