import React from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import { CookiesProvider } from "react-cookie";

import theme from "../theme";
import AppRouter from "./AppRouter";

const App = () => (
  <ThemeProvider theme={theme}>
    <CookiesProvider>
      <AppRouter />
    </CookiesProvider>
  </ThemeProvider>
);

export default App;
