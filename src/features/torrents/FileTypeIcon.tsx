import React from "react";
import { FileTypeIconMap } from "./fileTypeIconMap";
import { FileIcon, FileIconProps } from "react-file-icon";

const FileTypeCategoryProps: { [key: string]: FileIconProps } = {
  archive: { color: "#ffb74d", type: "compressed" },
  zip: { color: "#ffb74d", type: "compressed" },
  audio: { color: "#ba68c8", type: "audio" },
  code: { color: "#e57373", type: "code" },
  xml: { color: "#ffb74d", type: "spreadsheet" },
  docx: { color: "#64b5f6", type: "document" },
  rtf: { color: "#64b5f6", type: "document" },
  exe: { color: "#90a4ae", type: "binary" },
  sysfile: { color: "#90a4ae", type: "binary" },
  font: { color: "#fff176", type: "font" },
  html: { color: "#e57373", type: "code" },
  model: { color: "#4db6ac", type: "3d" },
  pdf: { color: "#e57373", type: "acrobat" },
  photo: { color: "#e0e0e0", type: "image" },
  ppsx: { color: "#ff8a65", type: "presentation" },
  pptx: { color: "#ff8a65", type: "presentation" },
  potx: { color: "#ff8a65", type: "presentation" },
  presentation: { color: "#ff8a65", type: "presentation" },
  spreadsheet: { color: "#81c784", type: "spreadsheet" },
  txt: { color: "#e0e0e0", type: "document" },
  vector: { color: "#ffb74d", type: "vector" },
  video: { color: "#4fc3f7", type: "video" },
  vsdx: { color: "#7986cb", type: "spreadsheet" },
  vssx: { color: "#7986cb", type: "spreadsheet" },
  vstx: { color: "#7986cb", type: "spreadsheet" },
  xlsx: { color: "#81c784", type: "spreadsheet" },
  xltx: { color: "#81c784", type: "spreadsheet" },
  generic: { color: "#e0e0e0" },
};

let _extensionsCategories: { [key: string]: string };

export interface FileTypeIconProps {
  extension: string;
}

const iconCategoryForExtension = (extension: string): string => {
  if (!_extensionsCategories) {
    _extensionsCategories = {};

    for (const iconName in FileTypeIconMap) {
      if (FileTypeIconMap.hasOwnProperty(iconName)) {
        const extensions = FileTypeIconMap[iconName].extensions;

        if (extensions) {
          for (let i = 0; i < extensions.length; i++) {
            _extensionsCategories[extensions[i]] = iconName;
          }
        }
      }
    }
  }

  extension = extension.replace(".", "").toLowerCase();

  return _extensionsCategories[extension] || "generic";
};

const iconPropsForExtension = (extension: string): FileIconProps => {
  const category = iconCategoryForExtension(extension);

  return FileTypeCategoryProps[category];
};

export function FileTypeIcon(props: FileTypeIconProps) {
  const extension = props.extension.replace(".", "").toLowerCase();

  return (
    <FileIcon extension={extension} {...iconPropsForExtension(extension)} />
  );
}
