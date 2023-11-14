import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { io } from "socket.io-client";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./Communities.css";
import "../modules/LoginPanel.css";

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
  const [communityType, setType] = useState<CommunityType>();
  const [create, setCreate] = useState(false);
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
    const sender = { email: "awhipp@mit.edu", name: "Crash MIT" }; // registered e-mail with Mailjet API
    const toEmail = emailInput.value;
    emailInput.value = "";
    console.log(`From: ${sender.email}, To: ${toEmail}`);

    const content = "This message contains no content"; // TODO: verification link as msg content
    const messages = {
      Messages: [
        {
          From: { Email: sender.email, Name: sender.name }, // single sender object
          To: [{ Email: toEmail, Name: "Dummy" }], // list of sendee objects
          Subject: "Verify your e-mail with Crash",
          TextPart: content,
        },
      ],
    };

    post("/api/userverification", { messages: messages });
  };

  return (
    <>
      <div className="sidebar-split"></div>
      <div className="mainpage-split"></div>

      {create === true && verify !== true ? (
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
      ) : create === true && verify === true ? (
        <div className="centered default-container">
          <h3>
            Enter your {communityType === CommunityType.WORKPLACE ? "work" : "school"} email address
            for verification:
          </h3>
          <input
            id="email"
            type="email"
            className="input"
            onKeyDown={(event) => {
              if (event.key == "Enter") {
                // window.open("mailto:awhipp@mit.edu?subject=test&body=send%20an%20email");
                const emailInput = document.getElementById("email")! as HTMLInputElement;
                verification(emailInput);
              }
            }}
          ></input>
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
          <button
            className="login-button u-pointer"
            onClick={(event) => {
              setCreate(true);
            }}
          >
            Create a community
          </button>
          <button className="login-button u-pointer">Join your first community</button>
        </div>
      )}
    </>
  );
};

export default Communities;
