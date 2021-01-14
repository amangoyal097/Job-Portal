import React from "react";
import NavBar from "../NavBar/NavBar";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core/";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    backgroundColor: "#222831",
  },
}));

const Home = () => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <NavBar />
      <h1>Get your Dream Job Here!</h1>
    </Box>
  );
};

export default Home;
