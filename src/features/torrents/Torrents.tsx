import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useDropzone } from "react-dropzone";
import "./Torrents.css";
import {
  selectTorrents,
  selectApplicationName,
  fetchTorrentsAsync,
  fetchApplicationName,
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

import { Elevation } from "@rmwc/elevation";
import "@rmwc/elevation/styles";

import { TextField } from "@rmwc/textfield";
import "@rmwc/textfield/styles";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogButton,
} from "@rmwc/dialog";
import "@rmwc/dialog/styles";

interface AddTorrentDialogProps {
  open: boolean;
  onClose: (evt: any) => void;

  fromFile: boolean;
}

function AddTorrentDialog(props: AddTorrentDialogProps) {
  const [torrentFiles, setTorrentFiles] = useState<Array<File>>([]);
  const [torrentLinks, setTorrentLinks] = useState<Array<string>>([]);

  const onDrop = useCallback((files) => setTorrentFiles(files), []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>
        {props.fromFile
          ? "Add Torrent From File/Files"
          : "Add Torrent From Link/Links"}
      </DialogTitle>
      <DialogContent>
        {props.fromFile
          ? "Choose your torrent file/files"
          : "Add torrent links"}
        {props.fromFile ? (
          <Elevation
            z={3}
            style={{
              height: "140px",
              minWidth: "300px",
              borderRadius: "15px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <Typography
              use="body1"
              style={{ textAlign: "center", padding: "12px" }}
            >
              {isDragActive
                ? "Drop the torrent files here..."
                : "Drag the torrent files here or click to select files"}
              {torrentFiles.length > 0 ? (
                <>
                  <br />
                  <br />
                </>
              ) : null}
              {torrentFiles.length > 0
                ? torrentFiles.length === 1
                  ? `Selected: '${torrentFiles[0].name}'`
                  : `Selected ${torrentFiles.length} files`
                : ""}
            </Typography>
          </Elevation>
        ) : (
          <TextField
            className="server-dashboard-add-torrent-links-textarea"
            style={{ minWidth: "400px", height: "150px" }}
            textarea
            outlined
            fullwidth
            helpText={{
              persistent: true,
              children: "One link per line",
            }}
            onChange={(evt) =>
              setTorrentLinks(evt.currentTarget.value.split("\n"))
            }
          />
        )}
      </DialogContent>
      <DialogActions>
        <DialogButton action="close">Cancel</DialogButton>
        <DialogButton action="accept" isDefaultAction>
          Add
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
}

export function Torrents() {
  const applicationName = useSelector(selectApplicationName);
  const torrents = useSelector(selectTorrents);

  const dispatch = useDispatch();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogFromFile, setAddDialogFromFile] = useState(true);

  useEffect(() => {
    dispatch(fetchApplicationName());
    dispatch(fetchTorrentsAsync());

    const interval = setInterval(() => dispatch(fetchTorrentsAsync()), 400);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <Card style={{ width: "100%", minHeight: "100%" }}>
      <AddTorrentDialog
        fromFile={addDialogFromFile}
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />

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
            label="Add Torrent File"
            icon="note_add"
            style={{ marginLeft: "15px" }}
            onClick={() => {
              setAddDialogFromFile(true);
              setAddDialogOpen(true);
            }}
          />

          <Button
            label="Add Torrent Link"
            icon="insert_link"
            style={{ marginLeft: "10px" }}
            onClick={() => {
              setAddDialogFromFile(false);
              setAddDialogOpen(true);
            }}
          />
        </div>
        <Typography use="subtitle2" theme="textSecondaryOnBackground">
          {applicationName}
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
