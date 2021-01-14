import React, { useState } from "react";
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import DoneIcon from "@material-ui/icons/Done";
import axios from "axios";

const ShowInfoR = (props) => {
  axios.defaults.withCredentials = true;
  const [userInfo, setUserInfo] = useState(props.userInfo);
  const [isEditable, setIsEditable] = useState({
    name: false,
    email: false,
    contactNo: false,
    bio: false,
  });
  const updateFullInfo = () => {
    axios
      .post("http://localhost:8080/updateUserInfo", {
        userInfo,
        type: props.userType,
      })
      .then((response) => alert("Updated information"))
      .catch((err) => {
        console.log(err);
        alert("Couldnt update");
      });
  };
  const updateInfo = (event) => {
    setUserInfo((prevValues) => {
      return {
        ...prevValues,
        [event.target.name]: event.target.value,
      };
    });
  };

  const updateIsEditable = (field) => {
    setIsEditable((prevValues) => {
      return {
        ...prevValues,
        [field]: !prevValues[field],
      };
    });
  };

  return (
    <div>
      <form autoComplete='off'>
        <TextField
          name='name'
          value={userInfo.name}
          label='Name'
          onChange={(e) => (isEditable.name ? updateInfo(e) : null)}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={() => updateIsEditable("name")}>
                  {isEditable.name ? <DoneIcon /> : <EditIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        ></TextField>
        <br />
        <TextField
          name='email'
          label='Email'
          value={userInfo.email}
          onChange={(e) => (isEditable.email ? updateInfo(e) : null)}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={() => updateIsEditable("email")}>
                  {isEditable.email ? <DoneIcon /> : <EditIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        ></TextField>{" "}
        <br />
        <TextField
          name='contactNo'
          label='Contact Number'
          value={userInfo.contactNo}
          onChange={(e) => (isEditable.contactNo ? updateInfo(e) : null)}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={() => updateIsEditable("contactNo")}>
                  {isEditable.contactNo ? <DoneIcon /> : <EditIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        ></TextField>{" "}
        <br />
        <h3>Bio</h3>
        <TextField
          name='bio'
          style={{ width: 500 }}
          autoFocus
          rows={3}
          rowsMax={6}
          required
          margin='dense'
          id='sop'
          label='max 250 words'
          type='text'
          inputProps={{ maxLength: 250 }}
          multiline
          value={userInfo.bio}
          onChange={(e) => (isEditable.bio ? updateInfo(e) : null)}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={() => updateIsEditable("bio")}>
                  {isEditable.bio ? <DoneIcon /> : <EditIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          variant='outlined'
          fullWidth
        />
        <Button color='primary' onClick={updateFullInfo}>
          Update Information
        </Button>
      </form>
    </div>
  );
};

export default ShowInfoR;
