import React, { useState, useEffect, ReactElement } from "react";
import { navigate, Router } from "@reach/router";
import jwt_decode from "jwt-decode";
import { CredentialResponse } from "@react-oauth/google";

import { get, post } from "../utilities";
import NotFound from "./pages/NotFound";
import { socket, onSocketConnect } from "../client-socket";
import User from "../../../shared/User";
import "../utilities.css";
import "./pages/Homepage.css";
import Homepage from "./pages/Homepage";
import NavBar from "../components/modules/NavBar";
import Profile from "./pages/Profile";
import Communities from "./pages/communities/Communities";
import Housing from "./pages/Housing";
import ProfilePill from "./modules/accounts/ProfilePill";
import Verified from "./pages/throwaway/Verified";
import Joined from "./pages/throwaway/Joined";
import Report from "./modules/modals/ReportIssue";

const PLATFORMS = {
  linkedin: "linkedinid",
  google: "googleid",
  fb: "facebookid",
  origin: "originid",
};

const App = () => {
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [consolidate, setConsolidate] = useState(false);
  const [extraProfiles, setExtraProfiles]: any[] = useState([]);
  const [chosenProfiles, setChosenProfiles]: any[] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [invited, setInvited] = useState(false);

  socket.on("linkedin", async (event) => {
    console.log(`Linkedin login success`);
    setUserId(event.user._id);
    post("/api/initsocket", { socketid: socket.id });
    handleConsolidate(event);
  });

  socket.on("origin", async (event) => {
    console.log(`Crash login success`);
    setUserId(event.user._id);
    post("/api/initsocket", { socketid: socket.id });
    handleConsolidate(event);
  });

  const redirect = (path) => navigate(path);

  const handleLogin = (credentialResponse: CredentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken as string) as {
      name: string;
      email: string;
    };
    console.log(`Logged in as ${decodedCredential.name}`);
    console.log(`Email address: ${decodedCredential.email}`);
    post("/api/login", {
      token: userToken,
    }).then(async (response) => {
      console.log(`Google login success`);
      setUserId(response.user._id);
      post("/api/initsocket", { socketid: socket.id }).then(() => {
        socket.emit("login success");
      });
      handleConsolidate(response);
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
  };

  const loginJoinCommunity = () => {
    if (invited) {
      const body = {
        code: joinCode,
        userId: userId,
      };
      console.log(`Join community body: ${JSON.stringify(body)}`);
      post("/api/community/join", body).then((res) => {
        redirect("/communities");
      });
    }
  };

  const generatePills = (profiles: Array<JSON>) => {
    const pills = profiles.map((profile, index) => (
      <ProfilePill
        profile={profile}
        key={index}
        chosenProfiles={chosenProfiles}
        setChosenProfiles={setChosenProfiles}
      ></ProfilePill>
    ));
    return pills;
  };

  const handleConsolidate = (event) => {
    if (event.consolidate.eligible) {
      setExtraProfiles(generatePills(event.consolidate.profiles));
      setConsolidate(true);
    }
  };

  useEffect(() => {
    if (socketConnected) {
      console.log(`Socket is connected!`);
      console.log("Socket ID:", socket.id);
    }
  }, [socketConnected]);

  useEffect(() => {
    loginJoinCommunity();
  }, [userId]);

  useEffect(() => {
    setSocketConnected(socket.connected);
    const handleConnect = () => {
      setSocketConnected(true);
    };
    onSocketConnect(handleConnect);

    get("/api/whoami")
      .then((user: User) => {
        if (user._id) {
          // They are registed in the database and currently logged in.
          setUserId(user._id);
        }
      })
      .then(() =>
        socket.on("connect", () => {
          post("/api/initsocket", { socketid: socket.id });
        })
      );
  }, []);

  // NOTE:
  // All the pages need to have the props extended via RouteComponentProps for @reach/router to work properly. Please use the Homepage as an example.
  return (
    <div className="background">
      <Router primary={false}>
        <NavBar default userId={userId!} setUserId={setUserId}></NavBar>
      </Router>
      <Router>
        <Homepage
          path="/"
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          consolidate={consolidate}
          extraProfiles={extraProfiles}
          chosenProfiles={chosenProfiles}
          setChosenProfiles={setChosenProfiles}
          userId={userId}
          setUserId={setUserId}
          setConsolidate={setConsolidate}
          setInvited={setInvited}
          setJoinCode={setJoinCode}
        />
        <Profile path="/profile" userId={userId!}></Profile>
        <Communities path="/communities" userId={userId!} setUserId={setUserId}></Communities>
        <Housing path="/housing"></Housing>
        <Verified path="/verified"></Verified>
        <Joined path="/joined"></Joined>
        <NotFound default={true} />
      </Router>
      <Report></Report>
    </div>
  );
};

export default App;
