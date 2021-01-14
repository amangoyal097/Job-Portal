import React, { useState } from "react";
import AddIcon from "@material-ui/icons/Add";
import ShowSkills from "../ShowSkills/ShowSkills";
import axios from "axios";
import {
  TextField,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import { makeStyles } from "@material-ui/core/styles";
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
} from "@material-ui/pickers";

const CreateJob = (props) => {
  const [jobInfo, setJobInfo] = useState({
    title: "",
    recruiterName: props.userInfo.name,
    recruiterEmail: props.userInfo.email,
    maxApp: 0,
    numPos: 0,
    postingDate: Date.now(),
    deadlineDate: Date.now(),
    reqSkills: [],
    jobType: "",
    duration: 0,
    salary: 0,
    rating: 0,
    appliedBy: [],
    gotBy: [],
  });
  const [chosenSkill, setChosenSkill] = useState("");
  const [skillOpen, setSkillOpen] = useState(false);
  const [skillInfo, setSkillInfo] = useState("");

  const useStyles = makeStyles((theme) => ({
    button: {
      marginTop: "20px",
    },
  }));
  const classes = useStyles();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setJobInfo((prevValues) => {
      return {
        ...prevValues,
        [name]: value,
      };
    });
  };

  function handleSkillOpen() {
    setSkillOpen(true);
  }
  function handleSkillClose() {
    setSkillOpen(false);
  }

  const addJob = () => {
    axios.defaults.withCredentials = true;
    axios
      .post("http://localhost:8080/addJob", jobInfo)
      .then((response) => {
        if (response.data === "Success") alert("Job added");
        else {
          alert("Failed to add job");
          console.log(response.data);
        }
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to add JOB");
      });
  };

  const deleteSkill = (skillName) => {
    let newSkillArray = jobInfo.reqSkills.filter(
      (skill) => skillName !== skill.skillName
    );
    setJobInfo((prevValues) => {
      return { ...prevValues, reqSkills: newSkillArray };
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
    let index = jobInfo.reqSkills.findIndex((x) => {
      return x.skillName === name;
    });
    if (index === -1) {
      setJobInfo((prevValues) => {
        return {
          ...prevValues,
          reqSkills: [...prevValues.reqSkills, { skillName: name }],
        };
      });
    } else {
      alert("Already Present ");
    }
    handleSkillClose();
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

  const displaySkills = () => {
    return jobInfo.reqSkills.map((skill, index) => {
      return (
        <ShowSkills
          data={skill.skillName}
          key={index}
          deleteSkill={deleteSkill}
        />
      );
    });
  };

  const displayJobTypeAndDuration = () => {
    let durationChoices = [];
    let jobTypes = ["Full Time", "Part Time", "Work from Home"];
    let jobTypesChoices = [];
    for (var i = 0; i < 7; i++) {
      durationChoices.push(
        <MenuItem key={i} value={i}>
          {i}
        </MenuItem>
      );
    }
    for (i = 0; i < jobTypes.length; i++) {
      jobTypesChoices.push(
        <MenuItem key={i} value={jobTypes[i]}>
          {jobTypes[i]}
        </MenuItem>
      );
    }
    return (
      <div>
        <TextField
          style={{ margin: "20px" }}
          name='duration'
          select
          label='Duration'
          value={jobInfo.duration}
          onChange={handleChange}
        >
          {durationChoices}
        </TextField>
        <TextField
          style={{ margin: "20px", width: 150 }}
          name='jobType'
          select
          label='Type'
          value={jobInfo.jobType}
          onChange={handleChange}
        >
          {jobTypesChoices}
        </TextField>
      </div>
    );
  };

  return (
    <div>
      <TextField
        name='title'
        label='Title'
        value={jobInfo.title}
        onChange={handleChange}
      ></TextField>
      <TextField
        name='recruiterName'
        label='Name of Recruiter'
        value={jobInfo.name}
        onChange={handleChange}
      ></TextField>
      <TextField
        name='recruiterEmail'
        label='Email of Recruiter'
        value={jobInfo.email}
        onChange={handleChange}
      ></TextField>
      <TextField
        name='maxApp'
        label='Maximum Applications'
        value={jobInfo.maxApp}
        onChange={handleChange}
      ></TextField>
      <TextField
        name='numPos'
        label='No. of Vacancies'
        value={jobInfo.numPos}
        onChange={handleChange}
      ></TextField>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDateTimePicker
          label='With keyboard'
          value={jobInfo.deadlineDate}
          onChange={(date) => {
            setJobInfo((prevValues) => {
              return {
                ...prevValues,
                deadlineDate: date,
              };
            });
          }}
          disablePast
          format='dd/MM/yyyy hh:mm a'
        />
      </MuiPickersUtilsProvider>

      <h3>Required Skills</h3>
      {displaySkills()}
      {showSkills()}
      {displayJobTypeAndDuration()}
      <TextField
        name='salary'
        label='Salary Per Month'
        value={jobInfo.salary}
        onChange={handleChange}
      ></TextField>
      <Button variant='contained' color='primary' onClick={addJob}>
        Add Job
      </Button>
    </div>
  );
};

export default CreateJob;
