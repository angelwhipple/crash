import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import Community from "../../../../../shared/Community";

type Props = RouteComponentProps & {
  activeCommunity: Community;
};

const Annoucements = (props: Props) => {
  return <div className="centered default-container">Message center coming soon</div>;
};

export default Annoucements;
