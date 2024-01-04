import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./Modal.css";

type Props = RouteComponentProps & {
  setDisplay: any;
};

const Ad = (props: Props) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h4>Subscribe to Crash Premium!</h4>
          <p>
            <strong>For only $5/mo, unlock access to platform features such as:</strong>
          </p>
          <ul>
            <li>Roommate Finder: create & request to join verified roommate groups</li>
            <li>View active subleasings on Crash</li>
            <li>Sublease your unit to other Crash Premium users</li>
          </ul>
          <div className="action-container">
            <a href="https://buy.stripe.com/14k15ZcKH5G40w0dQR" target="_blank">
              <button className="default-button u-pointer">Purchase</button>
            </a>
            <button className="default-button u-pointer" onClick={() => props.setDisplay(false)}>
              Not today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ad;
