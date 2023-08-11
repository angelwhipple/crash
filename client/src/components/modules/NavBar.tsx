import React, { useState, useEffect } from "react";
import "./NavBar.css";
import "../../utilities.css";
import { socket } from "../../client-socket";
import { io } from "socket.io-client";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import { HiHome } from "react-icons/hi";
import { BsSearch, BsPersonFill } from "react-icons/bs";
import { IoIosPeople } from "react-icons/io";
import { query } from "express";

type Props = RouteComponentProps & {};

const NavBar = (props) => {
  const [profile, setProfile] = useState(false);
  const [communities, setCommunities] = useState(false);
  const [housing, setHousing] = useState(false);
  const [querying, setQuerying] = useState(false);

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
      <BsPersonFill
        className={`u-pointer ${profile ? "nav-icon-selected" : "nav-icon"}`}
        onClick={(event) => {
          route("/profile");
          toggleTabs(setProfile);
        }}
      ></BsPersonFill>
      <HiHome
        className={`u-pointer ${housing ? "nav-icon-selected" : "nav-icon"}`}
        onClick={(event) => {
          route("/housing");
          toggleTabs(setHousing);
        }}
      ></HiHome>
      <IoIosPeople
        className={`u-pointer ${communities ? "nav-icon-selected" : "nav-icon"}`}
        onClick={(event) => {
          route("/communities");
          toggleTabs(setCommunities);
        }}
      ></IoIosPeople>
      <BsSearch
        className="nav-icon u-pointer"
        onClick={(event) => {
          setQuerying(!querying);
        }}
      ></BsSearch>
      <input
        type="search"
        className={`${querying ? "search-bar-open" : "search-bar-close"}`}
      ></input>
      <></>
    </nav>
  );
};

export default NavBar;
