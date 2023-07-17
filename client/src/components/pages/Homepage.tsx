import React from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
  CredentialResponse,
} from "@react-oauth/google";

import "./Homepage.css";
import { RouteComponentProps } from "@reach/router";
import LoginPanel from "../modules/LoginPanel";

type Props = RouteComponentProps & {
  userId?: string;
  handleLogin: (credentialResponse: CredentialResponse) => void;
  handleLogout: () => void;
};
const Homepage = (props: Props) => {
  const { handleLogin, handleLogout } = props;

  return (
    <div className="u-flexColumn u-alignCenter">
      {/* <h1>The solution to your corporate housing needs</h1> */}
      {/* <ul>
        <li>Add a favicon to your website at the path client/dist/favicon.ico</li>
      </ul> */}
      <LoginPanel
        handleLogin={handleLogin}
        googleLogout={googleLogout}
        handleLogout={handleLogout}
        userId={props.userId}
      ></LoginPanel>
    </div>
  );
};

export default Homepage;
