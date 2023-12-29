import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { io } from "socket.io-client";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./Housing.css";

type Props = RouteComponentProps & {};

const Housing = (props) => {
  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };

  return (
    <div className="centered default-container">
      <p>Coming soon...</p>
      <button
        className="default-button u-pointer"
        onClick={(event) => {
          socket.emit("nav toggle all", {});
          route("/");
        }}
      >
        Take me back
      </button>
    </div>
  );
};

export default Housing;
