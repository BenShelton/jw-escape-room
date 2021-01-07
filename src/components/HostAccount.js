import React from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";

import HostBase from "./HostBase";
import { useAuth } from "../contexts/AuthContext";

const HostAccountPage = () => {
  const { currentUser } = useAuth();

  return (
    <HostBase>
      <Grid item xs={12}>
        <Container maxWidth="lg">
          <Typography variant="body2">
            <strong>Referral Code:</strong> {currentUser.referralCode}
          </Typography>
        </Container>
      </Grid>
    </HostBase>
  );
};

export default HostAccountPage;
