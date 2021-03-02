import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import { useHistory } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";

import HostBase from "./HostBase";
import { useAuth } from "../contexts/AuthContext";

const HostAccountPage = () => {
  const { currentUser, logout } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const history = useHistory();

  const handleLogout = async () => {
    try {
      await logout();
      history.push("/");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <HostBase>
      {currentUser && (
        <Grid item xs={12}>
          <Container maxWidth="lg">
            <Typography variant="body2">
              <strong>Referral Code:</strong>
              <input readOnly={true} value={currentUser.referralCode} />
              <CopyToClipboard
                text={currentUser.referralCode}
                onCopy={() => setCopiedCode(true)}
              >
                <button>copy</button>
              </CopyToClipboard>
            </Typography>
            <button onClick={handleLogout}>Logout</button>
          </Container>
        </Grid>
      )}
    </HostBase>
  );
};

export default HostAccountPage;
