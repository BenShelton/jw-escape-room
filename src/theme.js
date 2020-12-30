import { createMuiTheme } from "@material-ui/core/styles";
import purple from "@material-ui/core/colors/purple";
import green from "@material-ui/core/colors/green";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: purple[500]
    },
    secondary: {
      main: green[500]
    }
  }
});

export default theme;

export const sharedStyles = theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  },
  // paper: {
  //   padding: "10px",
  //   display: "flex",
  //   overflow: "auto",
  //   flexDirection: "column"
  // },
  teamGroup: {
    background: "#eee",
    padding: "20px",
    borderRadius: "10px",
    margin: "10px 0",
    display: "flex",
    justifyContent: "center"
  }
});
