import React, { useState, useEffect } from "react";
import "./NavBar.css";
import "./LoginPanel.css";
import "../../utilities.css";
import { socket } from "../../client-socket";
import { io } from "socket.io-client";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import { HiHome } from "react-icons/hi";
import { BsSearch, BsPersonFill } from "react-icons/bs";
import { IoIosPeople } from "react-icons/io";
import { GoFilter } from "react-icons/go";

type Props = RouteComponentProps & {};

const NavBar = (props) => {
  const [profile, setProfile] = useState(false);
  const [communities, setCommunities] = useState(false);
  const [housing, setHousing] = useState(false);
  const [querying, setQuerying] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [query, setQuery] = useState("");

  /**
   * TODO
   * @param selectedFunc
   * @param all
   * @param filter
   */
  const toggleTabs = (
    selectedFunc: (val: boolean) => void,
    all: boolean = false,
    filter: boolean = false
  ) => {
    const funcOptions = [setProfile, setCommunities, setHousing, setQuerying, setFiltering];
    for (const toggleFunc of funcOptions) toggleFunc(false);
    if (filter) {
      setQuerying(true);
      setFiltering(!filtering);
    } else if (!all) selectedFunc(true);
  };

  const handleQuery = (event) => {
    setQuery(event.target.value);
    console.log(`Search query: ${query}`);
  };

  const handleSearch = (event) => {
    const body = { query: query };
    setQuery("");
    event.target.value = "";
    post("/api/existingaccount", body).then((res) => {});
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
      <div className={`search-bar-container ${querying ? "search-bar-open" : "search-bar-close"}`}>
        <div className="search-filters-container">
          <GoFilter
            className={`u-pointer ${filtering ? "nav-icon-selected" : "nav-icon"}`}
            onClick={(event) => {
              toggleTabs(setFiltering, false, true);
            }}
          ></GoFilter>
          <div className={`${filtering ? "search-filters-sidebar" : "sidebar-hidden"}`}>
            <div className="search-filter">
              <input type="checkbox"></input>
              <label>All</label>
            </div>
            <div className="search-filter">
              <input type="checkbox"></input>
              <label>Users</label>
            </div>
            <div className="search-filter">
              <input type="checkbox"></input>
              <label>Communities</label>
            </div>
            <div className="search-filter">
              <input type="checkbox"></input>
              <label>Apartments</label>
            </div>
          </div>
        </div>
        <input
          id="navSearch"
          type="search"
          onKeyDown={(event) => {
            if (event.key == "Enter") {
              handleSearch(event);
            }
          }}
          onChange={handleQuery}
        ></input>
      </div>
    </nav>
  );
};

export default NavBar;
