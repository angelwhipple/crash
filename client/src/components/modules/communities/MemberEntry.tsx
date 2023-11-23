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

type Props = RouteComponentProps & {
  user: User;
  community: Community;
};

const Member = (props: Props) => {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className="entry-container"
      onMouseOver={(event) => setFocused(true)}
      onMouseOut={(event) => setFocused(false)}
    >
      <p>IMG</p>

      {props.user._id === props.community.owner ? (
        <div className="u-flex u-alignCenter">
          <BiSolidCrown className={`${focused ? `icon-sel` : `crown-icon`}`}></BiSolidCrown>
          <p>{props.user.name !== undefined ? props.user.name : props.user.username}</p>
        </div>
      ) : (
        <p>{props.user.name !== undefined ? props.user.name : props.user.username}</p>
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
