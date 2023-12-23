import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./Modal.css";
import "./FiltersModal.css";

type Props = RouteComponentProps & {
  setFiltering: any;
  setQuerying: any;
};

const Filters = (props: Props) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h3>Advanced search</h3>
          <label>
            <input type="checkbox"></input>
            <p>All</p>
          </label>
          <button
            onClick={(event) => {
              props.setFiltering(false);
              props.setQuerying(true);
            }}
            className="default-button u-pointer"
          >
            close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
