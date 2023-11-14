import React, { useState, useEffect, ReactElement } from "react";
import { Router, useNavigate } from "@reach/router";
import jwt_decode from "jwt-decode";
import { CredentialResponse } from "@react-oauth/google";

import { get, post } from "../utilities";
import NotFound from "./pages/NotFound";
import { socket } from "../client-socket";
import User from "../../../shared/User";
import Community from "../../../shared/Community";
import "../utilities.css";
import "./pages/Homepage.css";
import Homepage from "./pages/Homepage";
import NavBar from "../components/modules/NavBar";
import Profile from "./pages/Profile";
import Communities from "./pages/Communities";
import Housing from "./pages/Housing";
import ProfilePill from "./modules/ProfilePill";

const PLATFORMS = {
  linkedin: "linkedinid",
  google: "googleid",
  fb: "facebookid",
  origin: "originid",
};

const App = () => {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [consolidate, setConsolidate] = useState(false);
  const [extraProfiles, setExtraProfiles]: any[] = useState([]);
  const [chosenProfiles, setChosenProfiles]: any[] = useState([]);

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

  socket.on("linkedin", async (event) => {
    console.log(`Linkedin login socket emission: ${JSON.stringify(event)}`);
    setUserId(event.user._id);
    post("/api/initsocket", { socketid: socket.id });

    if (event.consolidate.eligible) {
      setExtraProfiles(generatePills(event.consolidate.profiles));
      setConsolidate(true);
    }
  });

  socket.on("origin", async (event) => {
    console.log(`Origin login socket emission: ${JSON.stringify(event)}`);
    setUserId(event.user._id);
    post("/api/initsocket", { socketid: socket.id });
    if (event.consolidate.eligible) {
      setExtraProfiles(generatePills(event.consolidate.profiles));
      setConsolidate(true);
    }
  });

  useEffect(() => {
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
    }).then((response) => {
      setUserId(response.user._id);
      // setChosenProfiles([PLATFORMS.google]);
      console.log(`Chosen profiles: ${chosenProfiles}`);
      post("/api/initsocket", { socketid: socket.id });

      console.log(`Google login response: ${JSON.stringify(response)}`);
      if (response.consolidate.eligible) {
        setExtraProfiles(generatePills(response.consolidate.profiles));
        setConsolidate(true);
      }
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
  };
  // NOTE:
  // All the pages need to have the props extended via RouteComponentProps for @reach/router to work properly. Please use the Homepage as an example.
  return (
    <div className="background">
      <Router primary={false}>
        <NavBar default userId={userId}></NavBar>
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
        />
        <Profile path="/profile" userId={userId}></Profile>
        <Communities path="/communities" userId={userId}></Communities>
        <Housing path="/housing"></Housing>
        <NotFound default={true} />
      </Router>
    </div>
  );
};

export default App;
