import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import { googleLogout } from "@react-oauth/google";
import "./Modal.css";

type Props = RouteComponentProps & {
  setLogout: any;
  setUserId: any;
};

const Logout = (props: Props) => {
  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <p>Are you sure you would like to logout?</p>
          <div className="action-container">
            <button
              className="default-button u-pointer"
              onClick={(event) => {
                props.setUserId(undefined);
                googleLogout();
                post("/api/logout").then((res) => {
                  socket.emit("nav toggle all", {});
                  props.setLogout(false);
                  route("/");
                });
              }}
            >
              yes
            </button>
            <button className="default-button u-pointer" onClick={() => props.setLogout(false)}>
              no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;
