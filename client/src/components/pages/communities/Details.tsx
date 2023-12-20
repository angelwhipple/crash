import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import Community from "../../../../../shared/Community";
import "./Details.css";
import { IoMdCloudUpload } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import Member from "../../modules/communities/MemberEntry";

type Props = RouteComponentProps & {
  userId: string;
  activeCommunity: Community;
};

const CommunityDetails = (props: Props) => {
  const [showRules, setShowRules] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [showMedia, setShowMedia] = useState(false);
  const [members, setMembers] = useState<Array<JSX.Element>>([]);

  const toggle = (selectorFn: any) => {
    for (const selFn of [setShowRules, setShowMembers, setShowMedia]) {
      if (selFn !== selectorFn) selFn(false);
    }
    selectorFn(true);
  };

  const uploadPhoto = async (event) => {
    const fileInput = document.getElementById("photo") as HTMLInputElement;
    const file = fileInput.files![0];
    fileInput.value = "";

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("communityId", props.activeCommunity._id);

    fetch("/api/communityphoto", { method: "POST", body: formData }).then(async (res) => {
      const data = await res.json();
      console.log(`S3 Image url: ${data.url}`);
    });
  };

  useEffect(() => {
    populateUsers();
  }, []);

  useEffect(() => {
    populateUsers();
  }, [props.activeCommunity]);

  const populateUsers = async (): Promise<void> => {
    const memberProfiles: JSX.Element[] = [];
    for (const memberId of props.activeCommunity.members) {
      await get("/api/getuser", { id: memberId }).then((res) => {
        const member = (
          <Member key={res.user._id} user={res.user} community={props.activeCommunity}></Member>
        );
        memberProfiles.push(member);
      });
    }
    setMembers(memberProfiles);
  };

  // socket.on("joined community", (event) => {
  //   console.log(event);
  //   if (event.communityId === props.activeCommunity._id) {
  //     const newMember = <Member key={event.user._id} user={event.user}></Member>;
  //     setMembers((prev) => [...prev, newMember]);
  //   }
  // });

  return (
    <div className="page-container">
      <div className="community-header">
        <div className="u-flexColumn u-alignCenter">
          <div className="community-img">IMG</div>
          {props.userId === props.activeCommunity.owner ? (
            <div className="u-flex">
              <input id="photo" type="file" name="photo"></input>
              <IoMdCloudUpload
                className="gradient-icon u-pointer"
                onClick={uploadPhoto}
              ></IoMdCloudUpload>
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className="u-flexColumn u-alignCenter">
          <h2>{props.activeCommunity.name}</h2>
          <div className="u-flex u-alignCenter">
            {props.userId === props.activeCommunity.owner ? (
              <FaEdit className="gradient-icon u-pointer"></FaEdit>
            ) : (
              <></>
            )}
            <p>Description</p>
          </div>
        </div>
        <p>{props.activeCommunity.members.length} members</p>
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
        <></>
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
        <></>
      ) : (
        <></>
      )}
    </div>
  );
};

export default CommunityDetails;
