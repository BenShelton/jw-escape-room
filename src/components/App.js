import React from "react";
import { ThemeProvider } from "@material-ui/core/styles";

import theme from "./theme";
import AppRouter from "./AppRouter";

const App = ({}) => (
  <ThemeProvider theme={theme}>
    <AppRouter />
  </ThemeProvider>
);

export default App;
