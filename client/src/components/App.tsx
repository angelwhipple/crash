import React, { useState, useEffect } from "react";
import { Router, useNavigate } from "@reach/router";
import jwt_decode from "jwt-decode";
import { CredentialResponse } from "@react-oauth/google";
// import assert from "assert";

import { get, post } from "../utilities";
import NotFound from "./pages/NotFound";
import { socket } from "../client-socket";
import User from "../../../shared/User";
import "../utilities.css";
import "./pages/Homepage.css";
import Homepage from "./pages/Homepage";
import NavBar from "../components/modules/NavBar";
import Profile from "./pages/Profile";
import Communities from "./pages/Communities";
import Housing from "./pages/Housing";

const App = () => {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [consolidate, setConsolidate] = useState(false);

  socket.on("linkedin", (event) => {
    console.log(`Linkedin login socket emission: ${JSON.stringify(event)}`);
    setUserId(event.user._id);
    post("/api/initsocket", { socketid: socket.id });

    if (event.consolidate) {
      console.log(`Attempting user profile consolidation`);

      // TODO: ask permission (YES/NO) instead of auto-consolidating
      // display "found profiles" popup component
      setConsolidate(true);
      // post("/api/consolidate", { email: event.user.email }).then((response) => {
      //   console.log(`Consolidation response: ${JSON.stringify(response)}`);
      // });
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
      post("/api/initsocket", { socketid: socket.id });

      if (response.consolidate) {
        // TODO: ask permission (YES/NO) instead of auto-consolidating
        // display "found profiles" popup component
        setConsolidate(true);
        // post("/api/consolidate", { email: response.user.email }).then((response) => {
        //   console.log(`Consolidation response: ${JSON.stringify(response)}`);
        // });
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
          userId={userId}
        />
        <Profile path="/profile" userId={userId}></Profile>
        <Communities path="/communities"></Communities>
        <Housing path="/housing"></Housing>
        <NotFound default={true} />
      </Router>
    </div>
  );
};

export default App;
