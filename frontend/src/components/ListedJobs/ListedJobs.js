import React from "react";
import axios from "axios";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
} from "@material-ui/pickers";
import {
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";

class ListedJobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myJobs: [],
      editOpen: false,
      currJob: {},
      gotResponse: false,
    };
    this.displayJobs = this.displayJobs.bind(this);
    this.editJob = this.editJob.bind(this);
    this.deleteJob = this.deleteJob.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleEditClose = this.handleEditClose.bind(this);
    this.updateJob = this.updateJob.bind(this);
  }
  componentDidMount() {
    axios.defaults.withCredentials = true;
    axios
      .post("http://localhost:8080/myJobs", {
        listOfJobs: this.props.listedJobs,
      })
      .then((response) => {
        let activeJobs = response.data.foundJobs.filter(
          (job) => job.numPos - job.gotBy.length
        );
        this.setState({ myJobs: activeJobs, gotResponse: true });
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 401) this.props.history.push("/login");
      });
  }

  handleEdit(event) {
    this.setState((prevState) => ({
      currJob: {
        ...prevState.currJob,
        [event.target.name]: event.target.value,
      },
    }));
  }

  handleEditClose() {
    this.setState({
      editOpen: false,
    });
  }

  deleteJob(jobGone) {
    axios.defaults.withCredentials = true;
    axios
      .post("http://localhost:8080/deleteJob", { job: jobGone })
      .then((response) => {
        alert("Job deleted from database");
        const updatedJobs = this.state.myJobs.filter((job) => {
          return job._id !== jobGone._id;
        });
        this.setState({ myJobs: updatedJobs });
      })
      .catch((err) => {
        console.log(err);
        alert("couldn't delete job'");
      });
  }

  updateJob() {
    const updatedJobs = this.state.myJobs.map((job) => {
      if (job._id === this.state.currJob._id) {
        return this.state.currJob;
      } else {
        return job;
      }
    });
    this.setState({ myJobs: updatedJobs });
    this.handleEditClose();
    axios.default.withCredentials = true;
    axios
      .post("http://localhost:8080/updateJob", { job: this.state.currJob })
      .then((response) => {
        alert("Updated Job");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to apply to Job");
      });
  }

  editJob(job) {
    this.setState({ currJob: job, editOpen: true });
  }

  displayJobs() {
    // Title, Date of pos ng, Number of Applicants, Maximum Number of
    // Posi ons
    const jobs = this.state.myJobs.filter(
      (job) => job.numPos - job.gotBy.length
    );
    if (jobs.length === 0) this.setState({ myJobs: [] });
    var dateFormat = require("dateformat");
    return jobs.map((job, index) => {
      let postingDate = new Date(job.postingDate);
      const formattedPostingDate = dateFormat(
        postingDate,
        "dddd, mmmm dS, yyyy"
      );
      let deadlineDate = new Date(job.deadlineDate);
      const formattedDeadlineDate = dateFormat(
        deadlineDate,
        "dddd, mmmm dS, yyyy"
      );
      return (
        <div key={job._id}>
          <div
            style={{ cursor: "pointer" }}
            onClick={() => this.props.showJob(job)}
          >
            <p>
              {job.title} {formattedPostingDate} {job.appliedBy.length}{" "}
              {job.maxApp} {job.numPos - job.gotBy.length}{" "}
              {formattedDeadlineDate}
            </p>
          </div>
          <div>
            <IconButton onClick={() => this.editJob(job)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => this.deleteJob(job)}>
              <DeleteIcon />
            </IconButton>
          </div>
        </div>
      );
    });
  }

  render() {
    if (!this.state.gotResponse) return <h1>Loading...</h1>;
    else
      return (
        <div>
          {this.state.myJobs.length === 0 ? (
            <h1>No Jobs Listed!</h1>
          ) : (
            <div>
              <h1>Listed Jobs</h1>
              {this.displayJobs()}
            </div>
          )}

          <Dialog open={this.state.editOpen} onClose={this.handleEditClose}>
            <DialogTitle>Edit Job Information</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                name='maxApp'
                value={this.state.currJob.maxApp}
                onChange={this.handleEdit}
                required
                margin='dense'
                label='No. of Applications'
                type='text'
                fullWidth
              />
              <TextField
                autoFocus
                name='numPos'
                value={this.state.currJob.numPos}
                onChange={this.handleEdit}
                required
                margin='dense'
                label='No. Of Positions'
                type='text'
                fullWidth
              />
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDateTimePicker
                  label='Deadline Date'
                  value={this.state.currJob.deadlineDate}
                  onChange={(date) => {
                    this.setState((prevState) => ({
                      currJob: {
                        ...prevState.currJob,
                        deadlineDate: date.toISOString(),
                      },
                    }));
                  }}
                  disablePast
                  format='dd/MM/yyyy hh:mm a'
                />
              </MuiPickersUtilsProvider>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleEditClose} color='primary'>
                Cancel
              </Button>
              <Button onClick={this.updateJob} color='primary'>
                Update
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      );
  }
}

export default ListedJobs;
