import React, { useState, useEffect } from "react";
import "./NavBar.css";
import "../../utilities.css";
import { socket } from "../../client-socket";
import { io } from "socket.io-client";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import { set } from "mongoose";

type Props = RouteComponentProps & {};

const NavBar = (props) => {
  const [profile, setProfile] = useState(false);
  const [communities, setCommunities] = useState(false);
  const [housing, setHousing] = useState(false);

  const toggleTabs = (selectedFunc: (val: boolean) => void, all: boolean = false) => {
    const funcOptions = [setProfile, setCommunities, setHousing];
    for (const toggleFunc of funcOptions) toggleFunc(false);
    if (!all) selectedFunc(true);
  };

  //   useEffect(() => {
  //     const socket = io("http://localhost:3000");

  //     socket.on("toggleAll", (event) => {
  //       console.log("Received return to homepage socket event");
  //       toggleTabs(() => {}, true);
  //     });

  //     // disconnect socket on dismount
  //     return () => {
  //       socket.disconnect();
  //     };
  //   }, []);

  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };

  return (
    <nav className="nav-bar-container">
      <button
        className={`u-pointer ${profile ? "nav-button-selected" : "nav-button"}`}
        onClick={(event) => {
          route("/profile");
          toggleTabs(setProfile);
        }}
      >
        profile
      </button>
      <button
        className={`u-pointer ${communities ? "nav-button-selected" : "nav-button"}`}
        onClick={(event) => {
          route("/communities");
          toggleTabs(setCommunities);
        }}
      >
        communities
      </button>
      <button
        className={`u-pointer ${housing ? "nav-button-selected" : "nav-button"}`}
        onClick={(event) => {
          route("/housing");
          toggleTabs(setHousing);
        }}
      >
        housing
      </button>
      <button className="nav-button u-pointer">search</button>
      <></>
    </nav>
  );
};

export default NavBar;
