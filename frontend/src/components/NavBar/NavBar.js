import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Typography, Toolbar, Button } from "@material-ui/core";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
    textDecoration: "none",
    color: "white",
  },
  color: {
    backgroundColor: "#222831",
  },
  link: {
    textDecoration: "none",
  },
}));

const NavBar = () => {
  const classes = useStyles();

  return (
    <AppBar position='static'>
      <Toolbar className={classes.color}>
        <Link to={`/`} className={classes.title}>
          <Typography variant='h6'>Job Portal</Typography>
        </Link>
        <Link to={`/login`} className={classes.link}>
          <Button color='secondary'>Login</Button>
        </Link>
        <Link to={`/register`} className={classes.link}>
          <Button color='secondary'>Register</Button>
        </Link>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
