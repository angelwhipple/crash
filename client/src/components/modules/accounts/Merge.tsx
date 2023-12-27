import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "../Modal.css";
import "./Merge.css";

type Props = RouteComponentProps & {
  chosenProfiles: string[];
  extraProfiles: any[];
  setConsolidate: boolean;
};

const Merge = (props) => {
  return (
    <div className="modal-overlay">
      <div className="merge-modal-container">
        <div className="merge-modal">
          <h3>Is this you?</h3>
          <p>
            We found another profile registered with your email address. Do you want to link these
            accounts?
          </p>
          <div className="profiles-container">{props.extraProfiles}</div>
          <div className="action-container">
            <button
              onClick={(event) => {
                console.log(`Selected profiles: ${props.chosenProfiles}`);
                if (props.chosenProfiles.length > 0) {
                  const body = {
                    id: props.userId,
                    name: props.extraProfiles[0].props.profile.name,
                    email: props.extraProfiles[0].props.profile.email,
                    profiles: props.chosenProfiles,
                  };
                  post("/api/user/consolidate", body).then((res) => {
                    console.log(`Conslidated user: ${JSON.stringify(res)}`);
                  });
                }
                props.setConsolidate(false);
              }}
              className="default-button u-pointer"
            >
              <p>Yes, please</p>
            </button>
            <div
              onClick={(event) => {
                props.setConsolidate(false);
              }}
              className="default-button u-pointer"
            >
              <p> Not me</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Merge;
