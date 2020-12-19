import React from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

import { sharedStyles } from "../theme";

const Block = ({ children, ...rest }) => {
  const classes = makeStyles(theme => ({
    ...sharedStyles(theme),
    gridSpacing: {
      marginBottom: theme.spacing(3)
    }
  }))();
  return (
    <Grid className={classes.gridSpacing} {...rest}>
      <Paper className={classes.paper}>
        <div className={classes.root}>{children}</div>
      </Paper>
    </Grid>
  );
};

export default Block;
