import React, { useState, useEffect } from "react";
import { socket } from "../client-socket";
import { get, post } from "../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";

type Props = RouteComponentProps & {};

const Template = (props) => {
  return <div className="centered">Coming soon...</div>;
};

export default Template;
