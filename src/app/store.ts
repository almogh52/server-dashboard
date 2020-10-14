import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import torrentsReducer from "../features/torrents/torrentsSlice";

export const store = configureStore({
  reducer: {
    torrents: torrentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
