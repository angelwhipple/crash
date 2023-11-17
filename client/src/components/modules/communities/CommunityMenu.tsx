import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
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
  return <></>;
};

export default CommunityMenu;
