import React from "react";
import ReactGA from "react-ga";
import { withRouter } from "react-router-dom";

const AnalyticsTracker = ({ history }) => {
  history.listen(location => {
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);
  });
  return <></>;
};

export default withRouter(AnalyticsTracker);
