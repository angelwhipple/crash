import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "../Modal.css";
import "../LoginPanel.css";

type Props = RouteComponentProps & {
  setEditDes: any;
  communityId: string;
};

const EditDescription = (props: Props) => {
  const updateDescription = (descriptionInput: HTMLInputElement) => {
    if (descriptionInput.value) {
      const body = { communityId: props.communityId, description: descriptionInput.value };
      descriptionInput.value = "";
      post("/api/community/description", body).then((res) => {
        console.log(res);
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h3>Enter a new description</h3>
          <input
            id="description"
            type="text"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const descriptionInput = document.getElementById("description") as HTMLInputElement;
                updateDescription(descriptionInput);
              }
            }}
          ></input>
          <div className="u-flex u-justifyCenter">
            <button
              className="login-button u-pointer"
              onClick={(event) => {
                const descriptionInput = document.getElementById("description") as HTMLInputElement;
                updateDescription(descriptionInput);
              }}
            >
              submit
            </button>
            <button
              className="login-button u-pointer"
              onClick={(event) => {
                props.setEditDes(false);
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

export default EditDescription;
