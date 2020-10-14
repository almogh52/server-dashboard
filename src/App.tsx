import React from "react";
import "./App.css";

import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import "@rmwc/top-app-bar/styles";

import { ThemeProvider } from "@rmwc/theme";
import "@rmwc/theme/styles";

import { DialogQueue } from "@rmwc/dialog";
import "@rmwc/dialog/styles";

import { SnackbarQueue } from "@rmwc/snackbar";
import "@rmwc/snackbar/styles";

import { dialogQueue } from "./dialogQueue";
import { snackbarQueue } from "./snackbarQueue";

import { Torrents } from "./features/torrents/Torrents";

function App() {
  return (
    <ThemeProvider
      className="server-dashboard-app"
      options={{ primary: "#0091ea", secondary: "#212121" }}
    >
      <DialogQueue dialogs={dialogQueue.dialogs} />
      <SnackbarQueue messages={snackbarQueue.messages} leading />
      <TopAppBar fixed>
        <TopAppBarRow>
          <TopAppBarSection>
            <TopAppBarTitle>Server Dashboard</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust />
      <div className="server-dashboard-app-body">
        <div className="server-dashboard-app-content">
          <Torrents />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
