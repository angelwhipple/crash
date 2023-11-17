import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";

type Props = RouteComponentProps & {};

const Joined = (props) => {
  return (
    <div className="centered default-container">
      <p>
        You've successfully joined the community {props.community.name}! Feel free to close this
        window.
      </p>
    </div>
  );
};

export default Joined;
