import "../../fonts/Fonts.css";
import React, { useState } from "react";
import NavBar from "../NavBar/NavBar";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import { FaGoogle } from "react-icons/fa";

import { Box, Grid, TextField, Container, Button } from "@material-ui/core/";
const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    backgroundImage: "white",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  field: {
    textAlign: "center",
  },
  input: {
    marginTop: "0.5rem",
    marginBottom: "1rem",
    width: "100%",
    margin: "auto",
  },
  heading: {
    fontSize: "2.5rem",
    fontFamily: "'Baloo Thambi 2', cursive ",
  },
}));

const Login = (props) => {
  const classes = useStyles();
  const [loginInfo, setloginInfo] = useState({
    username: "",
    password: "",
  });
  const [gotResponse, setGotResponse] = useState(false);
  const [isUserEmpty, setUserEmpty] = useState(false);
  const [isPassEmpty, setPassEmpty] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setloginInfo((prevValues) => {
      return {
        ...prevValues,
        [name]: value,
      };
    });
  }

  function googleSignIn() {
    window.location.href = "http://localhost:8080/auth/google";
  }

  function addUser() {
    if (loginInfo.username === "") setUserEmpty(true);
    else setUserEmpty(false);
    if (loginInfo.password === "") setPassEmpty(true);
    else setPassEmpty(false);
    if (loginInfo.username === "" || loginInfo.password === "") return;
    axios({
      method: "post",
      url: "http://localhost:8080/login",
      headers: { "Content-Type": "application/json" },
      data: loginInfo,
    })
      .then((response) => {
        if (response.data === "Success") {
          props.history.push("/user");
        } else {
          alert("Failed to login");
          console.log(response.data);
          props.history.push("/login");
        }
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to login");
        props.history.push("/login");
      });
  }
  axios.defaults.withCredentials = true;
  axios
    .get("http://localhost:8080/isLoggedIn")
    .then((response) => {
      setGotResponse(true);
      if (response.data === "Yes") props.history.push("/user");
    })
    .catch((err) => setGotResponse(true));
  if (gotResponse)
    return (
      <Box className={classes.root}>
        <NavBar />
        <Container
          maxwidth='xs'
          style={{
            height: "100%",
            width: 500,
            maxWidth: "100%",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "10%",
          }}
        >
          <Grid container className={classes.container}>
            <h1 className={classes.heading}>Login</h1>
            <Grid item xs={12} className={classes.field}>
              <TextField
                error={isUserEmpty}
                inputProps={{
                  autoComplete: "new-password",
                }}
                className={classes.input}
                name='username'
                label='Username'
                value={loginInfo.username}
                onChange={handleChange}
                helperText='Please Enter username'
              ></TextField>
            </Grid>
            <Grid item xs={12} className={classes.field}>
              <TextField
                error={isPassEmpty}
                className={classes.input}
                name='password'
                label='Password'
                value={loginInfo.password}
                type='password'
                onChange={handleChange}
                helperText='Please Enter Password'
              ></TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant='contained'
                color='primary'
                fullWidth
                onClick={addUser}
                style={{
                  paddingTop: "1rem",
                  paddingBottom: "1rem",
                  margin: "20px 0px 20px 0px",
                }}
              >
                Submit
              </Button>

              <Button
                onClick={googleSignIn}
                style={{
                  width: "100%",
                  paddingTop: "1rem",
                  paddingBottom: "1rem",
                  background: "#f14233",
                  color: "white",
                }}
              >
                <FaGoogle
                  style={{
                    fontSize: "1.5rem",
                    paddingRight: "1rem",
                  }}
                />
                Sign In With Google
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  else return <div>Loading...</div>;
};

export default Login;
