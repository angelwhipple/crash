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

import { Player, Controls } from "@lottiefiles/react-lottie-player";

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
  const [create, setCreate] = useState(false);
  const [login, setLogin] = useState(false);

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
    <div className="background">
      {props.userId ? (
        <>
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
          <div className="centered default-container">
            You are logged in
            <button
              className="default-button u-pointer"
              onClick={() => {
                googleLogout();
                props.handleLogout();
              }}
            >
              Logout
            </button>
          </div>
        </>
      ) : create ? (
        <LoginPanel
          handleLogin={handleLogin}
          setChosenProfiles={props.setChosenProfiles}
          userId={props.userId}
          setUserId={props.setUserId}
        ></LoginPanel>
      ) : login ? (
        <LoginPanel
          handleLogin={handleLogin}
          setChosenProfiles={props.setChosenProfiles}
          userId={props.userId}
          setUserId={props.setUserId}
        ></LoginPanel>
      ) : (
        <>
          <div className="animation-container">
            <script
              src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs"
              type="module"
            ></script>
            <Player
              src="https://lottie.host/be856f9f-1f5a-4547-b753-fe1277ccd205/WV6ST8dhed.json"
              background="transparent"
              speed={0.75}
              style={{ width: "50%", height: "50%" }}
              loop
              controls
              autoplay
            >
              <Controls visible={false} />
            </Player>
          </div>
          <div className="animation2-container">
            <script
              src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs"
              type="module"
            ></script>
            <Player
              src="https://lottie.host/08687337-9aa4-42d9-8a3d-f855b2350a2f/j7lwbUynui.json"
              background="transparent"
              speed={0.75}
              style={{ width: "100%", height: "100%" }}
              loop
              controls
              autoplay
            >
              <Controls visible={false} />
            </Player>
          </div>
          <div className="buttons-container">
            <button className="landing-btn u-pointer" onClick={() => setLogin(true)}>
              login
            </button>
            <button className="landing-btn u-pointer" onClick={() => setCreate(true)}>
              sign up
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Homepage;
