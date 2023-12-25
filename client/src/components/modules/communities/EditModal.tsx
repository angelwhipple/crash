import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "../Modal.css";
import "../profile/EditModal.css";

type Props = RouteComponentProps & {
  setEditing: any;
  communityId: string;
};

const EditModal = (props: Props) => {
  const [file, setFile] = useState<File | undefined>(undefined);

  const update = async (nameInput?: HTMLInputElement, descriptionInput?: HTMLInputElement) => {
    const formData = new FormData();
    formData.append("communityId", props.communityId);
    if (file) {
      formData.append("image", file);
    }
    if (nameInput && nameInput.value) {
      formData.append("name", nameInput.value);
      nameInput.value = "";
    }
    if (descriptionInput && descriptionInput.value) {
      formData.append("description", descriptionInput.value);
      descriptionInput.value = "";
    }
    fetch("/api/community/update", { method: "POST", body: formData }).then(async (res) => {
      const data = await res.json();
      if (data.valid) console.log(data);
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h3>Edit community details</h3>
          <label>
            <input
              type="file"
              name="photo"
              onChange={async (event) => {
                if (event.target.files && event.target.files[0]) {
                  const file = event.target.files[0];
                  event.target.value = "";
                  setFile(file);
                }
              }}
            ></input>
            <p className="edit-label u-pointer">{file ? file.name : "Upload a new photo"}</p>
          </label>
          <label>
            New community name
            <input id="name" type="text"></input>
          </label>
          <label>
            New description
            <input id="description" type="text"></input>
          </label>

          <div className="action-container">
            <button
              className="default-button u-pointer"
              onClick={async (event) => {
                const nameInput = document.getElementById("name") as HTMLInputElement;
                const descriptionInput = document.getElementById("description") as HTMLInputElement;
                await update(nameInput, descriptionInput);
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
