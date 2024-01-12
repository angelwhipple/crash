import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { io } from "socket.io-client";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./Housing.css";
import { CustomError, TravelQuery } from "../types";
import Ad from "../modules/modals/AdModal";
import { GMAPS_API_KEY } from "../../../../server/auth";
import { Loader } from "@googlemaps/js-api-loader";

type Props = RouteComponentProps & {};

const TODAYS_DATE = new Date(new Date().toLocaleDateString("en", { timeZone: "America/New_York" }))
  .toISOString()
  .slice(0, 10); // get date in format YYYY-MM-DD

const Housing = (props: Props) => {
  const [view, setView] = useState("");
  const [error, setError] = useState<CustomError>({ valid: false });
  const [travelQuery, setTravelQuery] = useState<TravelQuery>();
  const [premiumAd, setPremiumAd] = useState(false);
  const [map, setMap] = useState<any>();

  // @ts-ignore google.maps.plugins
  // const loader = new Loader({
  //   apiKey: GMAPS_API_KEY!,
  //   version: "weekly",
  //   // libraries: ["places", "maps", "streetView"],
  // });

  const initGoogleMaps = () => {
    const mapOptions = {
      center: {
        lat: 37.4708247,
        lng: -121.927533,
      },
      zoom: 10,
    };
    const gmap = document.getElementById("map") as HTMLElement;
    // loader.importLibrary("maps").then(({ Map }) => {
    //   setMap(new Map(gmap, mapOptions));
    // });

    const location = document.getElementById("location") as HTMLInputElement;
    // loader.importLibrary("places").then(({ Autocomplete }) => {
    //   const autocomplete = new Autocomplete(location);
    //   autocomplete.addListener("place_changed", () => {
    //     const place = autocomplete.getPlace();
    //     console.log(place);
    //   });
    // });
  };

  const handleDetails = async () => {
    const location = document.getElementById("location") as HTMLInputElement;
    const startDate = document.getElementById("date_start") as HTMLInputElement;
    const endDate = document.getElementById("date_end") as HTMLInputElement;
    const groupSize = document.getElementById("group_size") as HTMLInputElement;
    let tempError: CustomError = { valid: false };

    // revise to use GMAPs Autocomplete
    if (!location.value) tempError = { valid: true, message: "Please select a valid location" };
    else if (!startDate.value)
      tempError = { valid: true, message: "Please enter a valid start date for travel" };
    else if (!endDate.value)
      tempError = { valid: true, message: "Please enter a valid end date for travel" };
    else if (!groupSize.value || parseInt(groupSize.value) < 1) {
      tempError = { valid: true, message: "Must be traveling with atleast 1 person" };
      groupSize.value = "";
    }

    if (tempError.valid) {
      setError(tempError);
      return;
    } else {
      setTravelQuery({
        location: location.value,
        startDate: startDate.value,
        endDate: endDate.value,
        groupSize: parseInt(groupSize.value),
      });
      location.value = "";
      startDate.value = "";
      endDate.value = "";
      groupSize.value = "";
    }
  };

  useEffect(() => {
    console.log(travelQuery);
    if (travelQuery !== undefined) setPremiumAd(true);
    setError({ valid: false });
  }, [travelQuery, view]);

  useEffect(() => {
    initGoogleMaps();
  }, []);

  return (
    <>
      {premiumAd ? <Ad setDisplay={setPremiumAd}></Ad> : <></>}
      <div className="centered default-container">
        {travelQuery ? (
          <>
            <p>Gather more details: housing arrangements finalized, searching for roommates</p>
            <p>Optional one time roommate preference survey</p>
            <p>Info to collect for unfinalized arrangements: unit type, budget, distance</p>
            <p>For finalized arrangements: property listing information</p>
            <button className="default-button u-pointer" onClick={() => setTravelQuery(undefined)}>
              Go back
            </button>
          </>
        ) : view === "TRAVELER" ? (
          <div className="inputs-container">
            <h4>Share a few details about your upcoming travel</h4>
            <form>
              <label>Destination</label>
              <div className="dates-container">
                <label>
                  From
                  <input id="date_start" type="date" min={TODAYS_DATE}></input>
                </label>
                <label>
                  To
                  <input id="date_end" type="date" min={TODAYS_DATE}></input>
                </label>
              </div>
              <label>
                Number of Travelers
                <input id="group_size" type="number" min="1"></input>
              </label>
            </form>

            {error.valid ? (
              <p className="error-text">{error.message}</p>
            ) : (
              <p className="error-text-hidden">Default</p>
            )}
            <div className="action-container">
              <button
                className="default-button u-pointer"
                onClick={async () => await handleDetails()}
              >
                Next
              </button>
              <button className="default-button u-pointer" onClick={() => setView("")}>
                Go back
              </button>
            </div>
          </div>
        ) : view === "HOST" ? (
          <>
            <h4>Find a subscription plan that meets your needs</h4>
            <button className="default-button u-pointer" onClick={() => setView("")}>
              Go back
            </button>
          </>
        ) : (
          <>
            <p>I am a...</p>
            <button className="default-button u-pointer" onClick={() => setView("HOST")}>
              Host
            </button>
            <button className="default-button u-pointer" onClick={() => setView("TRAVELER")}>
              Traveler
            </button>
            <div id="map" className="map-container"></div>
          </>
        )}
      </div>
    </>
  );
};

export default Housing;
