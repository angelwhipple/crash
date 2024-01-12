import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket";
import { get, post } from "../../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./Modal.css";
import { MdOutlineReportProblem } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import Dropdown from "../Dropdown";
import "../profile/EditModal.css";

type Props = RouteComponentProps & {};

const Report = (props) => {
  const [display, setDisplay] = useState(false);
  const [category, setCategory] = useState("");

  const CATEGORIES = ["BUG", "ACCOUNTS/LOGIN", "SAFETY", "HARASSMENT"];

  useEffect(() => {
    console.log(`Category changed: ${category}`);
  }, [category]);

  return (
    <>
      {display ? (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-content">
              <p>
                <strong>Report an issue</strong>
              </p>
              <label>
                Category{" "}
                <div className="dropdown-container">
                  <input
                    className="dropdown-input"
                    type="text"
                    value={category}
                    readOnly={true}
                  ></input>
                  <Dropdown options={CATEGORIES} setter={setCategory}></Dropdown>
                </div>
                <FaChevronDown
                  className="default-icon"
                  onClick={() => {
                    const dropdown = document.getElementById("dropdown-content") as HTMLElement;
                    dropdown.style.display = dropdown.style.display === "none" ? "flex" : "none";
                  }}
                ></FaChevronDown>
              </label>
              <label>
                Description <textarea className="multiline-input"></textarea>
              </label>
              <button className="default-button u-pointer" onClick={() => setDisplay(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <MdOutlineReportProblem
            className="report-icon u-pointer"
            onClick={() => setDisplay(true)}
          ></MdOutlineReportProblem>
        </>
      )}
    </>
  );
};

export default Report;
