import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";

type Props = RouteComponentProps & {
  header: string;
  info: any;
  setRequirements: any;
  setEditing?: any;
};

const InfoModal = (props: Props) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h4>{props.header}</h4>
          <div className="info-text">{props.info}</div>
          <button
            className="default-button u-pointer"
            onClick={(event) => {
              props.setRequirements(false);
              if (props.setEditing) props.setEditing(true);
            }}
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
