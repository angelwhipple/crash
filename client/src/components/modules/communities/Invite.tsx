import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import Community from "../../../../../shared/Community";
import "../../modules/LoginPanel.css";
import "./Invite.css";
import "../Modal.css";

type Props = RouteComponentProps & {
  newCommunity: Community;
  setShowInvite: any;
};

const Invite = (props: Props) => {
  const newest: Community = props.newCommunity;
  const joinLink = `http://localhost:5050/api/joincommunity?code=${newest.code}`;
  const subject = `Join ${newest.name} on Crash!`;
  const message = `I just launched a new community called ${newest.name} on Crash! Create an account and join with community code ${newest.code}, or follow this link: ${joinLink}`;

  return (
    <div className="centered default-container">
      <h2>Invite users to join {newest.name} on Crash!</h2>
      <h1
        title="Copy invite code"
        className="u-pointer"
        onClick={(event) => {
          navigator.clipboard.writeText(newest.code.toString()); // copy invite code to clipboard
        }}
      >
        {newest.code}
      </h1>
      <div className="options-container">
        <button
          className="login-button u-pointer"
          onClick={(event) => {
            window.open(`mailto:?subject=${subject}&body=${message}`); // open mail with default msg containing unique invite code/link
          }}
        >
          Email invite code
        </button>
        <button className="login-button u-pointer" onClick={(event) => {}}>
          Message Crash user
        </button>
      </div>
      <p className="text-option u-pointer" onClick={(event) => props.setShowInvite(false)}>
        Maybe later
      </p>
    </div>
  );
};

export default Invite;
