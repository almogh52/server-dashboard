import React from "react";
import { Torrent, TorrentState, TorrentFile } from "./torrentsTypes";
import { setFilePriority, renameFileAction } from "./TorrentFileActions";

import { TorrentActions } from "./TorrentActions";
import { TorrentContents } from "./TorrentContents";

import { CardPrimaryAction } from "@rmwc/card";
import "@rmwc/card/styles";

import { Typography } from "@rmwc/typography";
import "@rmwc/typography/styles";

import { ListDivider } from "@rmwc/list";
import "@rmwc/list/styles";

import prettyBytes from "pretty-bytes";
import humanizeDuration from "humanize-duration";
import dateFormat from "dateformat";

export interface TorrentDetailsProps {
  torrent: Torrent;
  torrentFiles: Array<TorrentFile>;
  hidden?: boolean;
}

export function TorrentDetails(props: TorrentDetailsProps) {
  const completed =
    props.torrent.state === TorrentState.Completed ||
    (props.torrent.totalPieces > 0 &&
      props.torrent.bytesDownloaded >= props.torrent.size);

  if (props.hidden) {
    return null;
  }

  return (
    <>
      <ListDivider />

      <div style={{ width: "100%" }}>
        <Typography
          use="subtitle1"
          tag="div"
          style={{ padding: "0.5rem 1rem" }}
          theme="textSecondaryOnBackground"
        >
          Torrent Actions
        </Typography>

        <ListDivider />

        <TorrentActions torrent={props.torrent} />

        <ListDivider />

        <Typography
          use="subtitle1"
          tag="div"
          style={{ padding: "0.5rem 1rem" }}
          theme="textSecondaryOnBackground"
        >
          Torrent Info
        </Typography>

        <ListDivider />

        <CardPrimaryAction>
          <div className="server-dashboard-torrent-detail">
            <div
              className="server-dashboard-torrent-detail-group"
              style={{ alignItems: "start" }}
            >
              <Typography use="body2">
                <b>Hash: </b>
                {props.torrent.hash}
              </Typography>

              <Typography use="body2">
                <b>Size: </b>
                {prettyBytes(props.torrent.size)}
              </Typography>

              <Typography use="body2">
                <b>Added On: </b>
                {dateFormat(props.torrent.addDate)}
              </Typography>
            </div>

            <div
              className="server-dashboard-torrent-detail-group"
              style={{ alignItems: "start" }}
            >
              <Typography use="body2">
                <b>Save Path: </b>
                {props.torrent.savePath}
              </Typography>

              <Typography use="body2">
                <b>Pieces: </b>
                {props.torrent.totalPieces > 0 ? `${props.torrent.totalPieces} x ${prettyBytes(
                  props.torrent.pieceSize
                )} (${props.torrent.piecesDownloaded} downloaded)` : ""}
              </Typography>

              <Typography use="body2">
                <b>Completed On: </b>
                {completed
                  ? dateFormat(props.torrent.completionDate)
                  : "Still downloading.."}
              </Typography>
            </div>

            <div
              className="server-dashboard-torrent-detail-group"
              style={{ alignItems: "start" }}
            >
              <Typography use="body2">
                <b>Created By: </b>
                {props.torrent.createdBy}
              </Typography>

              <Typography use="body2">
                <b>Creator Comment: </b>
                {props.torrent.creatorComment}
              </Typography>

              <Typography use="body2">
                <b>Created On: </b>
                {dateFormat(props.torrent.creationDate)}
              </Typography>
            </div>
          </div>
        </CardPrimaryAction>

        <ListDivider />

        <Typography
          use="subtitle1"
          tag="div"
          style={{ padding: "0.5rem 1rem" }}
          theme="textSecondaryOnBackground"
        >
          Transfer Info
        </Typography>

        <ListDivider />

        <CardPrimaryAction>
          <div className="server-dashboard-torrent-detail">
            <div
              className="server-dashboard-torrent-detail-group"
              style={{ alignItems: "start" }}
            >
              <Typography use="body2">
                <b>Time Active: </b>
                {humanizeDuration(props.torrent.timeActive * 1000, {
                  round: true,
                  largest: 2,
                })}
              </Typography>

              <Typography use="body2">
                <b>Downloaded: </b>
                {`${prettyBytes(props.torrent.bytesDownloaded)} (${prettyBytes(
                  props.torrent.bytesDownloadedSession
                )} this session)`}
              </Typography>

              <Typography use="body2">
                <b>Download Speed: </b>
                {`${prettyBytes(props.torrent.downloadSpeed)}/s (${prettyBytes(
                  props.torrent.downloadSpeedAvg
                )}/s avg.)`}
              </Typography>

              <Typography use="body2">
                <b>Download Limit: </b>
                {props.torrent.downloadLimit > 0
                  ? `${prettyBytes(props.torrent.downloadLimit)}/s`
                  : "No Limit"}
              </Typography>
            </div>

            <div
              className="server-dashboard-torrent-detail-group"
              style={{ alignItems: "start" }}
            >
              <Typography use="body2">
                <b>ETA: </b>
                {props.torrent.state === TorrentState.Downloading
                  ? humanizeDuration(props.torrent.eta * 1000, {
                      round: true,
                      largest: 2,
                    })
                  : props.torrent.state === TorrentState.Completed ||
                    props.torrent.bytesDownloaded >= props.torrent.size
                  ? "Completed"
                  : "No ETA"}
              </Typography>

              <Typography use="body2">
                <b>Uploaded: </b>
                {`${prettyBytes(props.torrent.bytesUploaded)} (${prettyBytes(
                  props.torrent.bytesUploadedSession
                )} this session)`}
              </Typography>

              <Typography use="body2">
                <b>Upload Speed: </b>
                {`${prettyBytes(props.torrent.uploadSpeed)}/s (${prettyBytes(
                  props.torrent.uploadSpeedAvg
                )}/s avg.)`}
              </Typography>

              <Typography use="body2">
                <b>Upload Limit: </b>
                {props.torrent.uploadLimit > 0
                  ? `${prettyBytes(props.torrent.uploadLimit)}/s`
                  : "No Limit"}
              </Typography>
            </div>

            <div
              className="server-dashboard-torrent-detail-group"
              style={{ alignItems: "start" }}
            >
              <Typography use="body2">
                <b>Connections: </b>
                {`${props.torrent.connections} (${props.torrent.connectionsLimit} max)`}
              </Typography>

              <Typography use="body2">
                <b>Seeds: </b>
                {`${props.torrent.seeds} (${props.torrent.totalSeeds} total)`}
              </Typography>

              <Typography use="body2">
                <b>Peers: </b>
                {`${props.torrent.peers} (${props.torrent.totalPeers} total)`}
              </Typography>
            </div>
          </div>
        </CardPrimaryAction>

        <ListDivider />

        <Typography
          use="subtitle1"
          tag="div"
          style={{ padding: "0.5rem 1rem" }}
          theme="textSecondaryOnBackground"
        >
          Torrent Contents
        </Typography>

        <ListDivider />

        <TorrentContents
          torrentHash={props.torrent.hash}
          torrentCompleted={completed}
          contents={props.torrentFiles}
          setPriority={(paths, priority) =>
            setFilePriority(
              props.torrent.hash,
              props.torrentFiles,
              paths,
              priority
            )
          }
          renameAction={(path) =>
            renameFileAction(props.torrent.hash, props.torrentFiles, path)
          }
        />

        <ListDivider />
      </div>
    </>
  );
}
