import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import Community from "../../../../../shared/Community";
import "./Details.css";
import { IoMdCloudUpload } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import Member from "../../modules/communities/MemberEntry";
import EditDescription from "../../modules/communities/EditDescription";

type Props = RouteComponentProps & {
  userId: string;
  activeCommunity: Community;
};

const CommunityDetails = (props: Props) => {
  const [showRules, setShowRules] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [showMedia, setShowMedia] = useState(false);
  const [members, setMembers] = useState<Array<JSX.Element>>([]);
  const [img, setImg] = useState("");
  const [description, setDescription] = useState("");
  const [editDes, setEditDes] = useState(false);

  const toggle = (selectorFn: any) => {
    for (const selFn of [setShowRules, setShowMembers, setShowMedia]) {
      if (selFn !== selectorFn) selFn(false);
    }
    selectorFn(true);
  };

  const uploadPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("communityId", props.activeCommunity._id);

    fetch("/api/community/updatephoto", { method: "POST", body: formData }).then(async (res) => {
      const data = await res.json();
      console.log(`S3 Image url: ${data.url}`);
    });
  };

  const updatePhoto = async (imageBuffer: ArrayBuffer) => {
    const base64Image = btoa(
      new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    const src = `data:image/jpeg;base64,${base64Image}`;
    setImg(src);
  };

  socket.on("community photo", (event) => {
    const buffer = event.image;
    updatePhoto(buffer);
  });

  socket.on("community description", (event) => {
    setDescription(event.description);
  });

  useEffect(() => {
    populateUsers();
    if (props.activeCommunity.description !== undefined) {
      setDescription(props.activeCommunity.description.toString());
    } else setDescription(`Add a description`);
    get("/api/community/loadphoto", { communityId: props.activeCommunity._id }).then((res) => {
      if (res.valid) {
        const buffer = res.buffer.Body.data;
        updatePhoto(buffer);
      } else {
        // default community photo
      }
    });
  }, []);

  useEffect(() => {
    populateUsers();
  }, [props.activeCommunity]);

  const populateUsers = async (): Promise<void> => {
    const memberProfiles: JSX.Element[] = [];
    for (const memberId of props.activeCommunity.members) {
      await get("/api/user/fetch", { id: memberId }).then((res) => {
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
          <img className="community-img" src={img}></img>
          {props.userId === props.activeCommunity.owner ? (
            <label className="update-container">
              <input
                type="file"
                name="photo"
                onChange={async (event) => {
                  if (event.target.files && event.target.files[0]) {
                    const file = event.target.files[0];
                    event.target.value = "";
                    await uploadPhoto(file);
                  }
                }}
              ></input>
              <IoMdCloudUpload className="gradient-icon u-pointer"></IoMdCloudUpload>
              <p className="update-label">Upload photo </p>
            </label>
          ) : (
            <></>
          )}
        </div>
        <div className="u-flexColumn u-alignCenter">
          <h2>{props.activeCommunity.name}</h2>
          <p>{description}</p>
          {props.userId === props.activeCommunity.owner ? (
            <label className="update-container">
              <FaEdit
                className="gradient-icon u-pointer"
                onClick={(event) => {
                  setEditDes(true);
                }}
              ></FaEdit>
              Edit description
            </label>
          ) : (
            <></>
          )}
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
      {editDes ? (
        <EditDescription
          setEditDes={setEditDes}
          communityId={props.activeCommunity._id}
        ></EditDescription>
      ) : (
        <></>
      )}
    </div>
  );
};

export default CommunityDetails;
