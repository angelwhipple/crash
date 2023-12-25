import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./Modal.css";
import "./FiltersModal.css";
import { SearchFilters, FILTERS_TO_IDS } from "./types";

type Props = RouteComponentProps & {
  setFiltering: any;
  setQuerying: any;
  filter: SearchFilters;
  setFilter: any;
};

const Filters = (props: Props) => {
  const [selected, setSelected] = useState<SearchFilters>(props.filter);

  const toggle = (label: SearchFilters) => {
    const selected = FILTERS_TO_IDS[label];
    for (const filter of Object.keys(FILTERS_TO_IDS)) {
      const elemId = FILTERS_TO_IDS[filter];
      const elem = document.getElementById(elemId) as HTMLInputElement;
      if (elemId === selected) {
        elem.checked = true;
        setSelected(label);
      } else elem.checked = false;
    }
  };

  useEffect(() => {
    toggle(props.filter);
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h4>Advanced search</h4>
          <div className="filter-container">
            <label>
              <input
                id="all"
                type="checkbox"
                onClick={(event) => {
                  toggle(SearchFilters.ALL);
                }}
              ></input>
              <p>All</p>
            </label>
            <label>
              <input
                id="users"
                type="checkbox"
                onClick={(event) => {
                  toggle(SearchFilters.USERS);
                }}
              ></input>
              <p>Users</p>
            </label>
            <label>
              <input
                id="communities"
                type="checkbox"
                onClick={(event) => {
                  toggle(SearchFilters.COMMUNITIES);
                }}
              ></input>
              <p>Communities</p>
            </label>
          </div>
          <div className="action-container">
            <button
              className="default-button u-pointer"
              onClick={(event) => {
                props.setFilter(selected);
                props.setFiltering(false);
              }}
            >
              apply filter
            </button>
            <button
              onClick={(event) => {
                props.setFiltering(false);
                props.setQuerying(true);
              }}
              className="default-button u-pointer"
            >
              close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
