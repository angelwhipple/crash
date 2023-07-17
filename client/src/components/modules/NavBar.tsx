import React, { useState, useEffect } from "react";
import "./NavBar.css";
import "../../utilities.css";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import { set } from "mongoose";

type Props = RouteComponentProps & {};

const NavBar = (props) => {
  const [profile, setProfile] = useState(false);
  const [communities, setCommunities] = useState(false);
  const [housing, setHousing] = useState(false);

  const toggleTabs = (selectedFunc: (val: boolean) => void) => {
    for (const toggleFunc of [setProfile, setCommunities, setHousing]) toggleFunc(false);
    selectedFunc(true);
  };

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
