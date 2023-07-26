import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./Modal.css";
import "./Merge.css";

type Props = RouteComponentProps & {};

const Merge = (props) => {
  return (
    <div className="modal-Container">
      <div className="merge-modal-container">
        <div className="merge-modal">
          <h1>Is this you?</h1>
          <p>
            We found another profile under the same email address. Would you like to merge them?
          </p>
          <div className="u-flex"></div>
        </div>
      </div>
    </div>
  );
};

export default Merge;
