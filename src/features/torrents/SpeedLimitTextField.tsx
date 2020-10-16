import React from "react";

import { TextField, TextFieldProps, TextFieldHTMLProps } from "@rmwc/textfield";
import "@rmwc/textfield/styles";

export interface SpeedLimitTextFieldProps {
  limit: number;
  setLimit: (limit: number) => void;
}

export function SpeedLimitTextField(
  props: SpeedLimitTextFieldProps & TextFieldProps & TextFieldHTMLProps
) {
  const { limit, setLimit, ...textFieldProps } = props;

  return (
    <TextField
      {...textFieldProps}
      value={limit <= 0 ? "No limit" : `${limit} kB/s`}
      onChange={(evt) =>
        setLimit(parseInt(evt.currentTarget.value.replace(/\D+/g, "")))
      }
    />
  );
}
