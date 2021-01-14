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
  MenuItem,
  Button,
} from "@material-ui/core/";
const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    backgroundColor: "#222831",
  },
}));

const Register = (props) => {
  const classes = useStyles();
  const [profileInfo, setProfileInfo] = useState({
    profileType: "",
    username: "",
    password: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setProfileInfo((prevValues) => {
      return {
        ...prevValues,
        [name]: value,
      };
    });
  }

  function addUser() {
    if (
      profileInfo.username === "" ||
      profileInfo.password === "" ||
      profileInfo.profileType === ""
    ) {
      alert("Required fields are empty");
      return;
    }
    axios({
      method: "post",
      url: "http://localhost:8080/register",
      headers: { "Content-Type": "application/json" },
      data: profileInfo,
    })
      .then((response) => {
        if (response.data === "Success") {
          props.history.push("/user");
        } else {
          alert("Failed to register");
          console.log(response.data);
          props.history.push("/register");
        }
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to register");
        console.log(err);
        props.history.push("/register");
      });
  }
  const [gotResponse, setGotResponse] = useState(false);
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
        <h1>Register Page!</h1>
        <Container>
          <Paper className={classes.paper}>
            <form noValidate autoComplete='off'>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name='profileType'
                    select
                    label='Type'
                    value={profileInfo.profileType}
                    onChange={handleChange}
                    helperText='Please select your type'
                  >
                    <MenuItem key='JobApplicant' value='JA'>
                      Job Applicant
                    </MenuItem>
                    <MenuItem key='Recruiter' value='R'>
                      Recruiter
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name='username'
                    label='username'
                    value={profileInfo.username}
                    onChange={handleChange}
                    helperText='Please Enter username'
                    required
                  ></TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name='password'
                    label='Password'
                    value={profileInfo.password}
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

export default Register;
