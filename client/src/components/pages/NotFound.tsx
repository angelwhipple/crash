import React from "react";
import "../modules/LoginPanel.css";
import helpers from "../helpers";

import { RouteComponentProps, useNavigate } from "@reach/router";

type NotFoundProps = RouteComponentProps;

const NotFound = (props: NotFoundProps) => {
  return (
    <div className="centered default-container">
      <h1>Sorry, you've reached a dead end.</h1>
      <button className="default-button u-pointer" onClick={() => helpers.route("/")}>
        Take me back
      </button>
    </div>
  );
};

export default NotFound;
