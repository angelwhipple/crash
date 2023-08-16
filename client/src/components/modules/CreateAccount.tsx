import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./CreateAccount.css";
import "./NavBar.css";
import { TbPlayerTrackNextFilled } from "react-icons/tb";

type Props = RouteComponentProps & {
  setCreate: (bool: boolean) => void;
};

const CreateAccount = (props: Props) => {
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  //   const [picture, setPicture] = useState(true);

  // PASSWORD CONSTRAINTS: len <= 8 chars, <= 1 special char, <= 1 letter, <= 1 number
  const validatePassword = (password: string) => {
    if (password.length < 8) return false; // atleast 8 characters
    if (password.search(/[a-zA-Z]/g) === -1) {
      console.log(`Password missing letters`);
      return false;
    }
    if (password.search(/[0-9]/g) === -1) {
      console.log(`Password missing numbers`);
      return false;
    }
    if (password.search(/[^a-zA-Z0-9]/g) === -1) {
      console.log(`Password missing special characters`);
      return false;
    }
    return true;
  };
  // AGE CONSTRAINT: age >= 16
  const validateAge = (birthYear: string) => {};
  // USERNAME CONSTRAINTS: len >= 3, 0 special characters
  const validateUsername = (user: string) => {};
  // EMAIL CONSTRAINTS:
  const validateEmail = (emailAddress: string) => {};

  return (
    <div className="centered default-container create-container">
      <h3>Create an account</h3>
      {email === "" ? (
        <>
          <label className="create-label">
            Enter your email address:
            <input id="email" className="create-input" type="email"></input>
          </label>
          <TbPlayerTrackNextFilled
            className="nav-icon u-pointer"
            onClick={(event) => {
              const emailInput = document.getElementById("email")! as HTMLInputElement;
              console.log(`Email: ${emailInput.value}`);
              setEmail(emailInput.value);
            }}
          ></TbPlayerTrackNextFilled>
        </>
      ) : dob === "" ? (
        <>
          <label className="create-label">
            What is your date of birth?
            <input id="dob" className="create-input" type="date"></input>
          </label>
          <TbPlayerTrackNextFilled
            className="nav-icon u-pointer"
            onClick={(event) => {
              const dobInput = document.getElementById("dob")! as HTMLInputElement;
              console.log(`Date of birth: ${dobInput.value}`);
              if (!dobInput.value) {
                dobInput.value = "";
              } else {
                setDob(dobInput.value);
              }
            }}
          ></TbPlayerTrackNextFilled>
        </>
      ) : username === "" || password === "" ? (
        <>
          <label className="create-label" title="username">
            Select a username <input id="username" className="create-input" type="text"></input>
          </label>
          <label className="create-label">
            Enter a password <input id="password" className="create-input" type="password"></input>
          </label>
          <label className="create-label">
            Re-enter your password:{" "}
            <input id="confirm" className="create-input" type="password"></input>
          </label>
          <TbPlayerTrackNextFilled
            className="nav-icon u-pointer"
            onClick={(event) => {
              const usernameInput = document.getElementById("username")! as HTMLInputElement;
              const passwordInput = document.getElementById("password")! as HTMLInputElement;
              const confirmInput = document.getElementById("confirm")! as HTMLInputElement;
              console.log(`Username: ${usernameInput.value}`);
              if (passwordInput.value !== confirmInput.value) {
                passwordInput.value = "";
                confirmInput.value = "";
              } else {
                console.log(`Password: ${passwordInput.value}`);
                setUsername(usernameInput.value);
                if (validatePassword(passwordInput.value)) {
                  setPassword(passwordInput.value);
                  props.setCreate(false);
                  // TODO: create profile, post API call
                } else {
                  passwordInput.value = "";
                  confirmInput.value = "";
                }
              }
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
    </div>
  );
};

export default CreateAccount;
