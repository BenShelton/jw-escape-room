import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { useHistory, withRouter } from "react-router-dom";
import Alert from "@material-ui/lab/Alert";
import Grid from "@material-ui/core/Grid";
import { useAuth } from "../contexts/AuthContext";
import { makeStyles } from "@material-ui/core/styles";
import { Link as RouterLink } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import { isEmpty } from "lodash";

import LoginBase from "./LoginBase";
import { auth } from "../firebase";

const useStyles = makeStyles(theme => ({
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

const RegistrationPage = ({ location }) => {
  const classes = useStyles();

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const referralCodeRef = useRef();

  const { signup, currentUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const referralCodeParam = new URLSearchParams(location.search).get(
    "referralcode"
  );

  useLayoutEffect(() => {
    // populate code from query param
    referralCodeRef.current.value = referralCodeParam || "";
  }, []);

  const handleSubmit = async e => {
    // OPTIMIZE: implement validate.js
    e.preventDefault();
    setLoading(true);
    if (isEmpty(firstNameRef.current.value)) {
      return setError("Please enter your first name.");
    }

    if (isEmpty(lastNameRef.current.value)) {
      return setError("Please enter your last name.");
    }

    if (isEmpty(emailRef.current.value)) {
      return setError("Please enter your email.");
    }

    if (isEmpty(passwordRef.current.value)) {
      return setError("Please enter a password.");
    }

    if (isEmpty(passwordConfirmRef.current.value)) {
      return setError("Please confirm your password.");
    }

    if (isEmpty(referralCodeRef.current.value)) {
      return setError("Please enter the referral code given to you.");
    }

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match.");
    }

    try {
      setError("");
      await signup({
        firstName: firstNameRef.current.value,
        lastName: lastNameRef.current.value,
        email: emailRef.current.value,
        password: passwordRef.current.value,
        referralCode: referralCodeRef.current.value
      });
    } catch (e) {
      console.error(e);
      setError(e.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      history.push("/games");
    }
  }, [currentUser]);

  return (
    <LoginBase>
      <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        JW Zoom Games
      </Typography>
      <Typography component="h2" variant="h6">
        Sign Up
      </Typography>
      <form className={classes.form} onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              autoComplete="fname"
              name="firstName"
              variant="outlined"
              required
              fullWidth
              id="firstName"
              label="First Name"
              autoFocus
              inputProps={{ ref: firstNameRef }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="lname"
              inputProps={{ ref: lastNameRef }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              inputProps={{ ref: emailRef }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              inputProps={{ ref: passwordRef }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="passwordConfirm"
              label="Confirm Password"
              type="password"
              id="passwordConfirm"
              inputProps={{ ref: passwordConfirmRef }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="referralCode"
              label="Referral Code"
              type="text"
              id="referralCode"
              inputProps={{ ref: referralCodeRef }}
            />
          </Grid>
        </Grid>
        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          disabled={loading}
        >
          {!loading ? "Sign Up" : <CircularProgress size={24} />}
        </Button>
        <Grid container justify="flex-end">
          <Grid item>
            <Link component={RouterLink} to="/" variant="body2">
              Already have an account? Sign in
            </Link>
          </Grid>
        </Grid>
      </form>
    </LoginBase>
  );
};

export default RegistrationPage;
