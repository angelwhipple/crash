import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./MemberEntry.css";
import User from "../../../../../shared/User";
import Community from "../../../../../shared/Community";
import { RxCross2 } from "react-icons/rx";
import { IoCheckmarkSharp } from "react-icons/io5";
import { BiSolidCrown } from "react-icons/bi";
import blank from "../../../assets/blank.jpg";

type Props = RouteComponentProps & {
  user: User;
  community: Community;
};

const Member = (props: Props) => {
  const [focused, setFocused] = useState(false);
  const [img, setImg] = useState<any>(blank);

  useEffect(() => {
    get("/api/user/loadphoto", { userId: props.user._id }).then((res) => {
      if (res.valid) {
        const buffer = res.buffer.Body.data;
        const base64Image = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        const src = `data:image/jpeg;base64,${base64Image}`;
        setImg(src);
      }
    });
  }, []);

  return (
    <div
      className="entry-container"
      onMouseOver={(event) => setFocused(true)}
      onMouseOut={(event) => setFocused(false)}
    >
      <img src={img} className="member-img"></img>

      {props.user._id === props.community.owner ? (
        <div className="u-flex u-alignCenter">
          <BiSolidCrown className={`${focused ? `icon-sel` : `crown-icon`}`}></BiSolidCrown>
          <p>{props.user.name !== undefined ? props.user.name : props.user.username}</p>
        </div>
      ) : (
        <div className="u-flex u-alignCenter">
          <p>{props.user.name !== undefined ? props.user.name : props.user.username}</p>
        </div>
      )}

      {props.user.verified ? (
        <div className="u-flex u-alignCenter">
          <IoCheckmarkSharp className={`${focused ? `icon-sel` : `check-icon`}`}></IoCheckmarkSharp>{" "}
          Verified
        </div>
      ) : (
        <div className="u-flex u-alignCenter">
          <RxCross2 className={`${focused ? `icon-sel` : `x-icon`}`}></RxCross2> Unverified
        </div>
      )}
    </div>
  );
};

export default Member;
