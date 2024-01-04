import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./Modal.css";

type Props = RouteComponentProps & {};

const Report = (props) => {
  return <div className="centered">Coming soon...</div>;
};

export default Report;
