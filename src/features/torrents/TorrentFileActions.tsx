import React from "react";

import { TorrentFile, TorrentFilePriority } from "./torrentsSlice";

import axios from "axios";
import { dialogQueue } from "../../dialogQueue";
import { snackbarQueue } from "../../snackbarQueue";

import { TextField } from "@rmwc/textfield";
import "@rmwc/textfield/styles";

export const setFilePriority = (
  torrentHash: string,
  files: Array<TorrentFile>,
  paths: Array<{ path: string; dir: boolean }>,
  priority: TorrentFilePriority
): void => {
  let filesIds: Set<number> = new Set<number>();

  files.forEach((file, id) => {
    paths.forEach(({ path, dir }) => {
      if (
        (dir ? file.name.startsWith(path) : file.name === path) &&
        file.priority !== priority
      ) {
        filesIds.add(id);
      }
    });
  });

  if (filesIds.size > 0) {
    axios
      .post(`/api/qbittorrent/torrent/${torrentHash}/setFilesPriority`, {
        ids: Array.from(filesIds),
        priority,
      })
      .catch(() => {});
  }
};

export const renameFileAction = async (
  torrentHash: string,
  files: Array<TorrentFile>,
  path: string
): Promise<void> => {
  let pathTokens = path.split(/[\\/]+/);
  const originalName = pathTokens[pathTokens.length - 1];

  let name = originalName;

  await dialogQueue
    .confirm({
      title: <b>Rename File</b>,
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
    .then((set) => {
      if (!set) {
        name = originalName;
      }
    });

  if (name !== originalName) {
    files.forEach((file, id) => {
      if (file.name === path) {
        axios
          .post(`/api/qbittorrent/torrent/${torrentHash}/renameFile`, {
            id: id,
            name: name,
          })
          .then(() =>
            snackbarQueue.notify({
              title: <b>File Renamed</b>,
              body: `The file '${originalName}' has been renamed to '${name}'!`,
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
              title: <b>Rename File</b>,
              body: "Invalid name!",
            })
          );
      }
    });
  }
};
