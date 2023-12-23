import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "../Modal.css";
import "./EditModal.css";

type Props = RouteComponentProps & {
  setEditing: any;
};

const EditModal = (props: Props) => {
  const [filename, setFilename] = useState("Upload new photo");

  const updateProfile = async (
    fileInput: HTMLInputElement,
    bioInput?: HTMLInputElement,
    nameInput?: HTMLInputElement
  ) => {
    const body = {};
    post("/api/user/update", body).then((res) => {
      console.log(res);
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h3>Edit profile</h3>
          <label className="edit-label u-pointer">
            <input
              id="image"
              type="file"
              onChange={(event) => {
                if (event.target.files && event.target.files[0]) {
                  const file = event.target.files[0];
                  setFilename(file.name);
                  event.target.value = "";
                }
              }}
            ></input>
            <p>{filename}</p>
          </label>
          <div className="action-container">
            <button
              onClick={async (event) => {
                const imageInput = document.getElementById("image") as HTMLInputElement;
                await updateProfile(imageInput);
                props.setEditing(false);
              }}
              className="default-button u-pointer"
            >
              submit
            </button>
            <button
              onClick={(event) => {
                props.setEditing(false);
              }}
              className="default-button u-pointer"
            >
              close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
