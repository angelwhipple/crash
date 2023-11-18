import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import { CgDetailsMore } from "react-icons/cg";
import { MdOutlineAnnouncement } from "react-icons/md";
import { MdManageAccounts } from "react-icons/md";
import { MdExplore } from "react-icons/md";
import "./CommunityMenu.css";

type Props = RouteComponentProps & {
  userId: String;
};

enum MENU_ACTIONS {
  "DETAILS", // view/edit community details
  "MANAGE", // manage members/admin, settings, etc (ADMIN/OWNER ONLY)
  "ANNOUCEMENTS", // view/post community-wide announcements (post ADMIN ONLY)
  "EXPLORE", // community feed, see recent posts & updates
  "TOGGLE", // switch between communities
}

const CommunityMenu = (props: Props) => {
  const [hoverExplore, setHoverExplore] = useState(false);
  const [hoverManage, setHoverManage] = useState(false);
  const [hoverAnnounce, setHoverAnnounce] = useState(false);
  const [hoverDetails, setHoverDetails] = useState(false);

  return (
    <div className="menu-options-container">
      <button
        id="border"
        className="menu-option reg u-pointer"
        onMouseOver={(event) => {
          setHoverExplore(true);
        }}
        onMouseOut={(event) => {
          setHoverExplore(false);
        }}
      >
        <MdExplore
          id="icon"
          className={`${hoverExplore ? `menu-icon-sel icon-reg-sel` : `menu-icon icon-reg`}`}
        />
      </button>
      <button
        className="menu-option inv u-pointer"
        onMouseOver={(event) => {
          setHoverAnnounce(true);
        }}
        onMouseOut={(event) => {
          setHoverAnnounce(false);
        }}
      >
        <MdOutlineAnnouncement
          className={`${hoverAnnounce ? `menu-icon-sel icon-inv-sel` : `menu-icon icon-inv`}`}
        />
      </button>
      <button
        className="menu-option reg u-pointer"
        onMouseOver={(event) => {
          setHoverDetails(true);
        }}
        onMouseOut={(event) => {
          setHoverDetails(false);
        }}
      >
        <CgDetailsMore
          className={`${hoverDetails ? `menu-icon-sel icon-reg-sel` : `menu-icon icon-reg`}`}
        />
      </button>
      <button
        className="menu-option inv u-pointer"
        onMouseOver={(event) => {
          setHoverManage(true);
        }}
        onMouseOut={(event) => {
          setHoverManage(false);
        }}
      >
        <MdManageAccounts
          className={`${hoverManage ? `menu-icon-sel icon-inv-sel` : `menu-icon icon-inv`}`}
        />
      </button>
    </div>
  );
};

export default CommunityMenu;
