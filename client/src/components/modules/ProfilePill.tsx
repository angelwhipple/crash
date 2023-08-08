import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./ProfilePill.css";

type Props = RouteComponentProps & {};

const ProfilePill = (props) => {
  return (
    <div className="pill-container u-pointer">
      <p>{props.profile._id}</p>
    </div>
  );
};

export default ProfilePill;
