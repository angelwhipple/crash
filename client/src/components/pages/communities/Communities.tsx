import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { io } from "socket.io-client";
import { get, post } from "../../../utilities";
import { Link, RouteComponentProps, useNavigate } from "@reach/router";
import "./Communities.css";
import "../../modules/accounts/CreateAccount.css";
import "../../modules/LoginPanel.css";
import "../../modules/NavBar.css";
import { TbPlayerTrackNextFilled } from "react-icons/tb";
import { FaBackward } from "react-icons/fa";
import Invite from "../../modules/communities/Invite";
import Community from "../../../../../shared/Community";
import CommunityMenu from "../../modules/communities/CommunityMenu";
import CommunityDetails from "./Details";
import ManageCommunity from "./Manage";
import Explore from "./Explore";
import Annoucements from "./Annoucements";

type Props = RouteComponentProps & {
  userId: string;
  setUserId: any;
};

enum CommunityType {
  "UNIVERSITY",
  "WORKPLACE",
  "LIVING",
  "LOCAL",
}

enum MenuAction {
  "DETAILS", // view/edit community details
  "MANAGE", // manage members/admin, settings, etc (ADMIN/OWNER ONLY)
  "ANNOUCEMENTS", // view/post community-wide announcements (post ADMIN ONLY)
  "EXPLORE", // community feed, see recent posts & updates
  "TOGGLE", // switch between communities
}

const Communities = (props: Props) => {
  const [landing, setLanding] = useState(true);
  const [communities, setCommunties] = useState<Array<Community>>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | undefined>(undefined);
  const [communityType, setType] = useState<CommunityType | undefined>(undefined);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [joining, setJoining] = useState(false);
  const [menuAction, setMenuAction] = useState<MenuAction | undefined>(undefined);

  const navigate = useNavigate();
  const route = (path) => {
    navigate(path);
  };

  socket.on("verified", (event) => {
    console.log(event);
    setVerifying(false);
    setVerified(true);
  });

  socket.on("new community", (event) => {});

  socket.on("joined community", async (event) => {
    if (event.communityId === activeCommunity?._id) {
      await get("/api/community/fetch", { communityId: activeCommunity?._id }).then((res) => {
        console.log(`Refreshed community: ${JSON.stringify(res)}`);
        setActiveCommunity(res.community); // refresh state of active community object
      });
    }
  });

  useEffect(() => {
    if (props.userId) {
      get("/api/user/communities", { id: props.userId }).then((res) => {
        if (res.valid) {
          setCommunties(res.communities);
          setActiveCommunity(res.communities[res.communities.length - 1]);
        }
      });
      get("/api/user/fetch", { id: props.userId }).then((res) => {
        if (res.valid && res.user.verified === true) {
          setVerified(true);
        }
      });
    }
    setMenuAction(MenuAction.EXPLORE);
  }, []);

  const createCommunity = async (nameInput) => {
    const body = {
      userId: props.userId,
      communityName: nameInput.value,
      communityType: communityType,
      userVerified: verified,
    };
    nameInput.value = "";
    post("/api/community/create", body).then((community: Community) => {
      setCommunties((prev) => [...prev, community]);
      setActiveCommunity(community);
      setShowInvite(true);
    });
  };

  const joinCommunity = async (codeInput) => {
    const body = {
      code: codeInput.value,
      userId: props.userId,
    };
    codeInput.value = "";
    post("/api/community/join", body).then((res) => {
      if (res.valid) {
        setCommunties((prev) => [...prev, res.community]);
        setActiveCommunity(res.community);
        setJoining(false);
      } else {
        console.log("Bad join code"); // TODO: display error msg
      }
    });
  };

  const verification = async (emailInput) => {
    get("/api/user/fetch", { id: props.userId }).then((res) => {
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
            HtmlPart: `<a href="http://localhost:5050/api/user/verified?id=${props.userId}">Click here to confirm your email address</a>`,
          },
        ],
      };

      post("/api/user/verification", { messages: messages });
    });
  };

  return (
    <>
      {props.userId !== undefined ? (
        <div className="sidebar-split">
          <CommunityMenu
            userId={props.userId}
            menuAction={menuAction}
            setMenuAction={setMenuAction}
            setUserId={props.setUserId}
          ></CommunityMenu>
        </div>
      ) : (
        <></>
      )}
      <div className="mainpage-split">
        {props.userId === undefined ? (
          <div className="centered default-container">
            <h3>Login to see this page</h3>
            <button
              className="default-button u-pointer"
              onClick={(event) => {
                socket.emit("nav toggle all", {});
                route("/");
              }}
            >
              Take me back
            </button>
          </div>
        ) : activeCommunity && showInvite ? (
          <Invite newCommunity={activeCommunity} setShowInvite={setShowInvite}></Invite>
        ) : activeCommunity && (menuAction === undefined || menuAction === MenuAction.EXPLORE) ? (
          <Explore activeCommunity={activeCommunity}></Explore>
        ) : activeCommunity && menuAction === MenuAction.DETAILS ? (
          <CommunityDetails
            userId={props.userId}
            activeCommunity={activeCommunity}
          ></CommunityDetails>
        ) : activeCommunity && menuAction === MenuAction.MANAGE ? (
          <ManageCommunity activeCommunity={activeCommunity}></ManageCommunity>
        ) : activeCommunity && menuAction === MenuAction.ANNOUCEMENTS ? (
          <Annoucements activeCommunity={activeCommunity}></Annoucements>
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
            <button
              className="login-button u-pointer"
              onClick={(event) => {
                setLanding(false);
                setJoining(true);
              }}
            >
              Join your first community
            </button>
          </div>
        ) : joining === true && props.userId ? (
          <div className="centered default-container">
            <div className="u-flex">
              <label className="create-label">
                Invitation code
                <input
                  id="inv_code"
                  type="text"
                  className="create-input"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      const codeInput = document.getElementById("inv_code")! as HTMLInputElement;
                      joinCommunity(codeInput);
                    }
                  }}
                ></input>
              </label>
              <TbPlayerTrackNextFilled
                className="nav-icon u-pointer"
                onClick={(event) => {
                  const codeInput = document.getElementById("inv_code")! as HTMLInputElement;
                  joinCommunity(codeInput);
                }}
              ></TbPlayerTrackNextFilled>
            </div>
            <FaBackward
              className="nav-icon back-button u-pointer"
              onClick={(event) => {
                setJoining(false);
                setLanding(true);
              }}
            ></FaBackward>
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
            <FaBackward
              className="nav-icon back-button u-pointer"
              onClick={(event) => setLanding(true)}
            ></FaBackward>
          </div>
        ) : communityType !== undefined && props.userId && verifying === true ? (
          <div className="centered default-container">
            <h3>
              Enter your {communityType === CommunityType.WORKPLACE ? "work" : "school"} email
              address for verification
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
            <FaBackward
              className="nav-icon back-button u-pointer"
              onClick={(event) => setType(undefined)}
            ></FaBackward>
          </div>
        ) : (props.userId &&
            (communityType == CommunityType.UNIVERSITY ||
              communityType == CommunityType.WORKPLACE) &&
            verified === true) ||
          communityType == CommunityType.LIVING ||
          communityType == CommunityType.LOCAL ? (
          <div className="centered default-container">
            <div className="u-flex">
              <label className="create-label">
                Community name
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
            <FaBackward
              className="nav-icon back-button u-pointer"
              onClick={(event) => setType(undefined)}
            ></FaBackward>
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default Communities;
