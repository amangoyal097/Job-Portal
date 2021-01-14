import React from "react";
import { Chip } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const ShowSkills = (props) => {
  return (
    <Chip
      label={props.data}
      clickable
      color='primary'
      style={{ width: 100, fontSize: 15 }}
      onDelete={() => props.deleteSkill(props.data)}
      deleteIcon={<CloseIcon />}
    />
  );
};

export default ShowSkills;
