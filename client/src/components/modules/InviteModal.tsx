import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import Community from "../../../../shared/Community";
import "../modules/LoginPanel.css";
import "./InviteModal.css";

type Props = RouteComponentProps & {
  communities: Community[];
  setInviteModal: any;
};

const InviteModal = (props: Props) => {
  const newest: Community = props.communities[props.communities.length - 1];
  const message = "";

  return (
    <div className="centered default-container">
      <h2>Invite users to join {newest.name} on Crash!</h2>
      <h1
        className="u-pointer"
        onClick={(event) => {
          // copy invite code to clipboard
          navigator.clipboard.writeText(newest.code.toString());
        }}
      >
        {newest.code}
      </h1>
      <div className="options-container">
        <button
          className="login-button u-pointer"
          onClick={(event) => {
            // window.open(); // open mail with default msg including unique invite code
          }}
        >
          Email invite code
        </button>
        <button className="login-button u-pointer" onClick={(event) => {}}>
          Message Crash user
        </button>
      </div>
      <p className="text-option u-pointer" onClick={(event) => props.setInviteModal(false)}>
        Maybe later
      </p>
    </div>
  );
};

export default InviteModal;
