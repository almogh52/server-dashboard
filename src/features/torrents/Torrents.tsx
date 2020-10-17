import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./Torrents.css";
import {
  selectTorrents,
  selectApplicationInfo,
  selectPreferences,
  selectCategories,
  fetchTorrentsAsync,
  fetchApplicationInfo,
  fetchPreferences,
  fetchCategories,
  fetchTags
} from "./torrentsSlice";

import { TorrentItem } from "./TorrentItem";

import { Typography } from "@rmwc/typography";
import "@rmwc/typography/styles";

import { Card } from "@rmwc/card";
import "@rmwc/card/styles";

import { List, ListDivider } from "@rmwc/list";
import "@rmwc/list/styles";

import { Button } from "@rmwc/button";
import "@rmwc/button/styles";

import { AddTorrentDialog } from "./AddTorrentDialog";

export function Torrents() {
  const applicationInfo = useSelector(selectApplicationInfo);
  const preferences = useSelector(selectPreferences);
  const categories = useSelector(selectCategories);
  const torrents = useSelector(selectTorrents);

  const dispatch = useDispatch();

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchApplicationInfo());
    dispatch(fetchPreferences());
    dispatch(fetchCategories());
    dispatch(fetchTags());
    dispatch(fetchTorrentsAsync());

    const interval = setInterval(() => dispatch(fetchTorrentsAsync()), 400);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <Card style={{ width: "100%", minHeight: "100%" }}>
      {addDialogOpen ? (
        <AddTorrentDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          categories={categories}
          defaultSavePath={preferences.savePath}
          defaultStartTorrent={!preferences.startPausedEnabled}
          defaultCreateSubfolder={preferences.createSubfolderEnabled}
        />
      ) : null}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.5rem 1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography use="headline6">Torrents List</Typography>

          <Button
            label="Add Torrents"
            icon="note_add"
            style={{ marginLeft: "15px" }}
            onClick={() => setAddDialogOpen(true)}
          />
        </div>
        <Typography use="subtitle2" theme="textSecondaryOnBackground">
          {applicationInfo}
        </Typography>
      </div>
      <ListDivider className="server-dashboard-torrents-card-divider" />
      <List>
        {torrents.map((torrent) => (
          <TorrentItem key={torrent.hash} torrent={torrent} />
        ))}
      </List>
    </Card>
  );
}
