import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "../accounts/CreateAccount.css";

type Props = RouteComponentProps & {
  setRequirements: any;
  setEditing: any;
};

const RequirementModal = (props: Props) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h4>Username requirements</h4>
          <div className="req-text">
            <p>1. New username must be atleast 3 characters long.</p>
            <p>2. Can include a mix of letters, numbers, and underscores.</p>
            <p>3. Usernames may only be changed twice every 30 days.</p>
            <p>4. Your old username will be reserved for up to 5 days after the change.</p>
          </div>
          <button
            className="default-button u-pointer"
            onClick={(event) => {
              props.setRequirements(false);
              props.setEditing(true);
            }}
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequirementModal;
