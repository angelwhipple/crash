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
import UserModel from "../../../../server/models/User";

type Props = RouteComponentProps & {
  userId: string;
};

enum CommunityType {
  "UNIVERSITY",
  "WORKPLACE",
  "LIVING",
  "LOCAL",
}

const Communities = (props) => {
  const [landing, setLanding] = useState(true);
  const [communties, setCommunties] = useState([]);
  const [communityType, setType] = useState<CommunityType | undefined>(undefined);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };

  socket.on("verified", (event) => {
    console.log(event);
    setVerifying(false);
    setVerified(true);
  });

  socket.on("new community", (event) => {
    console.log(event);
    get("/api/communities", { id: props.userId }).then((res) => {
      if (res.valid) setCommunties(res.communities);
    });
  });

  useEffect(() => {
    if (props.userId) {
      get("/api/communities", { id: props.userId }).then((res) => {
        if (res.valid) setCommunties(res.communities);
      });
      get("/api/getuser", { id: props.userId }).then((res) => {
        if (res.valid && res.user.verified === true) {
          setVerified(true);
        }
      });
    }
  }, []);

  const createCommunity = async (nameInput) => {
    const body = {
      userId: props.userId,
      communityName: nameInput.value,
      communityType: communityType,
      userVerified: verified,
    };
    nameInput.value = "";
    post("/api/createcommunity", body).then((community) => {});
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

      const messages = {
        Messages: [
          {
            From: { Email: sender.email, Name: sender.name }, // single sender object
            To: [{ Email: sendee.email, Name: sendee.name }], // list of sendee objects
            Subject: "Verify your e-mail with Crash",
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

      {props.userId === undefined || communties.length > 0 ? (
        <div className="centered default-container">
          <h3>New content soon...</h3>
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
      ) : landing === true && props.userId ? (
        <div className="centered default-container">
          <h3>You aren't a member of any communities yet.</h3>
          <button
            className="login-button u-pointer"
            onClick={(event) => {
              setLanding(false);
            }}
          >
            Create a community
          </button>
          <button className="login-button u-pointer">Join your first community</button>
        </div>
      ) : communityType === undefined && props.userId ? (
        <div className="centered default-container">
          <h3>What type of community is this?</h3>
          <button
            onClick={(event) => {
              setType((prev) => CommunityType.UNIVERSITY);
              if (!verified) setVerifying(true);
            }}
            className="login-button u-pointer"
          >
            College/university
          </button>
          <button
            onClick={(event) => {
              setType((prev) => CommunityType.WORKPLACE);
              if (!verified) setVerifying(true);
            }}
            className="login-button u-pointer"
          >
            Workplace
          </button>
          <button
            onClick={(event) => {
              setType((prev) => CommunityType.LIVING);
            }}
            className="login-button u-pointer"
          >
            Living group
          </button>
          <button
            onClick={(event) => {
              setType((prev) => CommunityType.LOCAL);
            }}
            className="login-button u-pointer"
          >
            Locality
          </button>
        </div>
      ) : communityType !== undefined && props.userId && verifying === true ? (
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
              onClick={(event) => {
                const emailInput = document.getElementById("email")! as HTMLInputElement;
                verification(emailInput);
              }}
            ></TbPlayerTrackNextFilled>
          </div>
        </div>
      ) : (props.userId &&
          (communityType == CommunityType.UNIVERSITY || communityType == CommunityType.WORKPLACE) &&
          verified === true) ||
        communityType == CommunityType.LIVING ||
        communityType == CommunityType.LOCAL ? (
        <div className="centered default-container">
          <div className="u-flex">
            <label className="create-label">
              Community name:
              <input
                id="community_name"
                className="create-input"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    const nameInput = document.getElementById(
                      "community_name"
                    )! as HTMLInputElement;
                    createCommunity(nameInput);
                  }
                }}
              ></input>
            </label>
            <TbPlayerTrackNextFilled
              className="nav-icon u-pointer"
              onClick={(event) => {
                const nameInput = document.getElementById("community_name")! as HTMLInputElement;
                createCommunity(nameInput);
              }}
            ></TbPlayerTrackNextFilled>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default Communities;
