import React, { useState, useEffect } from "react";
import "./NavBar.css";
import "./LoginPanel.css";
import "../../utilities.css";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import { HiHome } from "react-icons/hi";
import { IoIosPeople } from "react-icons/io";
import { GoFilter } from "react-icons/go";
import { FaGear } from "react-icons/fa6";
import Filters from "./FiltersModal";
import { SearchFilters, FILTERS_TO_IDS } from "../types";
import Logout from "./LogoutModal";
import blank from "../../assets/blank.jpg";
import helpers from "../helpers";
import "./Modal.css";

type Props = RouteComponentProps & {
  userId: string;
  setUserId: any;
};

const DROPDOWN_IDS = ["profile-dropdown", "community-dropdown"];

const NavBar = (props: Props) => {
  const [profile, setProfile] = useState(false);
  const [communities, setCommunities] = useState(false);
  const [housing, setHousing] = useState(false);
  const [querying, setQuerying] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [logout, setLogout] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(SearchFilters.ALL);
  const [src, setSrc] = useState("");
  const [communityBtns, setCommunityBtns] = useState<JSX.Element[]>();
  const [name, setName] = useState("Crash User");

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
    DROPDOWN_IDS.map((dropdown) => {
      const elem = document.getElementById(dropdown);
      if (elem) elem.style.display = "none"; // always disable dropdowns
    });

    const funcOptions = [setProfile, setCommunities, setHousing, setQuerying, setFiltering];
    for (const toggleFunc of funcOptions) toggleFunc(false);
    if (filter) setFiltering(!filtering);
    else if (!all && selectedFunc) selectedFunc(true);
  };

  const toggleDropdown = (dropdownId: string) => {
    const dropdown = document.getElementById(dropdownId);
    dropdown!.style.display = dropdown?.style.display === "none" ? "flex" : "none";
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

  const updateIdentity = async () => {
    await get("/api/user/fetch", { id: props.userId }).then((res) => {
      setName(res.user.name);
    });
    await get("/api/user/loadphoto", { userId: props.userId }).then((res) => {
      if (res.valid) {
        const buffer = res.buffer.Body.data;
        setSrc(helpers.URLFromBuffer(buffer));
      }
    });
  };

  const refreshCommunities = () => {
    const btns: JSX.Element[] = [];
    get("/api/user/communities", { id: props.userId }).then((res) => {
      console.log(res);
      for (const community of res.communities) {
        btns.push(
          <button
            key={community._id}
            className="default-button u-pointer"
            onClick={() => {
              socket.emit("switched communities", { community: community });
              toggleDropdown("community-dropdown");
            }}
            // onMouseOver={() => {
            //   toggleDropdown("community-dropdown");
            // }}
          >
            {community.name}
          </button>
        );
      }
      setCommunityBtns(btns);
    });
  };

  useEffect(() => {
    if (props.userId) {
      updateIdentity();
      refreshCommunities();
    } else setSrc(blank);
  }, []);

  useEffect(() => {
    if (props.userId) {
      updateIdentity();
      refreshCommunities();
    }
  }, [props.userId]);

  socket.on("nav toggle all", (event) => {
    toggleTabs(true, false);
  });

  socket.on("updated user", () => {
    if (props.userId) updateIdentity();
  });

  socket.on("new community", (event) => {
    if (event.owner === props.userId) refreshCommunities();
  });

  return (
    <>
      <script></script>
      {filtering ? (
        <Filters filter={filter} setFilter={setFilter} setFiltering={setFiltering} />
      ) : logout ? (
        <Logout setUserId={props.setUserId} setLogout={setLogout}></Logout>
      ) : (
        <></>
      )}
      <nav className="nav-bar-container">
        {props.userId !== undefined ? (
          <>
            <div className="nav-dropdown-container">
              <div
                className="u-flex u-alignCenter"
                onClick={() => {
                  toggleDropdown("profile-dropdown");
                }}
              >
                <img
                  className={`u-pointer ${profile ? "nav-img-selected" : "nav-img"}`}
                  src={src}
                ></img>
                <p className="u-pointer font-small pad-light">{name}</p>
              </div>

              <div
                id="profile-dropdown"
                className="nav-dropdown-content"
                // onMouseOut={() => {
                //   toggleDropdown("profile-dropdown");
                // }}
              >
                <button
                  className="default-button font-medium u-pointer"
                  onClick={(event) => {
                    route("/profile");
                    toggleDropdown("profile-dropdown");
                    toggleTabs(false, false, setProfile);
                  }}
                  // onMouseOver={() => {
                  //   toggleDropdown("profile-dropdown");
                  // }}
                >
                  Profile
                </button>
                <button
                  className="default-button font-medium u-pointer"
                  onClick={() => {
                    setLogout(true);
                    toggleDropdown("profile-dropdown");
                  }}
                  // onMouseOver={() => {
                  //   toggleDropdown("profile-dropdown");
                  // }}
                >
                  Logout
                </button>
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
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
        <div className="alt-container">
          {" "}
          {communities && props.userId ? (
            <>
              <div className="nav-dropdown-container community-dropdown">
                <FaGear
                  id="gear"
                  className="nav-icon u-pointer"
                  onClick={() => {
                    toggleDropdown("community-dropdown");
                  }}
                ></FaGear>
                <div
                  id="community-dropdown"
                  className="nav-dropdown-content"
                  // onMouseOut={() => {
                  //   toggleDropdown("community-dropdown");
                  // }}
                >
                  {communityBtns}
                  <button
                    className="default-button u-pointer"
                    onClick={() => {
                      socket.emit("create new community");
                      toggleDropdown("community-dropdown");
                    }}
                    // onMouseOver={() => {
                    //   toggleDropdown("community-dropdown");
                    // }}
                  >
                    Create new
                  </button>
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
          <div className="search-bar-container">
            <GoFilter
              className={`u-pointer ${filtering ? "nav-icon-selected" : "nav-icon"}`}
              onClick={(event) => {
                setFiltering(!filtering);
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
        </div>
      </nav>
    </>
  );
};

export default NavBar;
