import React, { useState } from "react";
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
};
const Homepage = (props: Props) => {
  const { handleLogin, handleLogout } = props;

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
