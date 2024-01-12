import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./InfoModal.css";

type Props = RouteComponentProps & {
  header: string;
  info: any;
  setDisplay: any;
  setAltDisplay?: any;
};

const InfoModal = (props: Props) => {
  const [htmlContent, setHtmlContent] = useState<any>();
  useEffect(() => {
    setHtmlContent({ __html: props.info });
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h4>{props.header}</h4>
          <div className="info-textbox" dangerouslySetInnerHTML={htmlContent}></div>
          <button
            className="default-button u-pointer"
            onClick={(event) => {
              props.setDisplay({ show: false });
              if (props.setAltDisplay) props.setAltDisplay(true);
              if (props.header === "Crash Privacy Policy") socket.emit("privacy policy");
              if (props.header === "Crash Terms of Service") socket.emit("terms of service");
            }}
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
