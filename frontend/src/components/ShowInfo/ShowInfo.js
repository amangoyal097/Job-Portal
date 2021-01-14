import { Rating } from "@material-ui/lab";
import axios from "axios";
import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import AddIcon from "@material-ui/icons/Add";
import DateFnsUtils from "@date-io/date-fns";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { makeStyles } from "@material-ui/core/styles";
import ShowInstance from "../ShowInstance/ShowInstance";
import ShowSkills from "../ShowSkills/ShowSkills";
import EditIcon from "@material-ui/icons/Edit";
import DoneIcon from "@material-ui/icons/Done";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  MenuItem,
} from "@material-ui/core";

const ShowInfo = (props) => {
  const [eduOpen, setEduOpen] = useState(false);
  const [skillOpen, setSkillOpen] = useState(false);
  const [eduInfo, setEduInfo] = useState({
    instituteName: "",
    startYear: new Date(Date.now()).getFullYear(),
    endYear: 0,
  });
  const [addEndYear, setAddEndYear] = useState(false);
  const [isEditable, setIsEditable] = useState({
    name: false,
    email: false,
  });
  const [skillInfo, setSkillInfo] = useState("");
  const [chosenSkill, setChosenSkill] = useState("");
  const [userInfo, setUserInfo] = useState(props.userInfo);
  axios.defaults.withCredentials = true;

  function handleEduOpen() {
    setEduOpen(true);
  }
  function handleEduClose() {
    setSkillInfo("");
    setEduOpen(false);
  }
  function handleSkillOpen() {
    setSkillOpen(true);
  }
  function handleSkillClose() {
    setSkillOpen(false);
  }
  function addEducation() {
    let index = userInfo.education.findIndex((x) => {
      return (
        x.instituteName === eduInfo.instituteName &&
        x.startYear === eduInfo.startYear &&
        x.endYear === eduInfo.endYear
      );
    });
    if (index === -1) {
      setUserInfo((prevValues) => {
        return {
          ...prevValues,
          education: [...prevValues.education, eduInfo],
        };
      });
    } else {
      alert("Already Present");
    }
    handleEduClose();
  }
  const useStyles = makeStyles((theme) => ({
    button: {
      marginTop: "20px",
    },
  }));
  const classes = useStyles();

  const uploadFile = (event) => {
    let type = event.target.name;
    let filType = event.target.files[0].type;
    if (type === "Image")
      setUserInfo((prevValues) => {
        return { ...prevValues, ImagePath: event.target.files[0].name };
      });
    else
      setUserInfo((prevValues) => {
        return { ...prevValues, resumePath: event.target.files[0].name };
      });
    if (
      type === "Image" &&
      filType !== "image/jpeg" &&
      filType !== "image/png"
    ) {
      alert("Only jpeg and png image allowed");
    } else {
      let data = new FormData();
      data.append("file", event.target.files[0]);
      data.append("type", type);
      axios
        .post("http://localhost:8080/storeFile", data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => alert(type + "Uploaded"))
        .catch((err) => {
          alert("Couldn't upload ");
          console.log(err);
        });
      // window.location.reload();
    }
  };
  const downloadFile = (type) => {
    let filename;
    if (type === "Image") filename = userInfo.ImagePath;
    else filename = userInfo.resumePath;
    axios({
      method: "POST",
      url: "http://localhost:8080/getFile",
      responseType: "blob",
      data: { filename },
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename); //or any other extension
        document.body.appendChild(link);
        link.click();
      })
      .catch((err) => {
        console.log(err);
        <Redirect to='/login' />;
      });
  };
  function titleCase(str) {
    var splitStr = str.toLowerCase().split(" ");
    for (let i = 0; i < splitStr.length; i++) {
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ");
  }
  const addSkill = (name) => {
    name = titleCase(name);
    let index = userInfo.skills.findIndex((x) => {
      return x.skillName === name;
    });
    if (index === -1) {
      setUserInfo((prevValues) => {
        return {
          ...prevValues,
          skills: [...prevValues.skills, { skillName: name }],
        };
      });
    } else {
      alert("Already Present ");
    }
    handleSkillClose();
  };

  const updateInfo = (event) => {
    setUserInfo((prevValues) => {
      return {
        ...prevValues,
        [event.target.name]: event.target.value,
      };
    });
  };

  const updateEduInfo = (event) => {
    setEduInfo((prevValues) => {
      return {
        ...prevValues,
        [event.target.name]: event.target.value,
      };
    });
  };

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
  const showSkills = () => {
    const Languages = ["C++", "Java", "Python", "Ruby", "JavaScript"];
    return (
      <div>
        <TextField
          select
          label='Choose Skill'
          value={chosenSkill}
          style={{ margin: 20, width: 200 }}
          onChange={(e) => {
            setChosenSkill(e.target.value);
            addSkill(e.target.value);
          }}
        >
          {Languages.map((name, index) => {
            return (
              <MenuItem key={index} value={name}>
                {name}
              </MenuItem>
            );
          })}
        </TextField>
        <Button
          variant='contained'
          color='primary'
          className={classes.button}
          startIcon={<AddIcon />}
          onClick={handleSkillOpen}
        >
          Add Skill
        </Button>
        <Dialog
          open={skillOpen}
          onClose={handleSkillClose}
          aria-labelledby='form-dialog-title'
        >
          <DialogTitle id='form-dialog-title'>Add Skill</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              value={skillInfo}
              onChange={(e) => setSkillInfo(e.target.value)}
              required
              margin='dense'
              label='Skill'
              type='text'
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSkillClose} color='primary'>
              Cancel
            </Button>
            <Button onClick={() => addSkill(skillInfo)} color='primary'>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  };

  const showEducation = () => {
    return (
      <div>
        <Button
          variant='contained'
          color='primary'
          className={classes.button}
          startIcon={<AddIcon />}
          onClick={handleEduOpen}
        >
          Add Education
        </Button>
        <Dialog
          open={eduOpen}
          onClose={handleEduClose}
          aria-labelledby='form-dialog-title'
        >
          <DialogTitle id='form-dialog-title'>Education Instance</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              name='instituteName'
              value={eduInfo.instituteName}
              onChange={updateEduInfo}
              required
              margin='dense'
              label='Institution Name'
              type='text'
              fullWidth
            />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DatePicker
                views={["year"]}
                name='startYear'
                required
                label='Select Start Year'
                value={new Date(eduInfo.startYear, 11, 0)}
                onChange={(date) =>
                  setEduInfo((prevValues) => {
                    return { ...prevValues, startYear: date.getFullYear() };
                  })
                }
                style={{ marginTop: "10px" }}
                fullWidth
                animateYearScrolling
              />
              <DatePicker
                views={["year"]}
                name='endYear'
                label='Select End Year'
                disabled={!addEndYear}
                value={
                  eduInfo.endYear === 0
                    ? new Date(2021, 11, 0)
                    : new Date(eduInfo.endYear, 11, 0)
                }
                minDate={
                  eduInfo.endYear === ""
                    ? null
                    : new Date(eduInfo.startYear, 11, 0)
                }
                onChange={(date) =>
                  setEduInfo((prevValues) => {
                    return { ...prevValues, endYear: date.getFullYear() };
                  })
                }
                style={{ marginTop: "10px" }}
                fullWidth
                animateYearScrolling
              />
            </MuiPickersUtilsProvider>
            <Button
              size='small'
              color='primary'
              onClick={() => {
                setAddEndYear(true);
                setEduInfo((prevValues) => {
                  return {
                    ...prevValues,
                    endYear: new Date(Date.now()).getFullYear(),
                  };
                });
              }}
            >
              Add End Year
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEduClose} color='primary'>
              Cancel
            </Button>
            <Button onClick={addEducation} color='primary'>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  };
  const deleteEdu = (obj) => {
    let newEduArray = userInfo.education.filter(
      (instance) =>
        instance.instituteName !== obj.instituteName ||
        instance.startYear !== obj.startYear ||
        instance.endYear !== obj.endYear
    );
    setUserInfo((prevValues) => {
      return { ...prevValues, education: newEduArray };
    });
  };
  const deleteSkill = (skillName) => {
    let newSkillArray = userInfo.skills.filter(
      (skill) => skillName !== skill.skillName
    );
    setUserInfo((prevValues) => {
      return { ...prevValues, skills: newSkillArray };
    });
  };
  const displayEducation = () => {
    // Title, date of joining, salary per month, name of recruiter.
    // Date of joining?
    return userInfo.education.map((instance, index) => {
      return <ShowInstance data={instance} key={index} deleteEdu={deleteEdu} />;
    });
  };
  const displaySkills = () => {
    return userInfo.skills.map((skill, index) => {
      return (
        <ShowSkills
          data={skill.skillName}
          key={index}
          deleteSkill={deleteSkill}
        />
      );
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
      <img
        src={process.env.PUBLIC_URL + "/assets/profilePic.png"}
        style={{ width: 100 }}
        alt='profilePic'
      />
      <br />
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
      <Rating
        name='rating'
        value={Number(userInfo.rating)}
        onChange={updateInfo}
        defaultValue={props.userInfo.rating}
        precision={0.5}
      />{" "}
      <h1>{userInfo.rating}</h1>
      <br />
      <h3>Education Instances</h3>
      {displayEducation()}
      {showEducation()}
      <h3>Skills</h3>
      {displaySkills()}
      {showSkills()}
      <Button color='primary' onClick={updateFullInfo}>
        Update Information
      </Button>
      <Button variant='contained' component='label'>
        Upload Image
        <input
          type='file'
          name='Image'
          hidden
          onChange={(e) => (e.target ? uploadFile(e) : null)}
        />
      </Button>
      <Button variant='contained' component='label'>
        Upload Resume
        <input
          type='file'
          name='resume'
          hidden
          onChange={(e) => (e.target ? uploadFile(e) : null)}
        />
      </Button>
      <Button onClick={() => downloadFile("Image")}>Download Image</Button>
      <Button onClick={() => downloadFile("resume")}>Download Resume</Button>
    </div>
  );
};

export default ShowInfo;
