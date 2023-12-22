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
          <h1>Is this you?</h1>
          <p>
            We found another profile under the same email address. Would you like to connect your
            accounts?
          </p>
          <div className="profiles-container">{props.extraProfiles}</div>
          <div className="confirm-container">
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
                  post("/api/consolidate", body).then((res) => {
                    console.log(`Conslidated user: ${JSON.stringify(res)}`);
                  });
                }
                props.setConsolidate(false);
              }}
              className="confirm-button u-pointer"
            >
              Yes, please
            </button>
            <button
              onClick={(event) => {
                props.setConsolidate(false);
              }}
              className="confirm-button u-pointer"
            >
              No, thank you
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Merge;
