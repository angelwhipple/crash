import React from "react";
import "../modules/LoginPanel.css";

import { RouteComponentProps, useNavigate } from "@reach/router";

type NotFoundProps = RouteComponentProps;

const NotFound = (props: NotFoundProps) => {
  const navigate = useNavigate();
  const routeHome = (event) => {
    navigate("/");
  };

  return (
    <div className="centered">
      <h1>Sorry, you've reached a dead end.</h1>
      <button className="login-button u-pointer" onClick={routeHome}>
        Take me back
      </button>
    </div>
  );
};

export default NotFound;
