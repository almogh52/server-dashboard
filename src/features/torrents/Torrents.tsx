import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useDropzone } from "react-dropzone";
import "./Torrents.css";
import {
  selectTorrents,
  selectApplicationInfo,
  selectPreferences,
  fetchTorrentsAsync,
  fetchApplicationInfo,
  fetchPreferences,
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

import { Checkbox } from "@rmwc/checkbox";
import "@rmwc/checkbox/styles";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogButton,
} from "@rmwc/dialog";
import "@rmwc/dialog/styles";

import { SpeedLimitTextField } from "./SpeedLimitTextField";

interface AddTorrentDialogProps {
  open: boolean;
  onClose: (evt: any) => void;

  fromFile: boolean;
  defaultSavePath: string;
  defaultStartTorrent: boolean;
  defaultCreateSubfolder: boolean;
}

function AddTorrentDialog(props: AddTorrentDialogProps) {
  const [torrentFiles, setTorrentFiles] = useState<Array<File>>([]);
  const [torrentLinks, setTorrentLinks] = useState<Array<string>>([]);

  const [autoManage, setAutoManage] = useState(false);
  const [startTorrent, setStartTorrent] = useState(props.defaultStartTorrent);
  const [skipHashCheck, setSkipHashCheck] = useState(false);
  const [createSubfolder, setCreateSubfolder] = useState(
    props.defaultCreateSubfolder
  );
  const [downloadSeqOrder, setDownloadSeqOrder] = useState(false);
  const [downloadEdgeFirst, setDownloadEdgeFirst] = useState(false);

  const [savePath, setSavePath] = useState(props.defaultSavePath);
  const [cookie, setCookie] = useState("");
  const [torrentName, setTorrentName] = useState("");

  const [downloadLimit, setDownloadLimit] = useState(0);
  const [uploadLimit, setUploadLimit] = useState(0);

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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "15px 0",
          }}
        >
          <Checkbox
            label="Automatic Torrent Managment"
            checked={autoManage}
            onChange={(evt) => setAutoManage(evt.currentTarget.checked)}
          />
          <TextField
            label="Save Path"
            icon="folder"
            value={autoManage ? "" : savePath}
            disabled={autoManage}
            onChange={(evt) => setSavePath(evt.currentTarget.value)}
          />
          {!props.fromFile ? (
            <TextField
              label="Download Cookie"
              icon="fingerprint"
              value={cookie}
              style={{ marginTop: "10px" }}
              onChange={(evt) => setCookie(evt.currentTarget.value)}
            />
          ) : null}
          <TextField
            label="Rename Torrent"
            icon="edit"
            value={torrentName}
            helpText={{
              persistent: true,
              children: "Keep empty for default name",
            }}
            style={{ marginTop: "10px" }}
            onChange={(evt) => setTorrentName(evt.currentTarget.value)}
          />
          <Checkbox
            label="Start Torrent"
            checked={startTorrent}
            style={{ marginTop: "5px" }}
            onChange={(evt) => setStartTorrent(evt.currentTarget.checked)}
          />
          <Checkbox
            label="Skip Hash Check"
            checked={skipHashCheck}
            onChange={(evt) => setSkipHashCheck(evt.currentTarget.checked)}
          />
          <Checkbox
            label="Create Subfolder"
            checked={createSubfolder}
            onChange={(evt) => setCreateSubfolder(evt.currentTarget.checked)}
          />
          <Checkbox
            label="Download in Sequential Order"
            checked={downloadSeqOrder}
            onChange={(evt) => setDownloadSeqOrder(evt.currentTarget.checked)}
          />
          <Checkbox
            label="Download Edge Pieces First"
            checked={downloadEdgeFirst}
            onChange={(evt) => setDownloadEdgeFirst(evt.currentTarget.checked)}
          />
          <SpeedLimitTextField
            label="Download Speed Limit"
            icon="vertical_align_bottom"
            limit={downloadLimit}
            setLimit={setDownloadLimit}
            style={{ marginTop: "5px" }}
          />
          <SpeedLimitTextField
            label="Upload Speed Limit"
            icon="vertical_align_top"
            limit={uploadLimit}
            setLimit={setUploadLimit}
            style={{ marginTop: "10px" }}
          />
        </div>
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
  const applicationInfo = useSelector(selectApplicationInfo);
  const preferences = useSelector(selectPreferences);
  const torrents = useSelector(selectTorrents);

  const dispatch = useDispatch();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogFromFile, setAddDialogFromFile] = useState(true);

  useEffect(() => {
    dispatch(fetchApplicationInfo());
    dispatch(fetchPreferences());
    dispatch(fetchTorrentsAsync());

    const interval = setInterval(() => dispatch(fetchTorrentsAsync()), 400);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <Card style={{ width: "100%", minHeight: "100%" }}>
      {addDialogOpen ? (
        <AddTorrentDialog
          fromFile={addDialogFromFile}
          defaultSavePath={preferences.savePath}
          defaultStartTorrent={!preferences.startPausedEnabled}
          defaultCreateSubfolder={preferences.createSubfolderEnabled}
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
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
