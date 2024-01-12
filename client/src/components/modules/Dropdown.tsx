import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./Dropdown.css";

type Props = RouteComponentProps & {
  options: string[];
  setter: any;
};

const Dropdown = (props: Props) => {
  const [buttons, setButtons] = useState<any[]>();

  useEffect(() => {
    const tempButtons: any[] = [];
    for (const option of props.options) {
      tempButtons.push(
        <button
          className="dropdown-button"
          onClick={() => {
            props.setter(option);
            const dropdown = document.getElementById("dropdown-content") as HTMLElement;
            dropdown.style.display = "none";
          }}
        >
          {option}
        </button>
      );
    }
    setButtons(tempButtons);
  }, []);

  return (
    <div id="dropdown-content" className="dropdown-content">
      {buttons}
    </div>
  );
};

export default Dropdown;
