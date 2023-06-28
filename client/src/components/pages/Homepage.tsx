import React from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
  CredentialResponse,
} from "@react-oauth/google";

// import linkedinLogin from "../../../../server/auth"

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
    <div className="u-flexColumn u-flex-alignCenter">
      <h1>in progress...</h1>
      <ul>
        <li>Add a favicon to your website at the path client/dist/favicon.ico</li>
        <li>Update website title in client/dist/index.html</li>
      </ul>
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
