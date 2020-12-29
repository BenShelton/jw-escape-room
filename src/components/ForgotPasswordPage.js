import React, { useState, useRef } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
import Grid from "@material-ui/core/Grid";
import { useAuth } from "../contexts/AuthContext";
import { makeStyles } from "@material-ui/core/styles";
import { Link as RouterLink } from "react-router-dom";
import Box from "@material-ui/core/Box";

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

  const { resetPassword } = useAuth();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setSuccess("");
      setError("");
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setSuccess(true);
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
        Request Password Reset
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
        {success && (
          <Alert variant="filled" severity="success">
            Check your inbox to reset your password.
          </Alert>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {!success && (
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={loading}
          >
            Request Reset
          </Button>
        )}
        {success && (
          <Box mt={2}>
            <Link component={RouterLink} to="/">
              Back to login page
            </Link>
          </Box>
        )}
      </form>
    </LoginBase>
  );
};

export default LoginPage;
