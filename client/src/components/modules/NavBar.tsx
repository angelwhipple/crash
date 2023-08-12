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

type Props = RouteComponentProps & {};

const NavBar = (props) => {
  const [profile, setProfile] = useState(false);
  const [communities, setCommunities] = useState(false);
  const [housing, setHousing] = useState(false);
  const [querying, setQuerying] = useState(false);
  const [query, setQuery] = useState("");

  const toggleTabs = (selectedFunc: (val: boolean) => void, all: boolean = false) => {
    const funcOptions = [setProfile, setCommunities, setHousing, setQuerying];
    for (const toggleFunc of funcOptions) toggleFunc(false);
    if (!all) selectedFunc(true);
  };

  const handleQuery = (event) => {
    setQuery(event.target.value);
    console.log(`Search query: ${query}`);
  };

  const handleSearch = (event) => {
    const body = { query: query };
    setQuery("");
    event.target.value = "";
    post("/api/searchprofiles", body).then((res) => {});
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
        className={`u-pointer ${querying ? "nav-icon-selected" : "nav-icon"}`}
        onClick={(event) => {
          if (querying) {
            if (!query) toggleTabs(setQuerying, true); // no search query, close & de-highlight all navbar tabs
            // else handleSearch()
          } else {
            toggleTabs(setQuerying);
          }
        }}
      ></BsSearch>
      <input
        id="navSearch"
        type="search"
        className={`${querying ? "search-bar-open" : "search-bar-close"}`}
        onKeyDown={(event) => {
          if (event.key == "Enter") {
            handleSearch(event);
          }
        }}
        onChange={handleQuery}
      ></input>
      <></>
    </nav>
  );
};

export default NavBar;
