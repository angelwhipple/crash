import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./Profile.css";
import "../modules/LoginPanel.css";

type Props = RouteComponentProps & {};

const Profile = (props) => {
  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };

  return (
    <div className="centered">
      <p>No profile information to display</p>
      <button
        className="login-button u-pointer"
        onClick={(event) => {
          route("/");
        }}
      >
        Take me back
      </button>
    </div>
  );
};

export default Profile;
