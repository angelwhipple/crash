import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./Communities.css";
import "../modules/LoginPanel.css";

type Props = RouteComponentProps & {};

const Communities = (props) => {
  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };

  return (
    <div className="centered">
      <p>Coming soon...</p>
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

export default Communities;
