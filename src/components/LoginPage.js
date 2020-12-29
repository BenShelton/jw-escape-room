import React, { useState, useRef } from "react";
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

import LoginBase from "./LoginBase";

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

const LoginPage = () => {
  const classes = useStyles();

  const emailRef = useRef();
  const passwordRef = useRef();

  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      history.push("/dashboard");
    } catch (e) {
      console.error(e);
      setError(e.message);
    }

    setLoading(false);
  };

  return (
    <LoginBase>
      <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Host Login
      </Typography>
      <form className={classes.form} onSubmit={handleSubmit} noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          inputProps={{ ref: emailRef }}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          inputProps={{ ref: passwordRef }}
        />
        {error && (
          <Alert variant="filled" severity="error">
            {error}
          </Alert>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          disabled={loading}
        >
          Login
        </Button>
        <Grid container>
          <Grid item xs>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <Link component={RouterLink} to="/register" variant="body2">
              Have a referral code? Register
            </Link>
          </Grid>
        </Grid>
      </form>
    </LoginBase>
  );
};

export default LoginPage;
