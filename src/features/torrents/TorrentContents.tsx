import React, { useState } from "react";
import "./TorrentContents.css";
import { TorrentFile, TorrentFilePriority } from "./torrentsSlice";

import {
  List,
  ListItem,
  ListItemGraphic,
  ListItemMeta,
  ListDivider,
  CollapsibleList,
} from "@rmwc/list";
import "@rmwc/list/styles";

import { Typography } from "@rmwc/typography";
import "@rmwc/typography/styles";

import { LinearProgress } from "@rmwc/linear-progress";
import "@rmwc/linear-progress/styles";

import { ThemeProvider } from "@rmwc/theme";
import "@rmwc/theme/styles";

import { Elevation } from "@rmwc/elevation";
import "@rmwc/elevation/styles";

import { Checkbox } from "@rmwc/checkbox";
import "@rmwc/checkbox/styles";

import {
  ContextMenuWrapper,
  useContextMenuEvent,
  useContextMenuTrigger,
} from "react-context-menu-wrapper";

import { FileTypeIcon } from "./FileTypeIcon";

import prettyBytes from "pretty-bytes";

enum Selection {
  NotSelected,
  PartlySelected,
  Selected,
}

type ContentsTree = {
  path: string;
  priority: TorrentFilePriority;
  progress: number;
  size: number;
  availability: number;
  tree: { [key: string]: TorrentFile | ContentsTree };
};

export interface TorrentContentsProps {
  torrentHash: string;
  torrentCompleted: boolean;
  contents: Array<TorrentFile>;

  renameAction: (path: string) => void;
  setPriority: (
    paths: Array<{ path: string; dir: boolean }>,
    priority: TorrentFilePriority
  ) => void;
}

interface TorrentDirProps {
  torrentHash: string;
  torrentCompleted: boolean;
  tree: ContentsTree;
  selectedPaths: Array<string>;

  selectPath: (path: string, dir: boolean) => void;
  deselectPath: (path: string, dir: boolean) => void;
}

interface DirItemProps {
  name: string;
  fullPath: string;
  priority: TorrentFilePriority;
  progress: number;
  size: number;
  availability: number;
  torrentHash: string;
  torrentCompleted: boolean;
  selectedPaths: Array<string>;
  selected: Selection;
  dir?: boolean;

  onClick?: React.MouseEventHandler<HTMLElement>;

  selectPath: (path: string, dir: boolean) => void;
  deselectPath: (path: string, dir: boolean) => void;
}

interface DirItemContextMenuProps {
  renameAction: (path: string) => void;
  setPriority: (
    paths: Array<{ path: string; dir: boolean }>,
    priority: TorrentFilePriority
  ) => void;
}

function isAFile(object: TorrentFile | ContentsTree): object is TorrentFile {
  return "name" in object;
}

const calculateSelection = (
  selectedPaths: Array<string>,
  path: string,
  dir: boolean
): Selection => {
  let selected = 0;
  let notSelected = 0;

  selectedPaths.forEach((selectPath) => {
    if (
      selectPath[0] === "~" &&
      (dir
        ? selectPath.substr(1).startsWith(path)
        : selectPath.substr(1) === path)
    ) {
      notSelected++;
    } else if (
      selectPath[0] !== "~" &&
      (dir ? selectPath.startsWith(path) : selectPath === path)
    ) {
      selected++;
    }
  });

  if (notSelected === 0 && selected > 0) {
    return Selection.Selected;
  } else if (notSelected > 0 && selected > 0) {
    return Selection.PartlySelected;
  } else {
    return Selection.NotSelected;
  }
};

const calculateTreeStats = (contentsTree: ContentsTree): void => {
  Object.entries(contentsTree.tree).forEach(([, value]) => {
    if (!isAFile(value)) {
      calculateTreeStats(value as ContentsTree);
    }

    contentsTree.size += value.size;
  });

  Object.entries(contentsTree.tree).forEach(([, value]) => {
    const element_impact = value.size / contentsTree.size;

    if (contentsTree.priority === -1) {
      contentsTree.priority = value.priority;
    } else if (
      contentsTree.priority !== value.priority &&
      contentsTree.priority !== TorrentFilePriority.Mixed
    ) {
      contentsTree.priority = TorrentFilePriority.Mixed;
    }

    contentsTree.progress += value.progress * element_impact;
    contentsTree.availability += value.availability * element_impact;
  });
};

const createContentsTree = (contents: Array<TorrentFile>): ContentsTree => {
  let contentsTree: ContentsTree = {
    path: "",
    priority: -1,
    progress: 0,
    size: 0,
    availability: 0,
    tree: {},
  };

  if (!contents) {
    return contentsTree;
  }

  contents.forEach((file) => {
    const tokens: Array<string> = file.name.split(/[\\/]+/);

    let currentTree: ContentsTree = contentsTree;

    tokens.forEach((element, index) => {
      if (index === tokens.length - 1) {
        currentTree.tree[element] = file;
      } else {
        if (!(element in currentTree.tree)) {
          currentTree.tree[element] = {
            path: `${currentTree.path}${element}/`,
            priority: -1,
            progress: 0,
            size: 0,
            availability: 0,
            tree: {},
          };
        }

        currentTree = currentTree.tree[element] as ContentsTree;
      }
    });
  });

  calculateTreeStats(contentsTree);

  return contentsTree;
};

function DirItemContextMenu(props: DirItemContextMenuProps) {
  const [priorityOpen, setPriorityOpen] = useState(false);

  const menuEvent = useContextMenuEvent();
  if (!menuEvent || !menuEvent.data) return null;

  const openedAbove = (menuEvent.clientY as number) + 305 > window.innerHeight;

  const paths = menuEvent.data.paths as Array<{ path: string; dir: boolean }>;
  const torrentCompleted = menuEvent.data.torrentCompleted as boolean;

  const showRename = paths && paths.length === 1 && !paths[0].dir;
  const showPriority = paths && !torrentCompleted;

  if (!showRename && !showPriority) {
    return null;
  }

  return (
    <div
      style={{
        height: "305px",
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
        <List style={{ width: "100%", marginRight: "20px" }}>
          {showRename ? (
            <ListItem onClick={() => props.renameAction(paths[0].path)}>
              <ListItemGraphic style={{ color: "#00c853" }} icon="edit" />
              Rename
            </ListItem>
          ) : null}

          {showRename && showPriority ? <ListDivider /> : null}

          {showPriority ? (
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
                onClick={() =>
                  props.setPriority(paths, TorrentFilePriority.SkipDownload)
                }
              >
                <ListItemGraphic style={{ color: "#b61431" }} icon="clear" />
                Skip Download
              </ListItem>

              <ListItem
                onClick={() =>
                  props.setPriority(paths, TorrentFilePriority.Normal)
                }
              >
                <ListItemGraphic style={{ color: "#9e9d24" }} icon="remove" />
                Normal
              </ListItem>

              <ListItem
                onClick={() =>
                  props.setPriority(paths, TorrentFilePriority.High)
                }
              >
                <ListItemGraphic
                  style={{ color: "#ff8f00" }}
                  icon="priority_high"
                />
                High
              </ListItem>

              <ListItem
                className="server-dashboard-list-item-icon-rotate-180deg"
                onClick={() =>
                  props.setPriority(paths, TorrentFilePriority.Maximum)
                }
              >
                <ListItemGraphic
                  style={{ color: "#d84315" }}
                  icon="low_priority"
                />
                Maximum
              </ListItem>
            </CollapsibleList>
          ) : null}
        </List>
      </Elevation>
    </div>
  );
}

function DirItem(props: DirItemProps) {
  const [open, setOpen] = useState(false);

  const mappedSelectedPaths = props.selectedPaths
    .filter((path) => path[0] !== "~")
    .map((path) => ({ path, dir: false }));
  const paths =
    mappedSelectedPaths.length > 0
      ? mappedSelectedPaths
      : !(props.dir && props.torrentCompleted)
      ? [{ path: props.fullPath, dir: props.dir || false }]
      : [];

  const contextMenuId = `server-dashboard-torrent-files-context-menu-${props.torrentHash}`;
  const itemRef = useContextMenuTrigger({
    menuId: contextMenuId,
    data: {
      paths,
      torrentCompleted: props.torrentCompleted,
    },
  });

  return (
    <ListItem
      ref={
        props.selected !== Selection.NotSelected ||
        paths.find(
          ({ path, dir }) =>
            path === props.fullPath && dir === (props.dir || false)
        )
          ? itemRef
          : null
      }
      activated={props.selected !== Selection.NotSelected}
      onClick={(evt) => {
        evt.stopPropagation();

        setOpen(!open);

        if (props.onClick) {
          props.onClick(evt);
        }
      }}
      style={{ height: "75px", display: "flex" }}
    >
      <Checkbox
        checked={props.selected === Selection.Selected}
        indeterminate={props.selected === Selection.PartlySelected}
        onChange={(evt) =>
          evt.currentTarget.checked
            ? props.selectPath(props.fullPath, props.dir || false)
            : props.deselectPath(props.fullPath, props.dir || false)
        }
        onClick={(evt) => evt.stopPropagation()}
        style={{ marginRight: "18px" }}
      />
      <ListItemGraphic
        style={{ width: "32px", height: "32px", fontSize: "32px" }}
        icon={
          props.dir ? (
            open ? (
              "folder_open"
            ) : (
              "folder"
            )
          ) : (
            <FileTypeIcon
              extension={props.name.split(".").pop() || "generic"}
            />
          )
        }
      />
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Typography use="subtitle2" style={{ margin: "5px 5px 0px 5px" }}>
          {props.name}
        </Typography>
        <div
          style={{
            padding: "5px 5px 0 5px",
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Typography use="body2" style={{ width: "20%" }}>
            <b>Size: </b>
            {prettyBytes(props.size)}
          </Typography>
          <Typography use="body2" style={{ width: "20%" }}>
            <b>Progress: </b>
            {(props.progress * 100).toFixed(2)}%
          </Typography>
          <Typography use="body2" style={{ width: "20%" }}>
            <b>Priority: </b>
            {TorrentFilePriority[props.priority]
              .replace(/([A-Z])/g, " $1")
              .trim()}
          </Typography>
          <Typography use="body2" style={{ width: "20%" }}>
            <b>Remaining: </b>
            {prettyBytes(props.size * (1 - props.progress))}
          </Typography>
          <Typography use="body2" style={{ width: "20%" }}>
            <b>Availability: </b>
            {props.availability >= 0
              ? `${(props.availability * 100).toFixed(2)}%`
              : "N/A"}
          </Typography>
          <ListItemMeta
            icon="chevron_right"
            style={{ opacity: props.dir ? "1" : "0" }}
          />
        </div>
        <ThemeProvider
          options={props.progress === 1 ? { primary: "#00c853" } : {}}
          style={{ width: "100%" }}
        >
          <LinearProgress
            progress={props.progress}
            buffer={1}
            style={{ width: "100%", margin: "10px 0 8px 0" }}
          />
        </ThemeProvider>
      </div>
    </ListItem>
  );
}

function TorrentDir(props: TorrentDirProps) {
  return (
    <>
      {Object.entries(props.tree.tree)
        .sort(([, value1], [, value2]) =>
          isAFile(value1) ? (isAFile(value2) ? 0 : 1) : isAFile(value2) ? -1 : 0
        )
        .map(([key, value]) =>
          isAFile(value) ? (
            <DirItem
              key={value.name}
              name={key}
              fullPath={value.name}
              priority={value.priority}
              progress={value.progress}
              size={value.size}
              availability={value.availability}
              torrentHash={props.torrentHash}
              torrentCompleted={props.torrentCompleted}
              selectedPaths={props.selectedPaths}
              selected={calculateSelection(
                props.selectedPaths,
                value.name,
                false
              )}
              selectPath={props.selectPath}
              deselectPath={props.deselectPath}
            />
          ) : (
            <CollapsibleList
              key={value.path}
              handle={
                <DirItem
                  key={value.path}
                  name={key}
                  fullPath={value.path}
                  priority={value.priority}
                  progress={value.progress}
                  size={value.size}
                  availability={value.availability}
                  torrentHash={props.torrentHash}
                  torrentCompleted={props.torrentCompleted}
                  selectedPaths={props.selectedPaths}
                  selected={calculateSelection(
                    props.selectedPaths,
                    value.path,
                    true
                  )}
                  selectPath={props.selectPath}
                  deselectPath={props.deselectPath}
                  dir
                />
              }
            >
              <TorrentDir
                torrentHash={props.torrentHash}
                torrentCompleted={props.torrentCompleted}
                tree={value as ContentsTree}
                selectedPaths={props.selectedPaths}
                selectPath={props.selectPath}
                deselectPath={props.deselectPath}
              />
            </CollapsibleList>
          )
        )}
    </>
  );
}

export function TorrentContents(props: TorrentContentsProps) {
  const contentsTree = createContentsTree(props.contents);
  const contextMenuId = `server-dashboard-torrent-files-context-menu-${props.torrentHash}`;

  const [selectedPaths, setSelectedPaths] = useState<Array<string>>(
    props.contents.map((file) => `~${file.name}`)
  );

  return (
    <>
      <List>
        <TorrentDir
          torrentHash={props.torrentHash}
          torrentCompleted={props.torrentCompleted}
          tree={contentsTree}
          selectedPaths={selectedPaths}
          selectPath={(path, dir) =>
            setSelectedPaths(
              selectedPaths.map((selectPath) => {
                if (
                  selectPath[0] === "~" &&
                  (dir
                    ? selectPath.substr(1).startsWith(path)
                    : selectPath.substr(1) === path)
                ) {
                  return selectPath.substr(1);
                } else {
                  return selectPath;
                }
              })
            )
          }
          deselectPath={(path, dir) =>
            setSelectedPaths(
              selectedPaths.map((selectPath) => {
                if (
                  selectPath[0] !== "~" &&
                  (dir ? selectPath.startsWith(path) : selectPath === path)
                ) {
                  return `~${selectPath}`;
                } else {
                  return selectPath;
                }
              })
            )
          }
        />
      </List>
      <ContextMenuWrapper id={contextMenuId}>
        <DirItemContextMenu
          renameAction={props.renameAction}
          setPriority={props.setPriority}
        />
      </ContextMenuWrapper>
    </>
  );
}
