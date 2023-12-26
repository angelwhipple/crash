import React, { useEffect, useState } from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
  CredentialResponse,
} from "@react-oauth/google";
import { socket } from "../../client-socket";
import "./Homepage.css";
import { RouteComponentProps } from "@reach/router";
import LoginPanel from "../modules/LoginPanel";
import Merge from "../modules/accounts/Merge";

type Props = RouteComponentProps & {
  userId?: any;
  consolidate: boolean;
  extraProfiles: any[];
  chosenProfiles: string[];
  handleLogin: (credentialResponse: CredentialResponse) => void;
  handleLogout: () => void;
  setConsolidate: (consolidate: boolean) => void;
  setChosenProfiles: (profiles: string[]) => void;
  setUserId: (newUserId: string) => void;
  setInvited: any;
  setJoinCode: any;
};
const Homepage = (props: Props) => {
  const { handleLogin, handleLogout } = props;

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const invited = urlParams.get("joined_community");
    const communityCode = urlParams.get("community_code");
    console.log(`From invitation link: ${invited}`);
    if (invited) {
      props.setInvited(true);
      props.setJoinCode(communityCode);
    }
  }, []);

  return (
    <div className="u-flexColumn u-alignCenter">
      <LoginPanel
        handleLogin={handleLogin}
        googleLogout={googleLogout}
        handleLogout={handleLogout}
        setChosenProfiles={props.setChosenProfiles}
        userId={props.userId}
        setUserId={props.setUserId}
      ></LoginPanel>
      {props.consolidate ? (
        <Merge
          userId={props.userId}
          extraProfiles={props.extraProfiles}
          chosenProfiles={props.chosenProfiles}
          setConsolidate={props.setConsolidate}
        ></Merge>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Homepage;
