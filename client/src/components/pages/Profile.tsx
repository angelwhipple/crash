import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { io } from "socket.io-client";
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

  //   useEffect(() => {
  //     const socket = io("http://localhost:3000");

  //     // disconnect socket on dismount
  //     return () => {
  //       socket.disconnect();
  //     };
  //   }, []);

  return (
    <div className="centered default-container">
      <p>No profile information to display</p>
      <button
        className="login-button u-pointer"
        onClick={(event) => {
          route("/");
          socket.emit("toggleAll", {});
        }}
      >
        Take me back
      </button>
    </div>
  );
};

export default Profile;
