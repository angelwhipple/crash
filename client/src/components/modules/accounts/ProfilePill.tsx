import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./ProfilePill.css";
import linkedin from "../../../assets/linkedin.png";
import google from "../../../assets/google.png";
import facebook from "../../../assets/fb.png";
import origin from "../../../assets/origin.png";

type Props = RouteComponentProps & {
  key: number;
  profile: any;
  chosenProfiles: string[];
  setChosenProfiles: (profiles: string[]) => void;
};

const PROFILE_ICONS = {
  linkedinid: linkedin,
  googleid: google,
  facebookid: facebook,
  originid: origin,
};

const ProfilePill = (props) => {
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
    if (checkbox.target.checked) {
      props.setChosenProfiles((prev: string[]) => [...prev, platform]); // functional (dynamic) update
    } else {
      props.setChosenProfiles(
        props.chosenProfiles.filter((profile: string) => profile !== platform)
      );
    }
  };

  return (
    <div className="pill-container u-pointer">
      <img src={icon} className="platform-icon"></img>
      {/* use username for origin accounts */}
      <p>{props.profile.name ? props.profile.name : props.profile.username}</p>
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
