import React from "react";
import "./NavBar.css";
import "../../utilities.css";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";

type Props = RouteComponentProps & {};

const NavBar = (props) => {
  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };

  return (
    <nav className="nav-bar-container">
      <button className="nav-button u-pointer" onClick={(event) => route("/profile")}>
        profile
      </button>
      <button className="nav-button u-pointer" onClick={(event) => route("/communities")}>
        communities
      </button>
      <button className="nav-button u-pointer" onClick={(event) => route("/housing")}>
        housing
      </button>
      <button className="nav-button u-pointer">search</button>
      <></>
    </nav>
  );
};

export default NavBar;
