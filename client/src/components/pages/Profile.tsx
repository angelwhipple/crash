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

type Props = RouteComponentProps & {
  userId: string;
};

const Profile = (props: Props) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [editing, setEditing] = useState(false);

  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };

  useEffect(() => {
    if (props.userId !== undefined) {
      get("/api/user/fetch", { id: props.userId }).then((res) => {
        if (res.valid) setUser(res.user);
      });
    }
  }, []);

  return (
    <>
      {props.userId ? (
        <>
          {editing ? <EditModal setEditing={setEditing}></EditModal> : <></>}
          <div className="profile-split">
            <div className="card-container">
              <FaGear
                className="edit-icon u-pointer"
                onClick={(event) => {
                  setEditing(true);
                }}
              ></FaGear>
              <div className="profile-info-container">
                <h3>@{user?.username !== undefined ? user.username : "defaultuser420"}</h3>
                <img src={blank} className="profile-pic"></img>
                <h4>{user?.name !== undefined ? user.name : "Crash User"}</h4>
                <p>{user?.bio !== undefined ? user.bio : `Add a bio`}</p>
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
              route("/");
              socket.emit("toggleAll", {});
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
