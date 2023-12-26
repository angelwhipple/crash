import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { io } from "socket.io-client";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./Profile.css";
import "../modules/LoginPanel.css";
import blank from "../../assets/blank.jpg";
import User from "../../../../shared/User";
import EditModal from "../modules/profile/EditModal";
import { FaGear } from "react-icons/fa6";
import RequirementModal from "../modules/profile/Requirements";

type Props = RouteComponentProps & {
  userId: string;
};

const Profile = (props: Props) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [name, setName] = useState(`Crash User`);
  const [username, setUsername] = useState(`default_user420`);
  const [pfp, setPfp] = useState<any>(blank);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(`Add a bio`);
  const [requirements, setRequirements] = useState(false);

  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };

  const updatePhoto = async (imageBuffer: ArrayBuffer) => {
    const base64Image = btoa(
      new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    const src = `data:image/jpeg;base64,${base64Image}`;
    setPfp(src);
  };

  socket.on("updated user", (event) => {
    if (event.image) {
      const buffer = event.image;
      updatePhoto(buffer);
    }
    if (event.name) setName(event.name);
    if (event.username) setUsername(event.username);
    if (event.bio) setBio(event.bio);
  });

  useEffect(() => {
    if (props.userId !== undefined) {
      get("/api/user/fetch", { id: props.userId }).then((res) => {
        if (res.valid) {
          setUser(res.user);
          setName(res.user.name);
          setUsername(res.user.username);
          if (res.user.bio) setBio(res.user.bio);
          get("/api/user/loadphoto", { userId: res.user._id }).then((res) => {
            if (res.valid) {
              const buffer = res.buffer.Body.data;
              updatePhoto(buffer);
            }
          });
        }
      });
    }
  }, []);

  return (
    <>
      {props.userId ? (
        <>
          {editing ? (
            <>
              <EditModal
                name={name}
                bio={bio}
                username={username}
                userId={props.userId}
                setEditing={setEditing}
                setRequirements={setRequirements}
              ></EditModal>
            </>
          ) : (
            <>
              {requirements ? (
                <RequirementModal
                  setEditing={setEditing}
                  setRequirements={setRequirements}
                ></RequirementModal>
              ) : (
                <></>
              )}
            </>
          )}
          <div className="profile-split">
            <div className="card-container">
              <FaGear
                className="edit-icon u-pointer"
                onClick={(event) => {
                  setEditing(true);
                }}
              ></FaGear>
              <div className="profile-info-container">
                <h3>@{username}</h3>
                <img src={pfp} className="profile-pic"></img>
                <h4>{name}</h4>
                <p className="opaque-text">{bio}</p>
                <div className="follow-cts">
                  <p>0 followers</p>
                  <p>0 following</p>
                </div>
              </div>
              <div className="connected-view">
                <p>CONNECTED ACCOUNTS</p>
                <div className="account-pill">TEST</div>
              </div>
            </div>
          </div>
          <div className="details-split"></div>
          <div className="settings-split"></div>
        </>
      ) : (
        <div className="centered default-container">
          Login to see profile
          <button
            className="default-button u-pointer"
            onClick={(event) => {
              socket.emit("nav toggle all", {});
              route("/");
            }}
          >
            Take me back
          </button>
        </div>
      )}
    </>
  );
};

export default Profile;
