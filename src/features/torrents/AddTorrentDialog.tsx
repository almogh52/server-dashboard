import React, { useState, useCallback, useReducer } from "react";
import "./AddTorrentDialog.css";
import { Category } from "./torrentsTypes";

import axios from "axios";

import { useDropzone } from "react-dropzone";

import { Typography } from "@rmwc/typography";
import "@rmwc/typography/styles";

import { List, ListItem, SimpleListItem } from "@rmwc/list";
import "@rmwc/list/styles";

import { Button } from "@rmwc/button";
import "@rmwc/button/styles";

import { TextField } from "@rmwc/textfield";
import "@rmwc/textfield/styles";

import { Checkbox } from "@rmwc/checkbox";
import "@rmwc/checkbox/styles";

import { Select } from "@rmwc/select";
import "@rmwc/select/styles";

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

  categories: Array<Category>;

  defaultSavePath: string;
  defaultStartTorrent: boolean;
  defaultCreateSubfolder: boolean;
}

interface TorrentsState {
  files: Array<File>;
  links: Array<string>;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result!.toString().replace(/^data:(.*,)?/, "");
      if (encoded.length % 4 > 0) {
        encoded += "=".repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = (error) => reject(error);
  });

const addTorrents = async (
  files: Array<File>,
  links: Array<string>,
  autoManage: boolean,
  savePath: string,
  category: string,
  downloadCookie: string,
  torrentName: string,
  startTorrent: boolean,
  skipHashCheck: boolean,
  createSubfolder: boolean,
  downloadSeqOrder: boolean,
  downloadEdgeFirst: boolean,
  downloadLimit: number,
  uploadLimit: number
): Promise<void> => {
  let data: {
    [key: string]:
      | Array<[string, string]>
      | Array<string>
      | string
      | boolean
      | number;
  } = {};

  if (files.length > 0) {
    data.files = [] as Array<[string, string]>;

    for (const file of files) {
      (data.files as Array<[string, string]>).push([
        file.name,
        await fileToBase64(file),
      ]);
    }
  }

  if (links.length > 0) {
    data.links = links.filter((link) => link.length > 0);
  }

  if (downloadCookie.length > 0) {
    data.downloadCookie = downloadCookie;
  }

  if (category.length > 0) {
    data.category = category;
  }

  if (!autoManage) {
    data.savePath = savePath;
  }

  if (torrentName.length > 0) {
    data.torrentName = torrentName;
  }

  if (downloadLimit > 0) {
    data.downloadLimit = downloadLimit;
  }

  if (uploadLimit > 0) {
    data.uploadLimit = uploadLimit;
  }

  return axios.post("/api/qbittorrent/torrents/add", {
    ...data,
    autoManage,
    startTorrent,
    skipHashCheck,
    createSubfolder,
    downloadSeqOrder,
    downloadEdgeFirst,
  });
};

function useTorrents(): [
  TorrentsState,
  {
    addFile: (file: File) => void;
    removeFile: (index: number) => void;
    addLink: () => void;
    removeLink: (index: number) => void;
    updateLink: (index: number, value: string) => void;
  }
] {
  const [state, dispatch] = useReducer(
    (state: TorrentsState, action: any) => {
      switch (action.type) {
        case "ADD_FILE":
          return { ...state, files: [...state.files, action.file] };

        case "REMOVE_FILE":
          return {
            ...state,
            files: state.files.filter((_, index) => index !== action.index),
          };

        case "ADD_LINK":
          return { ...state, links: [...state.links, ""] };

        case "REMOVE_LINK":
          return {
            ...state,
            links: state.links.filter((_, index) => index !== action.index),
          };

        case "UPDATE_LINK":
          return {
            ...state,
            links: state.links.map((value, index) =>
              index === action.index ? action.value : value
            ),
          };

        default:
          return state;
      }
    },
    { files: [], links: [] } as TorrentsState
  );

  return [
    state,
    {
      addFile: useCallback(
        (file: File) => dispatch({ type: "ADD_FILE", file }),
        []
      ),
      removeFile: useCallback(
        (index: number) => dispatch({ type: "REMOVE_FILE", index: index }),
        []
      ),
      addLink: useCallback(() => dispatch({ type: "ADD_LINK" }), []),
      removeLink: useCallback(
        (index: number) => dispatch({ type: "REMOVE_LINK", index: index }),
        []
      ),
      updateLink: useCallback(
        (index: number, value: string) =>
          dispatch({ type: "UPDATE_LINK", index, value }),
        []
      ),
    },
  ];
}

export function AddTorrentDialog(props: AddTorrentDialogProps) {
  const [
    { files, links },
    { addFile, removeFile, addLink, removeLink, updateLink },
  ] = useTorrents();

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

  const [category, setCategory] = useState<string>("");

  const [downloadLimit, setDownloadLimit] = useState(0);
  const [uploadLimit, setUploadLimit] = useState(0);

  const onDrop = useCallback(
    (files: Array<File>) => files.forEach((file) => addFile(file)),
    [addFile]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>Add Torrents from Files/Links</DialogTitle>
      <DialogContent style={{ width: "560px" }}>
        Choose your torrent files (or drop here) or links (torrent URLs and
        magnet URIs are supported)
        <List {...getRootProps()} onClick={undefined}>
          <input {...getInputProps()} />
          {files.map((file, index) => (
            <SimpleListItem
              key={`file-${index}`}
              graphic="insert_drive_file"
              text={
                <span style={{ wordBreak: "break-all", maxHeight: "100%" }}>
                  {file.name}
                </span>
              }
              metaIcon={{
                icon: "clear",
                tabIndex: 0,
                onClick: () => removeFile(index),
              }}
            />
          ))}
          {links.map((link, index) => (
            <SimpleListItem
              key={`link-${index}`}
              graphic="insert_link"
              text={
                <TextField
                  className="server-dashboard-add-torrent-link-textfield"
                  outlined
                  placeholder="Insert magnet URI or torrent URL here"
                  value={link}
                  onChange={(evt) => updateLink(index, evt.currentTarget.value)}
                  style={{ width: "100%" }}
                />
              }
              metaIcon={{
                icon: "clear",
                tabIndex: 0,
                onClick: () => removeLink(index),
              }}
            />
          ))}
          <ListItem
            key="add-item"
            disabled
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div>
              <Button
                label={isDragActive ? "Drop here" : "Add file"}
                icon="note_add"
                onClick={getRootProps().onClick}
              />
              <Typography use="button" style={{ padding: "0 8px" }}>
                OR
              </Typography>
              <Button
                label="Add link"
                icon="insert_link"
                onClick={() => addLink()}
              />
            </div>
          </ListItem>
        </List>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
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
            value={
              autoManage
                ? !category
                  ? props.defaultSavePath
                  : props.categories.find((cat) => cat.name === category)
                      ?.savePath
                  ? props.categories.find((cat) => cat.name === category)
                      ?.savePath
                  : `${props.defaultSavePath}${category}`
                : savePath
            }
            disabled={autoManage}
            onChange={(evt) => setSavePath(evt.currentTarget.value)}
          />
          <Select
            className="server-dashboard-add-torrent-category-select"
            enhanced
            label="Category"
            icon="category"
            options={props.categories.map((category) => category.name)}
            value={category}
            onChange={(evt: any) => setCategory(evt.currentTarget.value)}
          />
          <TextField
            label="Link Download Cookie"
            icon="fingerprint"
            value={cookie}
            style={{ marginTop: "10px" }}
            onChange={(evt) => setCookie(evt.currentTarget.value)}
          />
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
            trailingIcon={
              downloadLimit > 0
                ? {
                    icon: "clear",
                    tabIndex: 0,
                    onClick: () => setDownloadLimit(0),
                  }
                : {}
            }
            limit={downloadLimit}
            setLimit={setDownloadLimit}
            style={{ marginTop: "5px" }}
          />
          <SpeedLimitTextField
            label="Upload Speed Limit"
            icon="vertical_align_top"
            trailingIcon={
              uploadLimit > 0
                ? {
                    icon: "clear",
                    tabIndex: 0,
                    onClick: () => setUploadLimit(0),
                  }
                : {}
            }
            limit={uploadLimit}
            setLimit={setUploadLimit}
            style={{ marginTop: "10px" }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <DialogButton action="close">Cancel</DialogButton>
        <DialogButton
          action="accept"
          isDefaultAction
          disabled={
            (links.length === 0 && files.length === 0) ||
            (!savePath && !autoManage)
          }
          onClick={() =>
            addTorrents(
              files,
              links,
              autoManage,
              savePath,
              category,
              cookie,
              torrentName,
              startTorrent,
              skipHashCheck,
              createSubfolder,
              downloadSeqOrder,
              downloadEdgeFirst,
              downloadLimit,
              uploadLimit
            )
          }
        >
          Add
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
}
