import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./CreateAccount.css";

type Props = RouteComponentProps & {
  setShowReq: any;
};

const RequirementModal = (props: Props) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h4>Password requirements</h4>
          <div className="req-text">
            <p>1. Your password must be atleast 8 characters long.</p>
            <p>2. Must include a mix of letters, numbers, and special characters.</p>
            <p>3. Avoid common passwords and consider using passphrases for added security.</p>
          </div>
          <button
            className="default-button u-pointer"
            onClick={(event) => {
              props.setShowReq(false);
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
