import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import { CgDetailsMore } from "react-icons/cg";
import { MdOutlineAnnouncement } from "react-icons/md";
import { MdManageAccounts } from "react-icons/md";
import { MdExplore } from "react-icons/md";
import { ImExit } from "react-icons/im";
import "./CommunityMenu.css";
import { response } from "express";

enum MenuAction {
  "DETAILS", // view/edit community details
  "MANAGE", // manage members/admin, settings, etc (ADMIN/OWNER ONLY)
  "ANNOUCEMENTS", // view/post community-wide announcements (post ADMIN ONLY)
  "EXPLORE", // community feed, see recent posts & updates
  "TOGGLE", // switch between communities
}

type Props = RouteComponentProps & {
  userId: String;
  menuAction: MenuAction | undefined;
  setMenuAction: any;
  setUserId: any;
};

const CommunityMenu = (props: Props) => {
  const [hoverExplore, setHoverExplore] = useState(false);
  const [hoverManage, setHoverManage] = useState(false);
  const [hoverAnnounce, setHoverAnnounce] = useState(false);
  const [hoverDetails, setHoverDetails] = useState(false);

  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };

  return (
    <div className="menu-options-container">
      <button
        id="border"
        title="Explore"
        className={`${
          props.menuAction === MenuAction.EXPLORE
            ? `menu-option-sel reg-sel u-pointer`
            : `menu-option reg u-pointer`
        }`}
        onMouseOver={(event) => {
          setHoverExplore(true);
        }}
        onMouseOut={(event) => {
          setHoverExplore(false);
        }}
        onClick={(event) => {
          props.setMenuAction(MenuAction.EXPLORE);
        }}
      >
        <MdExplore
          id="icon"
          className={`${
            hoverExplore || props.menuAction === MenuAction.EXPLORE
              ? `menu-icon-sel icon-reg-sel`
              : `menu-icon icon-reg`
          }`}
        />
      </button>
      <button
        title="Annoucements"
        className={`${
          props.menuAction === MenuAction.ANNOUCEMENTS
            ? `menu-option-sel inv-sel u-pointer`
            : `menu-option inv u-pointer`
        }`}
        onMouseOver={(event) => {
          setHoverAnnounce(true);
        }}
        onMouseOut={(event) => {
          setHoverAnnounce(false);
        }}
        onClick={(event) => {
          props.setMenuAction(MenuAction.ANNOUCEMENTS);
        }}
      >
        <MdOutlineAnnouncement
          className={`${
            hoverAnnounce || props.menuAction === MenuAction.ANNOUCEMENTS
              ? `menu-icon-sel icon-inv-sel`
              : `menu-icon icon-inv`
          }`}
        />
      </button>
      <button
        title="Community details"
        className={`${
          props.menuAction === MenuAction.DETAILS
            ? `menu-option-sel reg-sel u-pointer`
            : `menu-option reg u-pointer`
        }`}
        onMouseOver={(event) => {
          setHoverDetails(true);
        }}
        onMouseOut={(event) => {
          setHoverDetails(false);
        }}
        onClick={(event) => {
          props.setMenuAction(MenuAction.DETAILS);
        }}
      >
        <CgDetailsMore
          className={`${
            hoverDetails || props.menuAction === MenuAction.DETAILS
              ? `menu-icon-sel icon-reg-sel`
              : `menu-icon icon-reg`
          }`}
        />
      </button>
      <button
        title="Manage community"
        className={`${
          props.menuAction === MenuAction.MANAGE
            ? `menu-option-sel inv-sel u-pointer`
            : `menu-option inv u-pointer`
        }`}
        onMouseOver={(event) => {
          setHoverManage(true);
        }}
        onMouseOut={(event) => {
          setHoverManage(false);
        }}
        onClick={(event) => {
          props.setMenuAction(MenuAction.MANAGE);
        }}
      >
        <MdManageAccounts
          className={`${
            hoverManage || props.menuAction === MenuAction.MANAGE
              ? `menu-icon-sel icon-inv-sel`
              : `menu-icon icon-inv`
          }`}
        />
      </button>
    </div>
  );
};

export default CommunityMenu;
