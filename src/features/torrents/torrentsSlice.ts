import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store";
import axios from "axios";

import { Torrent, TorrentFile, Category, Preferences } from "./torrentsTypes";

interface TorrentsState {
  applicationInfo: string;
  preferences: Preferences;
  categories: Array<Category>;
  torrents: Array<Torrent>;
  torrentsFiles: { [key: string]: Array<TorrentFile> };
}

const initialState: TorrentsState = {
  applicationInfo: "",
  preferences: {} as Preferences,
  categories: [],
  torrents: [],
  torrentsFiles: {},
};

export const torrentsSlice = createSlice({
  name: "torrents",
  initialState,
  reducers: {
    setApplicationInfo: (state, action: PayloadAction<string>) => {
      state.applicationInfo = action.payload;
    },
    setPreferences: (state, action: PayloadAction<Preferences>) => {
      state.preferences = action.payload;
    },
    setCategories: (state, action: PayloadAction<Array<Category>>) => {
      state.categories = action.payload;
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

export const fetchApplicationInfo = (): AppThunk => (dispatch) => {
  axios
    .get("/api/qbittorrent/application/info")
    .then((res) =>
      dispatch(torrentsSlice.actions.setApplicationInfo(res.data as string))
    )
    .catch(() => {});
};

export const fetchPreferences = (): AppThunk => (dispatch) => {
  axios
    .get("/api/qbittorrent/application/preferences")
    .then((res) =>
      dispatch(torrentsSlice.actions.setPreferences(res.data as Preferences))
    )
    .catch(() => {});
};

export const fetchCategories = (): AppThunk => (dispatch) => {
  axios
    .get("/api/qbittorrent/categories")
    .then((res) =>
      dispatch(torrentsSlice.actions.setCategories(res.data as Array<Category>))
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

export const selectApplicationInfo = (state: RootState) =>
  state.torrents.applicationInfo;
export const selectPreferences = (state: RootState) =>
  state.torrents.preferences;
export const selectCategories = (state: RootState) => state.torrents.categories;
export const selectTorrents = (state: RootState) => state.torrents.torrents;
export const selectTorrentFiles = (torrentHash: string) => (state: RootState) =>
  state.torrents.torrentsFiles[torrentHash];

export default torrentsSlice.reducer;
