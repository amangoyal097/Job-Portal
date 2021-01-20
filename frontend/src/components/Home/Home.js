import "../../fonts/Fonts.css";
import React from "react";
import NavBar from "../NavBar/NavBar";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Grid } from "@material-ui/core/";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    backgroundImage: "white",
  },
  text: {
    fontFamily: "'Baloo Thambi 2', cursive",
    fontSize: "4rem",
    textAlign: "center",
  },
  mainText: {
    fontFamily: "Roboto",
    fontSize: "7rem",
    textAlign: "center",
  },
}));

const Home = () => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <NavBar />
      <Grid
        container
        justify='center'
        style={{
          height: "100%",
        }}
        alignItems='center'
      >
        <Grid item>
          <div className={classes.mainText}>Job Dekho</div>
          <div className={classes.text}>Find & Post Jobs</div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
