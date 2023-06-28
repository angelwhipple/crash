import React from "react";

import { RouteComponentProps } from "@reach/router";

type NotFoundProps = RouteComponentProps;

const NotFound = (props: NotFoundProps) => {
  return (
    <div>
      <h1>The page you are looking for doesn't exist.</h1>
    </div>
  );
};

export default NotFound;
