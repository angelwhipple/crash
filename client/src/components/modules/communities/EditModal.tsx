import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "../Modal.css";

type Props = RouteComponentProps & {
  setEditing: any;
  communityId: string;
};

const EditModal = (props: Props) => {
  const updateDescription = (descriptionInput: HTMLInputElement) => {
    if (descriptionInput.value) {
      const body = { communityId: props.communityId, description: descriptionInput.value };
      descriptionInput.value = "";
      post("/api/community/description", body);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h3>Edit community details</h3>
          <input
            id="description"
            type="text"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const descriptionInput = document.getElementById("description") as HTMLInputElement;
                updateDescription(descriptionInput);
                props.setEditing(false);
              }
            }}
          ></input>
          <div className="action-container">
            <button
              className="default-button u-pointer"
              onClick={(event) => {
                const descriptionInput = document.getElementById("description") as HTMLInputElement;
                updateDescription(descriptionInput);
                props.setEditing(false);
              }}
            >
              submit
            </button>
            <button
              className="default-button u-pointer"
              onClick={(event) => {
                props.setEditing(false);
              }}
            >
              exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
