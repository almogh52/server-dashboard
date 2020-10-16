import React, { useState } from "react";
import "./TorrentActions.css";
import { Torrent, TorrentState } from "./torrentsTypes";

import axios from "axios";
import { dialogQueue } from "../../dialogQueue";
import { snackbarQueue } from "../../snackbarQueue";

import { Button } from "@rmwc/button";
import "@rmwc/button/styles";

import { Checkbox } from "@rmwc/checkbox";
import "@rmwc/checkbox/styles";

import { TextField } from "@rmwc/textfield";
import "@rmwc/textfield/styles";

import { Slider } from "@rmwc/slider";
import "@rmwc/slider/styles";

import { ThemeProvider } from "@rmwc/theme";
import "@rmwc/theme/styles";

import {
  List,
  ListItem,
  ListItemGraphic,
  ListItemMeta,
  ListDivider,
  CollapsibleList,
} from "@rmwc/list";
import "@rmwc/list/styles";

import { Elevation } from "@rmwc/elevation";
import "@rmwc/elevation/styles";

import { SpeedLimitTextField } from "./SpeedLimitTextField";

import { useContextMenuEvent } from "react-context-menu-wrapper";

import copy from "copy-to-clipboard";

export interface TorrentContextMenuProps {
  torrent: Torrent;
}

export interface TorrentActionsProps {
  torrent: Torrent;
}

interface SpeedLimitDialogProps {
  defaultLimit: number;
  setLimit: (limit: number) => void;
}

function SpeedLimitDialog(props: SpeedLimitDialogProps) {
  const [limit, setLimit] = useState(props.defaultLimit);

  return (
    <>
      <br />
      <Slider
        value={limit}
        min={0}
        max={10000}
        step={1}
        onInput={(evt) => {
          setLimit(evt.detail.value);
          props.setLimit(evt.detail.value);
        }}
      />
      <SpeedLimitTextField
        style={{ width: "250px" }}
        outlined
        limit={limit}
        setLimit={(newLimit) => {
          setLimit(newLimit);
          props.setLimit(newLimit);
        }}
      />
    </>
  );
}

const pauseResumeTorrent = (torrent: Torrent): Promise<any> => {
  return axios.post(
    `/api/qbittorrent/torrent/${torrent.hash}/${
      torrent.state === TorrentState.Paused ||
      torrent.state === TorrentState.Completed
        ? "resume"
        : "pause"
    }`
  );
};

const deleteTorrentAction = (torrent: Torrent): Promise<any> => {
  let deleteFiles = false;

  return dialogQueue
    .confirm({
      title: <b>Deletion confirmation</b>,
      body: `Are you sure you want to delete '${torrent.name}'?`,
      children: (
        <>
          <br />
          <Checkbox
            label="Delete the local files"
            onChange={(evt) => {
              deleteFiles = !!evt.currentTarget.checked;
            }}
          />
        </>
      ),
      acceptLabel: "CONFIRM",
    })
    .then((del) =>
      del
        ? axios
            .post(`/api/qbittorrent/torrent/${torrent.hash}/delete`, {
              deleteFiles,
            })
            .then(() =>
              snackbarQueue.notify({
                title: <b>Torrent Deleted</b>,
                body: `The torrent '${torrent.name}' has been deleted!`,
                dismissesOnAction: true,
                icon: "clear",
                actions: [
                  {
                    title: "Dismiss",
                  },
                ],
              })
            )
        : null
    );
};

const setTorrentSavePathAction = (torrent: Torrent): Promise<any> => {
  let savePath = torrent.savePath;

  return dialogQueue
    .confirm({
      title: <b>Change Save Path</b>,
      body: "New save path:",
      children: (
        <>
          <br />
          <TextField
            style={{ width: "350px" }}
            outlined
            defaultValue={savePath}
            onChange={(evt) => {
              savePath = evt.currentTarget.value;
            }}
          />
        </>
      ),
      acceptLabel: "SET",
    })
    .then((set) =>
      set && savePath !== torrent.savePath
        ? axios
            .post(`/api/qbittorrent/torrent/${torrent.hash}/setSavePath`, {
              savePath,
            })
            .then(() =>
              snackbarQueue.notify({
                title: <b>Torrent Moved</b>,
                body: `The torrent '${torrent.name}' has been moved to '${savePath}'!`,
                dismissesOnAction: true,
                icon: "folder",
                actions: [
                  {
                    title: "Dismiss",
                  },
                ],
              })
            )
            .catch(() =>
              dialogQueue.alert({
                title: <b>Change Save Path</b>,
                body: "Invalid save path!",
              })
            )
        : null
    );
};

const renameTorrentAction = (torrent: Torrent): Promise<any> => {
  let name = torrent.name;

  return dialogQueue
    .confirm({
      title: <b>Rename</b>,
      body: "New name:",
      children: (
        <>
          <br />
          <TextField
            style={{ width: "500px" }}
            outlined
            defaultValue={name}
            onChange={(evt) => {
              name = evt.currentTarget.value;
            }}
          />
        </>
      ),
      acceptLabel: "SET",
    })
    .then((set) =>
      set && name !== torrent.name
        ? axios
            .post(`/api/qbittorrent/torrent/${torrent.hash}/setName`, { name })
            .then(() =>
              snackbarQueue.notify({
                title: <b>Torrent Renamed</b>,
                body: `The torrent '${torrent.name}' has been renamed to '${name}'!`,
                dismissesOnAction: true,
                icon: "edit",
                actions: [
                  {
                    title: "Dismiss",
                  },
                ],
              })
            )
            .catch(() =>
              dialogQueue.alert({
                title: <b>Rename</b>,
                body: "Invalid name!",
              })
            )
        : null
    );
};

const limitTorrentDownloadRateAction = (torrent: Torrent): Promise<any> => {
  let limit = Math.round(torrent.downloadLimit / 1000);

  return dialogQueue
    .confirm({
      title: <b>Set Download Limit</b>,
      body: "Download limit:",
      children: (
        <SpeedLimitDialog
          defaultLimit={limit}
          setLimit={(newLimit) => {
            limit = newLimit;
          }}
        />
      ),
      acceptLabel: "SET",
    })
    .then((set) =>
      set && limit !== torrent.downloadLimit * 1000
        ? axios
            .post(`/api/qbittorrent/torrent/${torrent.hash}/setDownloadLimit`, {
              limit: limit * 1000,
            })
            .catch(() =>
              dialogQueue.alert({
                title: <b>Set Download Limit</b>,
                body: "Invalid limit!",
              })
            )
        : null
    );
};

const limitTorrentUploadRateAction = (torrent: Torrent): Promise<any> => {
  let limit = Math.round(torrent.uploadLimit / 1000);

  return dialogQueue
    .confirm({
      title: <b>Set Upload Limit</b>,
      body: "Upload limit:",
      children: (
        <SpeedLimitDialog
          defaultLimit={limit}
          setLimit={(newLimit) => {
            limit = newLimit;
          }}
        />
      ),
      acceptLabel: "SET",
    })
    .then((set) =>
      set && limit !== torrent.uploadLimit * 1000
        ? axios
            .post(`/api/qbittorrent/torrent/${torrent.hash}/setUploadLimit`, {
              limit: limit * 1000,
            })
            .catch(() =>
              dialogQueue.alert({
                title: <b>Set Upload Limit</b>,
                body: "Invalid limit!",
              })
            )
        : null
    );
};

const setTorrentMaxPriority = (torrent: Torrent): Promise<any> => {
  return axios.post(`/api/qbittorrent/torrent/${torrent.hash}/maxPriority`);
};

const setTorrentMinPriority = (torrent: Torrent): Promise<any> => {
  return axios.post(`/api/qbittorrent/torrent/${torrent.hash}/minPriority`);
};

const increaseTorrentPriority = (torrent: Torrent): Promise<any> => {
  return axios.post(
    `/api/qbittorrent/torrent/${torrent.hash}/increasePriority`
  );
};

const decreaseTorrentPriority = (torrent: Torrent): Promise<any> => {
  return axios.post(
    `/api/qbittorrent/torrent/${torrent.hash}/decreasePriority`
  );
};

const copyTorrentHash = (torrent: Torrent): void => {
  copy(torrent.hash) &&
    snackbarQueue.notify({
      title: <b>Hash Copied</b>,
      body: "The torrent's hash has been copied to your clipboard!",
      dismissesOnAction: true,
      icon: "content_copy",
      actions: [
        {
          title: "Dismiss",
        },
      ],
    });
};

const copyTorrentMagnetLink = (torrent: Torrent): void => {
  copy(torrent.magnetUri) &&
    snackbarQueue.notify({
      title: <b>Magnet Link Copied</b>,
      body: "The torrent's magnet link has been copied to your clipboard!",
      dismissesOnAction: true,
      icon: "file_copy",
      actions: [
        {
          title: "Dismiss",
        },
      ],
    });
};

export function TorrentContextMenu(props: TorrentContextMenuProps) {
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);

  const menuEvent = useContextMenuEvent();
  if (!menuEvent) return null;

  const openedAbove = (menuEvent.clientY as number) + 600 > window.innerHeight;

  const disabled =
    props.torrent.state === TorrentState.Error ||
    props.torrent.state === TorrentState.MissingFiles;

  const completed =
    props.torrent.state === TorrentState.Completed ||
    props.torrent.bytesDownloaded >= props.torrent.size;

  return (
    <div
      style={{
        height: "600px",
        display: openedAbove ? "flex" : "",
        flexWrap: "wrap",
      }}
    >
      <Elevation
        z={5}
        style={{
          background: "white",
          alignSelf: openedAbove ? "flex-end" : "",
        }}
      >
        <List style={{ width: "100%", marginRight: "20px" }} disabled>
          <ListItem
            disabled={disabled}
            onClick={() => pauseResumeTorrent(props.torrent).catch(() => {})}
          >
            <ListItemGraphic
              style={{ color: "var(--mdc-theme-primary)" }}
              icon={
                props.torrent.state === TorrentState.Paused ||
                props.torrent.state === TorrentState.Completed
                  ? "play_arrow"
                  : "pause"
              }
            />
            {props.torrent.state === TorrentState.Paused ||
            props.torrent.state === TorrentState.Completed
              ? "Resume"
              : "Pause"}
          </ListItem>

          <ListDivider />

          <ListItem
            disabled={disabled}
            onClick={() => deleteTorrentAction(props.torrent).catch(() => {})}
          >
            <ListItemGraphic style={{ color: "#b61431" }} icon="clear" />
            Delete
          </ListItem>

          <ListDivider />

          <ListItem
            disabled={disabled}
            onClick={() =>
              setTorrentSavePathAction(props.torrent).catch(() => {})
            }
          >
            <ListItemGraphic style={{ color: "#00c853" }} icon="folder" />
            Set Save Path
          </ListItem>

          <ListItem
            disabled={disabled}
            onClick={() => renameTorrentAction(props.torrent).catch(() => {})}
          >
            <ListItemGraphic style={{ color: "#00c853" }} icon="edit" />
            Rename
          </ListItem>

          <ListDivider />

          <ListItem
            disabled={disabled}
            onClick={() =>
              limitTorrentDownloadRateAction(props.torrent).catch(() => {})
            }
          >
            <ListItemGraphic
              style={{ color: "#ffab00" }}
              icon="vertical_align_bottom"
            />
            Limit Download Rate
          </ListItem>

          <ListItem
            disabled={disabled}
            onClick={() =>
              limitTorrentUploadRateAction(props.torrent).catch(() => {})
            }
          >
            <ListItemGraphic
              style={{ color: "#ffab00" }}
              icon="vertical_align_top"
            />
            Limit Upload Rate
          </ListItem>

          {!completed ? (
            <>
              <ListDivider />

              <CollapsibleList
                handle={
                  <ListItem>
                    <ListItemGraphic
                      style={{ color: "#c51162" }}
                      icon="reorder"
                    />
                    Priority
                    <ListItemMeta icon="chevron_right" />
                  </ListItem>
                }
                open={priorityOpen}
                onMouseEnter={() => setPriorityOpen(true)}
                onMouseLeave={() => setPriorityOpen(false)}
              >
                <ListItem
                  className="server-dashboard-list-item-icon-rotate-90deg"
                  disabled={disabled}
                  onClick={() =>
                    setTorrentMaxPriority(props.torrent).catch(() => {})
                  }
                >
                  <ListItemGraphic
                    style={{ color: "#c51162" }}
                    icon="first_page"
                  />
                  Maximum Priority
                </ListItem>

                <ListItem
                  disabled={disabled}
                  onClick={() =>
                    increaseTorrentPriority(props.torrent).catch(() => {})
                  }
                >
                  <ListItemGraphic
                    style={{ color: "#c51162" }}
                    icon="expand_less"
                  />
                  Increase Priority
                </ListItem>

                <ListItem
                  disabled={disabled}
                  onClick={() =>
                    decreaseTorrentPriority(props.torrent).catch(() => {})
                  }
                >
                  <ListItemGraphic
                    style={{ color: "#c51162" }}
                    icon="expand_more"
                  />
                  Decreasee Priority
                </ListItem>

                <ListItem
                  className="server-dashboard-list-item-icon-rotate-90deg"
                  disabled={disabled}
                  onClick={() =>
                    setTorrentMinPriority(props.torrent).catch(() => {})
                  }
                >
                  <ListItemGraphic
                    style={{ color: "#c51162" }}
                    icon="last_page"
                  />
                  Minimum Priority
                </ListItem>
              </CollapsibleList>
            </>
          ) : null}

          <ListDivider />

          <CollapsibleList
            handle={
              <ListItem>
                <ListItemGraphic
                  style={{ color: "#424242" }}
                  icon="content_copy"
                />
                Copy
                <ListItemMeta icon="chevron_right" />
              </ListItem>
            }
            open={copyOpen}
            onMouseEnter={() => setCopyOpen(true)}
            onMouseLeave={() => setCopyOpen(false)}
          >
            <ListItem onClick={() => copyTorrentHash(props.torrent)}>
              <ListItemGraphic
                style={{ color: "#424242" }}
                icon="content_copy"
              />
              Copy Hash
            </ListItem>

            <ListItem onClick={() => copyTorrentMagnetLink(props.torrent)}>
              <ListItemGraphic style={{ color: "#424242" }} icon="file_copy" />
              Copy Magnet Link
            </ListItem>
          </CollapsibleList>
        </List>
      </Elevation>
    </div>
  );
}

export function TorrentActions(props: TorrentActionsProps) {
  const disabled =
    props.torrent.state === TorrentState.Error ||
    props.torrent.state === TorrentState.MissingFiles;

  return (
    <div className="server-dashboard-torrent-detail">
      <div className="server-dashboard-torrent-detail-group">
        <Button
          unelevated
          className="server-dashboard-torrent-action"
          label={
            props.torrent.state === TorrentState.Paused ||
            props.torrent.state === TorrentState.Completed
              ? "Resume"
              : "Pause"
          }
          icon={
            props.torrent.state === TorrentState.Paused ||
            props.torrent.state === TorrentState.Completed
              ? "play_arrow"
              : "pause"
          }
          disabled={disabled}
          onClick={() => pauseResumeTorrent(props.torrent).catch(() => {})}
        />

        <Button
          unelevated
          className="server-dashboard-torrent-action"
          label="Delete"
          icon="clear"
          disabled={disabled}
          danger
          onClick={() => deleteTorrentAction(props.torrent).catch(() => {})}
        />
      </div>

      <ThemeProvider
        className="server-dashboard-torrent-detail-group"
        options={{ primary: "#00c853" }}
      >
        <Button
          unelevated
          className="server-dashboard-torrent-action"
          label="Set Save Path"
          icon="folder"
          disabled={disabled}
          onClick={() =>
            setTorrentSavePathAction(props.torrent).catch(() => {})
          }
        />

        <Button
          unelevated
          className="server-dashboard-torrent-action"
          label="Rename"
          icon="edit"
          disabled={disabled}
          onClick={() => renameTorrentAction(props.torrent).catch(() => {})}
        />
      </ThemeProvider>

      <ThemeProvider
        className="server-dashboard-torrent-detail-group"
        options={{ primary: "#ffab00" }}
      >
        <Button
          unelevated
          className="server-dashboard-torrent-action"
          label="Limit download rate"
          icon="vertical_align_bottom"
          disabled={disabled}
          onClick={() =>
            limitTorrentDownloadRateAction(props.torrent).catch(() => {})
          }
        />

        <Button
          unelevated
          className="server-dashboard-torrent-action"
          label="Limit upload rate"
          icon="vertical_align_top"
          disabled={disabled}
          onClick={() =>
            limitTorrentUploadRateAction(props.torrent).catch(() => {})
          }
        />
      </ThemeProvider>

      <ThemeProvider
        className="server-dashboard-torrent-detail-group"
        options={{ primary: "#c51162" }}
      >
        <Button
          unelevated
          className="server-dashboard-torrent-action server-dashboard-button-icon-rotate-90deg"
          label="Set Maximum Priority"
          icon="first_page"
          disabled={disabled}
          onClick={() => setTorrentMaxPriority(props.torrent).catch(() => {})}
        />

        <Button
          unelevated
          className="server-dashboard-torrent-action server-dashboard-button-icon-rotate-90deg"
          label="Set Minimum Priority"
          icon="last_page"
          disabled={disabled}
          onClick={() => setTorrentMinPriority(props.torrent).catch(() => {})}
        />
      </ThemeProvider>

      <ThemeProvider
        className="server-dashboard-torrent-detail-group"
        options={{ primary: "#c51162" }}
      >
        <Button
          unelevated
          className="server-dashboard-torrent-action"
          label="Increase priority"
          icon="expand_less"
          disabled={disabled}
          onClick={() => increaseTorrentPriority(props.torrent).catch(() => {})}
        />

        <Button
          unelevated
          className="server-dashboard-torrent-action"
          label="Decrease priority"
          icon="expand_more"
          disabled={disabled}
          onClick={() => decreaseTorrentPriority(props.torrent).catch(() => {})}
        />
      </ThemeProvider>
      <ThemeProvider
        className="server-dashboard-torrent-detail-group"
        options={{ primary: "#424242" }}
      >
        <Button
          unelevated
          className="server-dashboard-torrent-action"
          label="Copy Hash"
          icon="content_copy"
          onClick={() => copyTorrentHash(props.torrent)}
        />

        <Button
          unelevated
          className="server-dashboard-torrent-action"
          label="Copy magnet link"
          icon="file_copy"
          onClick={() => copyTorrentMagnetLink(props.torrent)}
        />
      </ThemeProvider>
    </div>
  );
}
