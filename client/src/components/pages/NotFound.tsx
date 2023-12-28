import React from "react";
import "../modules/LoginPanel.css";

import { RouteComponentProps, useNavigate } from "@reach/router";

type NotFoundProps = RouteComponentProps;

const NotFound = (props: NotFoundProps) => {
  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };
  return (
    <div className="centered default-container">
      <h1>Sorry, you've reached a dead end.</h1>
      <button className="default-button u-pointer" onClick={() => route("/")}>
        Take me back
      </button>
    </div>
  );
};

export default NotFound;
