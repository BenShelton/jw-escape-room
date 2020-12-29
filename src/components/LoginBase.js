import React, { useState, useRef } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";

import Attribution from "./Attribution";

const useStyles = makeStyles(theme => ({
  root: {
    height: "100vh"
  },
  image: {
    backgroundImage:
      "url(https://jwer.brotherapp.org/wp-content/uploads/2020/12/chris-montgomery-smgTvepind4-unsplash-1.jpg)",
    backgroundRepeat: "no-repeat",
    // backgroundColor:
    //   theme.palette.type === "light"
    //     ? theme.palette.grey[50]
    //     : theme.palette.grey[900],
    backgroundSize: "cover",
    backgroundPosition: "right"
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

const LoginBase = ({ children }) => {
  const classes = useStyles();

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>{children}</div>
        <Box mt={5}>
          <Attribution />
        </Box>{" "}
      </Grid>
    </Grid>
  );
};

export default LoginBase;
