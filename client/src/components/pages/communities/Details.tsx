import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import Community from "../../../../../shared/Community";
import "./Details.css";
import { IoMdCloudUpload } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import Member from "../../modules/communities/MemberEntry";
import EditModal from "../../modules/communities/EditModal";
import { FaGear } from "react-icons/fa6";
import defaultImg from "../../../assets/default-placeholder.png";

type Props = RouteComponentProps & {
  userId: string;
  activeCommunity: Community;
};

const CommunityDetails = (props: Props) => {
  const [showRules, setShowRules] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [showMedia, setShowMedia] = useState(false);
  const [members, setMembers] = useState<Array<JSX.Element>>([]);
  const [img, setImg] = useState(defaultImg);
  const [name, setName] = useState(props.activeCommunity.name);
  const [description, setDescription] = useState(`Describe this community`);
  const [editing, setEditing] = useState(false);

  const toggle = (selectorFn: any) => {
    for (const selFn of [setShowRules, setShowMembers, setShowMedia]) {
      if (selFn !== selectorFn) selFn(false);
    }
    selectorFn(true);
  };

  const updatePhoto = (imageBuffer: ArrayBuffer) => {
    const base64Image = btoa(
      new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    const src = `data:image/jpeg;base64,${base64Image}`;
    setImg(src);
  };

  socket.on("updated community", (event) => {
    if (event.image) {
      const buffer = event.image;
      updatePhoto(buffer);
    }
    if (event.name) setName(event.name);
    if (event.description) setDescription(event.description);
  });

  socket.on("joined community", (event) => {
    console.log(event);
    if (event.communityId === props.activeCommunity._id) {
      get("/api/user/fetch", { userId: event.user }).then((res) => {
        console.log(res);
        if (res.valid) {
          const newMember = (
            <Member
              key={event.user._id}
              user={event.user}
              community={props.activeCommunity}
            ></Member>
          );
          setMembers((prev) => [...prev, newMember]);
        }
      });
    }
  });

  const refreshDetails = async () => {
    setMembers([]);
    populateUsers();
    setImg(defaultImg);
    get("/api/community/loadphoto", { communityId: props.activeCommunity._id }).then((res) => {
      if (res.valid) {
        const buffer = res.buffer.Body.data;
        updatePhoto(buffer);
      }
    });
    setName(props.activeCommunity.name);
    if (props.activeCommunity.description) {
      setDescription(props.activeCommunity.description.toString());
    } else setDescription(`Describe this community`);
  };

  useEffect(() => {
    refreshDetails();
  }, []);

  useEffect(() => {
    refreshDetails();
  }, [props.activeCommunity]);

  const populateUsers = async () => {
    const memberProfiles: JSX.Element[] = [];
    return await get("/api/community/fetch", { communityId: props.activeCommunity._id }).then(
      async (res) => {
        if (res.valid) {
          for (const memberId of res.community.members) {
            await get("/api/user/fetch", { id: memberId }).then(async (res) => {
              const member = (
                <Member
                  key={res.user._id}
                  user={res.user}
                  community={props.activeCommunity}
                ></Member>
              );
              memberProfiles.push(member);
            });
          }
          setMembers(memberProfiles);
        }
      }
    );
  };

  return (
    <div className="page-container">
      <div className="community-header">
        {props.userId === props.activeCommunity.owner ? (
          <FaGear
            className="gear-icon u-pointer"
            onClick={(event) => {
              setEditing(true);
            }}
          ></FaGear>
        ) : (
          <></>
        )}
        <img className="community-img" src={img}></img>
        <div className="community-details">
          <h2>{name}</h2>
          <p>{members.length} members</p>
          <p className="opaque-text">{description}</p>
        </div>
      </div>

      <div className="toggle-container">
        <button className="toggle-link u-pointer" onClick={(event) => toggle(setShowRules)}>
          <p className={`${showRules ? `gradient-text-sel` : `gradient-text`}`}>rules</p>
        </button>
        <button className="toggle-link u-pointer" onClick={(event) => toggle(setShowMembers)}>
          <p className={`${showMembers ? `gradient-text-sel` : `gradient-text`}`}>members</p>
        </button>
        <button className="toggle-link u-pointer" onClick={(event) => toggle(setShowMedia)}>
          <p className={`${showMedia ? `gradient-text-sel` : `gradient-text`}`}>media</p>
        </button>
      </div>

      {showRules ? (
        <div className="rules-view">
          <h4>Community Rules</h4>
          <div className="rules-container">
            <p>1. Treat other Crash users with kindness.</p>
            <p>2. No bullying, harassment, or hate speech is allowed.</p>
            <p>
              3. Only use your real identity. Catfishing and impersonation will be not be tolerated.
            </p>
          </div>
        </div>
      ) : showMembers ? (
        <>
          {members.length > 0 ? (
            <div className="member-view">{members}</div>
          ) : (
            <div className="center">
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
            </div>
          )}
        </>
      ) : showMedia ? (
        <div className="centered-container">No media to display</div>
      ) : (
        <></>
      )}
      {editing ? (
        <EditModal
          name={name}
          decription={description}
          setEditing={setEditing}
          communityId={props.activeCommunity._id}
        ></EditModal>
      ) : (
        <></>
      )}
    </div>
  );
};

export default CommunityDetails;
