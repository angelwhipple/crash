import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./ProfilePill.css";
import linkedin from "../../assets/linkedin.png";
import google from "../../assets/google.png";
import facebook from "../../assets/fb.png";

type Props = RouteComponentProps & {};

const PROFILE_ICONS = {
  linkedinid: linkedin,
  googleid: google,
  facebookid: facebook,
};

const ProfilePill = (props) => {
  console.log(`Profile info: ${JSON.stringify(props.profile)}`);
  const [platform, setPlatform] = useState("");
  const [icon, setIcon] = useState("");

  useEffect(() => {
    for (const [platform, path] of Object.entries(PROFILE_ICONS)) {
      if (platform in props.profile) {
        setIcon(path);
        setPlatform(platform);
      }
    }
  }, []);

  const handleSelect = (checkbox) => {
    console.log(`Checkbox status: ${checkbox.target.checked}`);
    if (checkbox.target.checked) {
      props.setChosenProfiles([...props.chosenProfiles, platform]);
    }
  };

  return (
    <div className="pill-container u-pointer">
      <img src={icon} className="platform-icon"></img>
      <p>{props.profile.name}</p>
      <input
        id="platformCheck"
        type="checkbox"
        className="u-pointer"
        onClick={handleSelect.bind(this)}
      ></input>
    </div>
  );
};

export default ProfilePill;
