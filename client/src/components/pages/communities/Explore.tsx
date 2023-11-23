import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import Community from "../../../../../shared/Community";

type Props = RouteComponentProps & {
  activeCommunity: Community;
};

const Explore = (props: Props) => {
  return <div className="centered default-container">Explore page coming soon</div>;
};

export default Explore;
