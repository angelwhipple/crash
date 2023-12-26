import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "../Modal.css";
import "./EditModal.css";
import helpers from "../helpers";
import { MdInfoOutline } from "react-icons/md";

type Props = RouteComponentProps & {
  name: string;
  username: string;
  bio: string;
  userId: string;
  setEditing: any;
  setRequirements: any;
};

const EditModal = (props: Props) => {
  const [file, setFile] = useState<File | undefined>(undefined);

  const updateProfile = async (
    nameInput: HTMLInputElement,
    usernameInput: HTMLInputElement,
    bioInput: HTMLInputElement,
    file?: File
  ) => {
    const formData = new FormData();
    formData.append("userId", props.userId);
    if (nameInput.value) formData.append("name", nameInput.value);
    if (usernameInput.value) formData.append("username", usernameInput.value); // TODO: validate username
    if (bioInput.value) formData.append("bio", bioInput.value);
    if (file) formData.append("image", file);

    fetch("/api/user/update", { method: "POST", body: formData }).then(async (res) => {
      const data = await res.json();
      if (data.valid) console.log(data);
    });
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-content">
            <h3>Edit profile</h3>
            <label className="img-label u-pointer">
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
            <label className="edit-label">
              Full name
              <input id="name" type="text" className="edit-input" placeholder={props.name}></input>
            </label>
            <label className="edit-label">
              <MdInfoOutline
                className="info-icon-profile u-pointer"
                onClick={(event) => {
                  props.setEditing(false);
                  props.setRequirements(true);
                }}
              ></MdInfoOutline>
              Username
              <input
                id="username"
                type="text"
                className="edit-input"
                placeholder={props.username}
              ></input>
            </label>
            <div className="multiline-container">
              <p>Bio</p>
              <textarea id="bio" className="multiline-input" defaultValue={props.bio}></textarea>
            </div>
            <div className="action-container">
              <button
                onClick={async (event) => {
                  const nameInput = document.getElementById("name") as HTMLInputElement;
                  const usernameInput = document.getElementById("username") as HTMLInputElement;
                  const bioInput = document.getElementById("bio") as HTMLInputElement;
                  await updateProfile(nameInput, usernameInput, bioInput, file);
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
    </>
  );
};

export default EditModal;
