import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";

type Props = RouteComponentProps & {};

enum MENU_ACTIONS {
  "DETAILS", // view/edit community details
  "MANAGE", // manage members/admin, settings, etc (ADMIN/OWNER ONLY)
  "ANNOUCEMENTS",
}

const CommunityMenu = (props) => {
  return <div className="centered">Coming soon...</div>;
};

export default CommunityMenu;
