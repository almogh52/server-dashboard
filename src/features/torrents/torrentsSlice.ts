import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store";
import axios from "axios";

export enum TorrentState {
  Error,
  Completed,
  Paused,
  Queued,
  Seeding,
  Stalled,
  Checking,
  Downloading,
  FetchingMetadata,
  Allocating,
  Moving,
  Unknown,
  MissingFiles,
}

export interface Torrent {
  hash: string;
  addDate: Date;
  completionDate: Date;
  bytesDownloaded: number;
  bytesDownloadedSession: number;
  downloadLimit: number;
  uploadLimit: number;
  eta: number;
  forceStart: boolean;
  magnetUri: string;
  name: string;
  priority: number;
  progress: number;
  savePath: string;
  size: number;
  state: TorrentState;
  downloadSpeed: number;
  downloadSpeedAvg: number;
  uploadSpeed: number;
  uploadSpeedAvg: number;
  bytesUploaded: number;
  bytesUploadedSession: number;
  timeActive: number;
  creationDate: Date;
  creatorComment: string;
  createdBy: string;
  connections: number;
  connectionsLimit: number;
  peers: number;
  totalPeers: number;
  seeds: number;
  totalSeeds: number;
  piecesDownloaded: number;
  totalPieces: number;
  pieceSize: number;
}

export enum TorrentFilePriority {
  SkipDownload = 0,
  Normal = 1,
  Mixed = 3,
  High = 6,
  Maximum = 7,
}

export interface TorrentFile {
  name: string;
  priority: TorrentFilePriority;
  progress: number;
  size: number;
  availability: number;
}

interface TorrentsState {
  applicationName: string;
  torrents: Array<Torrent>;
  torrentsFiles: { [key: string]: Array<TorrentFile> };
}

const initialState: TorrentsState = {
  applicationName: "",
  torrents: [],
  torrentsFiles: {},
};

export const torrentsSlice = createSlice({
  name: "torrents",
  initialState,
  reducers: {
    setApplicationName: (state, action: PayloadAction<string>) => {
      state.applicationName = action.payload;
    },
    setTorrents: (state, action: PayloadAction<Array<Torrent>>) => {
      action.payload.sort((a, b) => {
        if (a.priority === 0) {
          return 1;
        } else if (b.priority === 0) {
          return -1;
        }

        return a.priority - b.priority;
      });
      state.torrents = action.payload;
    },
    setTorrentFiles: (
      state,
      action: PayloadAction<{
        torrentHash: string;
        torrentFiles: Array<TorrentFile>;
      }>
    ) => {
      state.torrentsFiles[action.payload.torrentHash] =
        action.payload.torrentFiles;
    },
  },
});

export const fetchApplicationName = (): AppThunk => (dispatch) => {
  axios
    .get("/api/qbittorrent/applicationName")
    .then((res) =>
      dispatch(torrentsSlice.actions.setApplicationName(res.data as string))
    )
    .catch(() => {});
};

export const fetchTorrentsAsync = (): AppThunk => (dispatch) => {
  axios
    .get("/api/qbittorrent/torrents")
    .then((res) =>
      dispatch(torrentsSlice.actions.setTorrents(res.data as Array<Torrent>))
    )
    .catch(() => {});
};

export const fetchTorrentFilesAsync = (torrentHash: string): AppThunk => (
  dispatch
) => {
  axios
    .get(`/api/qbittorrent/torrent/${torrentHash}/files`)
    .then((res) =>
      dispatch(
        torrentsSlice.actions.setTorrentFiles({
          torrentHash,
          torrentFiles: res.data as Array<TorrentFile>,
        })
      )
    )
    .catch(() => {});
};

export const selectApplicationName = (state: RootState) =>
  state.torrents.applicationName;
export const selectTorrents = (state: RootState) => state.torrents.torrents;
export const selectTorrentFiles = (torrentHash: string) => (state: RootState) =>
  state.torrents.torrentsFiles[torrentHash];

export default torrentsSlice.reducer;
