import React, { useState, useEffect } from "react";
import "./NavBar.css";
import "./LoginPanel.css";
import "../../utilities.css";
import { onSocketConnect, socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import { HiHome } from "react-icons/hi";
import { BsSearch, BsPersonFill } from "react-icons/bs";
import { IoIosPeople } from "react-icons/io";
import { GoFilter } from "react-icons/go";
import { ImExit } from "react-icons/im";
import Filters from "./FiltersModal";
import { SearchFilters, FILTERS_TO_IDS } from "../types";
import Logout from "./LogoutModal";
import helpers from "../helpers";

type Props = RouteComponentProps & {
  userId: string;
  setUserId: any;
};

const NavBar = (props: Props) => {
  const [profile, setProfile] = useState(false);
  const [communities, setCommunities] = useState(false);
  const [housing, setHousing] = useState(false);
  const [querying, setQuerying] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [logout, setLogout] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(SearchFilters.ALL);
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };

  /**
   * TODO
   * @param selectedFunc
   * @param all
   * @param filter
   */
  const toggleTabs = (
    all: boolean = false,
    filter: boolean = false,
    selectedFunc?: (val: boolean) => void
  ) => {
    const funcOptions = [setProfile, setCommunities, setHousing, setQuerying, setFiltering];
    for (const toggleFunc of funcOptions) toggleFunc(false);
    if (filter) {
      setQuerying(true);
      setFiltering(!filtering);
    } else if (!all && selectedFunc) selectedFunc(true);
  };

  const handleQuery = (event) => {
    setQuery(event.target.value);
  };

  const handleSearch = (event) => {
    const body = { query: query };
    console.log(`Search query: ${query}`);
    setQuery("");
    event.target.value = "";

    setFiltering(false);
    const route = FILTERS_TO_IDS[filter];
    post(`/api/search/${route}`, body).then((res) => {
      console.log(res);
    });
  };

  useEffect(() => {
    setSocketConnected(socket.connected);
    const handleConnect = () => {
      setSocketConnected(true);
    };
    onSocketConnect(handleConnect);
  }, []);

  useEffect(() => {
    if (socketConnected) {
      console.log(`Socket is connected!`);
      console.log("Socket ID:", socket.id);
    }
  }, [socketConnected]);

  socket.on("nav toggle all", (event) => {
    toggleTabs(true, false);
  });

  return (
    <>
      {filtering ? (
        <Filters
          filter={filter}
          setFilter={setFilter}
          setFiltering={setFiltering}
          setQuerying={setQuerying}
        />
      ) : logout ? (
        <Logout setUserId={props.setUserId} setLogout={setLogout}></Logout>
      ) : (
        <></>
      )}
      <nav className="nav-bar-container">
        {props.userId !== undefined ? (
          <ImExit
            title="Logout"
            className={`u-pointer nav-icon`}
            onClick={() => {
              setLogout(true);
            }}
          ></ImExit>
        ) : (
          <></>
        )}
        <BsPersonFill
          title="Profile"
          className={`u-pointer ${profile ? "nav-icon-selected" : "nav-icon"}`}
          onClick={(event) => {
            route("/profile");
            toggleTabs(false, false, setProfile);
          }}
        ></BsPersonFill>
        <HiHome
          title="Housing"
          className={`u-pointer ${housing ? "nav-icon-selected" : "nav-icon"}`}
          onClick={(event) => {
            route("/housing");
            toggleTabs(false, false, setHousing);
          }}
        ></HiHome>
        <IoIosPeople
          title="Communities"
          className={`u-pointer ${communities ? "nav-icon-selected" : "nav-icon"}`}
          onClick={(event) => {
            route("/communities");
            toggleTabs(false, false, setCommunities);
          }}
        ></IoIosPeople>
        <BsSearch
          className={`u-pointer ${querying ? "nav-icon-selected" : "nav-icon"}`}
          onClick={(event) => {
            if (querying) {
              if (!query) toggleTabs(true, false, setQuerying); // no search query, close & de-highlight all navbar tabs
              // else handleSearch()
            } else {
              toggleTabs(false, false, setQuerying);
            }
          }}
        ></BsSearch>
        <div
          className={`search-bar-container ${querying ? "search-bar-open" : "search-bar-close"}`}
        >
          <GoFilter
            className={`u-pointer ${filtering ? "nav-icon-selected" : "nav-icon"}`}
            onClick={(event) => {
              setFiltering(!filtering);
              setQuerying(true);
            }}
          ></GoFilter>
          <input
            id="navSearch"
            type="search"
            placeholder="search"
            className="search-bar"
            onKeyDown={(event) => {
              if (event.key == "Enter") {
                handleSearch(event);
              }
            }}
            onChange={handleQuery}
          ></input>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
