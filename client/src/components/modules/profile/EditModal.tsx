import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "../Modal.css";
import "./EditModal.css";

type Props = RouteComponentProps & {
  userId: string;
  setEditing: any;
};

const EditModal = (props: Props) => {
  const [file, setFile] = useState<File | undefined>(undefined);

  const updateProfile = async (
    file?: File,
    bioInput?: HTMLInputElement,
    nameInput?: HTMLInputElement
  ) => {
    const formData = new FormData();
    formData.append("userId", props.userId);
    if (file) formData.append("image", file);

    fetch("/api/user/update", { method: "POST", body: formData }).then(async (res) => {
      const data = await res.json();
      if (data.valid) console.log(`S3 Profile image url: ${data.url}`);
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
          <div className="action-container">
            <button
              onClick={async (event) => {
                const imageInput = document.getElementById("image") as HTMLInputElement;
                await updateProfile(file);
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
