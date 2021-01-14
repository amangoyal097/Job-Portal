import React, { useState } from "react";
import NavBar from "../NavBar/NavBar";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Grid,
  TextField,
  Paper,
  Container,
  Button,
} from "@material-ui/core/";
const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    backgroundColor: "#222831",
  },
}));

const Login = (props) => {
  const classes = useStyles();
  const [loginInfo, setloginInfo] = useState({
    username: "",
    password: "",
  });
  const [gotResponse, setGotResponse] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setloginInfo((prevValues) => {
      return {
        ...prevValues,
        [name]: value,
      };
    });
  }
  function addUser() {
    if (loginInfo.username === "" || loginInfo.password === "") {
      alert("Required fields are empty");
      return;
    }
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
        <h1>Login Page!</h1>
        <Container>
          <Paper className={classes.paper}>
            <form autoComplete='off' noValidate>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name='username'
                    label='username'
                    value={loginInfo.username}
                    onChange={handleChange}
                    helperText='Please Enter username'
                    required
                  ></TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name='password'
                    label='Password'
                    value={loginInfo.password}
                    type='password'
                    onChange={handleChange}
                    helperText='Please Enter Password'
                    required
                  ></TextField>
                </Grid>
                <Button variant='contained' color='primary' onClick={addUser}>
                  Submit
                </Button>
              </Grid>
            </form>
          </Paper>
        </Container>
      </Box>
    );
  else return <div>Loading...</div>;
};

export default Login;
