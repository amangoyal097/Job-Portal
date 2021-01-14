import React from "react";
import { Paper, Grid, IconButton } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
const ShowInstance = (props) => {
  return (
    <Paper style={{ width: 200 }}>
      <Grid container>
        <Grid item>{props.data.instituteName}</Grid>
      </Grid>
      <Grid>
        <Grid item xs={6} sm={6}>
          {props.data.startYear}-
          {props.data.endYear === 0 ? "Present" : props.data.endYear}
        </Grid>
        <Grid item xs={6} sm={6}>
          <IconButton onClick={() => props.deleteEdu(props.data)}>
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ShowInstance;
