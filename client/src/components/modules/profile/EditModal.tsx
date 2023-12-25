import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "../Modal.css";
import "./EditModal.css";
import helpers from "../helpers";

type Props = RouteComponentProps & {
  userId: string;
  setEditing: any;
};

const EditModal = (props: Props) => {
  const [file, setFile] = useState<File | undefined>(undefined);

  const updateProfile = async (
    nameInput: HTMLInputElement,
    bioInput: HTMLInputElement,
    file?: File
  ) => {
    const formData = new FormData();
    formData.append("userId", props.userId);
    // validate username
    if (nameInput.value) formData.append("username", nameInput.value);
    if (bioInput.value) formData.append("bio", bioInput.value);
    if (file) formData.append("image", file);

    fetch("/api/user/update", { method: "POST", body: formData }).then(async (res) => {
      const data = await res.json();
      if (data.valid) console.log(data);
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
                  const imgFile = event.target.files[0];
                  setFile(imgFile);
                  event.target.value = "";
                }
              }}
            ></input>
            <p>{file ? file.name : "Upload a new photo"}</p>
          </label>
          <label>
            New username
            <input id="username" type="text"></input>
          </label>
          <label>
            New bio
            <input id="bio" type="text"></input>
          </label>
          <div className="action-container">
            <button
              onClick={async (event) => {
                const usernameInput = document.getElementById("username") as HTMLInputElement;
                const bioInput = document.getElementById("bio") as HTMLInputElement;
                await updateProfile(usernameInput, bioInput, file);
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
