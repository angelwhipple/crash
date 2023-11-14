import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { io } from "socket.io-client";
import { get, post } from "../../utilities";
import { Link, RouteComponentProps, useNavigate } from "@reach/router";
import "./Communities.css";
import "../modules/CreateAccount.css";
import "../modules/LoginPanel.css";
import "../modules/NavBar.css";
import { TbPlayerTrackNextFilled } from "react-icons/tb";

type Props = RouteComponentProps & {
  userId: string | undefined;
};

enum CommunityType {
  "UNIVERSITY",
  "WORKPLACE",
  "LIVING",
  "LOCAL",
}

const Communities = (props: Props) => {
  const [communties, setCommunties] = useState([]);
  const [communityType, setType] = useState<CommunityType | undefined>(undefined);
  const [verify, setVerify] = useState(false);

  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };

  useEffect(() => {
    getCommunities();
  }, []);

  const getCommunities = () => {
    get("/api/communities", { id: props.userId }).then((res) => {
      if (res.valid) setCommunties(res.communities);
    });
  };

  const verification = async (emailInput) => {
    get("/api/getuser", { id: props.userId }).then((res) => {
      const sender = { email: "awhipp@mit.edu", name: "Crash MIT" }; // registered e-mail with Mailjet API
      const sendee = {
        email: emailInput.value,
        name: res.user.name !== null ? res.user.name : res.user.username,
      };
      emailInput.value = "";
      console.log(`From: ${sender.email}, To: ${sendee.email}`);

      // TODO: setup /api/verified route
      // update verification status, route to throwaway verified page

      const messages = {
        Messages: [
          {
            From: { Email: sender.email, Name: sender.name }, // single sender object
            To: [{ Email: sendee.email, Name: sendee.name }], // list of sendee objects
            Subject: "Verify your e-mail with Crash",
            TextPart: `Click here to confirm your email address`,
            HtmlPart: `<a href="http://localhost:5050/api/verified?id=${props.userId}">Click here to confirm your email address</a>`,
          },
        ],
      };

      post("/api/userverification", { messages: messages });
    });
  };

  return (
    <>
      <div className="sidebar-split"></div>
      <div className="mainpage-split"></div>

      {communityType === undefined ? (
        <div className="centered default-container">
          <h3>What type of community is this?</h3>
          <button
            onClick={(event) => {
              setType(CommunityType.UNIVERSITY);
              setVerify(true);
            }}
            className="login-button u-pointer"
          >
            College/university
          </button>
          <button
            onClick={(event) => {
              setType(CommunityType.WORKPLACE);
              setVerify(true);
            }}
            className="login-button u-pointer"
          >
            Workplace
          </button>
          <button
            onClick={(event) => {
              setType(CommunityType.LIVING);
            }}
            className="login-button u-pointer"
          >
            Living group
          </button>
          <button
            onClick={(event) => {
              setType(CommunityType.LOCAL);
            }}
            className="login-button u-pointer"
          >
            Locality
          </button>
        </div>
      ) : communityType !== undefined && verify === true ? (
        <div className="centered default-container">
          <h3>
            Enter your {communityType === CommunityType.WORKPLACE ? "work" : "school"} email address
            for verification:
          </h3>
          <div className="u-flex">
            <input
              id="email"
              type="email"
              className="input"
              onKeyDown={(event) => {
                if (event.key == "Enter") {
                  const emailInput = document.getElementById("email")! as HTMLInputElement;
                  verification(emailInput);
                }
              }}
            ></input>
            <TbPlayerTrackNextFilled
              className="nav-icon u-pointer"
              onClick={(event) => {}}
            ></TbPlayerTrackNextFilled>
          </div>
        </div>
      ) : communityType !== undefined && verify === false ? (
        <div className="centered-default-container">
          <div className="u-flex">
            <label className="create-label">
              Community name:
              <input id="name" className="create-input"></input>
            </label>
            <TbPlayerTrackNextFilled
              className="nav-icon u-pointer"
              onClick={(event) => {}}
            ></TbPlayerTrackNextFilled>
          </div>
        </div>
      ) : props.userId === undefined || communties.length > 0 ? (
        <div className="centered default-container">
          <h3>Coming soon...</h3>
          <button
            className="login-button u-pointer"
            onClick={(event) => {
              route("/");
              socket.emit("toggleAll", {});
            }}
          >
            Take me back
          </button>
        </div>
      ) : (
        <div className="centered default-container">
          <h3>You aren't a member of any communities yet.</h3>
          <button className="login-button u-pointer" onClick={(event) => {}}>
            Create a community
          </button>
          <button className="login-button u-pointer">Join your first community</button>
        </div>
      )}
    </>
  );
};

export default Communities;
