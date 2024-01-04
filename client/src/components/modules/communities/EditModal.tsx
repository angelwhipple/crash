import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "../modals/Modal.css";
import "../profile/EditModal.css";
import ImCropper from "../ImCropper";
import "../ImCropper.css";
import helpers from "../../helpers";
import { Crop, CustomError } from "../../types";

type Props = RouteComponentProps & {
  setEditing: any;
  communityId: string;
  name: string;
  decription: string;
};

const EditModal = (props: Props) => {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [crop, setCrop] = useState<Crop>({ show: false });
  const [error, setError] = useState<CustomError>({ valid: false });

  const update = async (nameInput?: HTMLInputElement, descriptionInput?: HTMLInputElement) => {
    const formData = new FormData();
    formData.append("communityId", props.communityId);
    if (file) formData.append("image", file);

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

  useEffect(() => {
    setError({ valid: false });
  }, [file]);

  return (
    <>
      {crop.show ? (
        <ImCropper
          setError={setError}
          inputImg={crop.input!}
          setCrop={setCrop}
          setFile={setFile}
        ></ImCropper>
      ) : (
        <div className="modal-overlay">
          <div id="reg-container" className="modal-container">
            <div id="reg-content" className="modal-content">
              <h3>Edit community details</h3>
              {error.valid ? (
                <p className="error-text">{error.message}</p>
              ) : (
                <p className="error-text-hidden">Default</p>
              )}
              {crop.previewSrc ? (
                <img className="cropper-preview" src={crop.previewSrc}></img>
              ) : (
                <></>
              )}
              <label>
                <input
                  type="file"
                  name="photo"
                  onChange={async (event) => {
                    if (event.target.files && event.target.files[0]) {
                      setCrop({ show: true, input: event.target.files[0] });
                    }
                  }}
                ></input>
                <p className="img-label u-pointer">{file ? file.name : "Upload a new photo"}</p>
              </label>
              <label className="edit-label">
                Name
                <input
                  id="name"
                  type="text"
                  className="edit-input"
                  placeholder={props.name}
                ></input>
              </label>
              <div className="multiline-container">
                <p>Description</p>
                <textarea
                  id="description"
                  className="multiline-input"
                  defaultValue={props.decription}
                ></textarea>
              </div>
              <div className="action-container">
                <button
                  className="default-button u-pointer"
                  onClick={async (event) => {
                    const nameInput = document.getElementById("name") as HTMLInputElement;
                    const descriptionInput = document.getElementById(
                      "description"
                    ) as HTMLInputElement;
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
      )}
    </>
  );
};

export default EditModal;
