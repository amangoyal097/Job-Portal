import React from "react";
import axios from "axios";
import {
  TextField,
  MenuItem,
  Slider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";

class ViewJobs extends React.Component {
  constructor(props) {
    super(props);
    this.maxSalary = 0;
    this.applyingToJob = "";
    this._isMounted = false;
    this.state = {
      currUser: props.user,
      currUserInfo: props.userInfo,
      jobs: [],
      sortChoice: "salary",
      order: 1,
      search: "",
      filterType: "None",
      filterSalary: [0, 0],
      filterDuration: 7,
      openDialog: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSlider = this.handleSlider.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.applyToJob = this.applyToJob.bind(this);
    this.sendApplication = this.sendApplication.bind(this);
  }

  handleClose() {
    this.setState({
      openDialog: false,
    });
  }

  sendApplication() {
    const jobSOP = document.getElementById("sop").value;
    const jobId = this.applyingToJob;
    const userId = this.state.currUser._id;
    let applytoJob = {
      jobId,
      userId,
      jobSOP,
    };
    axios.defaults.withCredentials = true;
    axios({
      method: "post",
      url: "http://localhost:8080/applyToJob",
      headers: { "Content-Type": "application/json" },
      data: applytoJob,
    })
      .then((response) => {
        if (response.data === "Success") {
          let jobsTemp = this.state.jobs;
          let userInfoTemp = this.state.currUserInfo;
          for (let i = 0; i < this.state.jobs.length; i++) {
            if (jobsTemp[i]._id === jobId) {
              jobsTemp[i].appliedBy.push({ id: userId, SOP: jobSOP });
            }
          }
          userInfoTemp.appliedJobs.push(jobId);
          this.setState({
            jobs: jobsTemp,
            currUserInfo: userInfoTemp,
          });
        } else alert("Failed to Apply");
      })
      .catch((err) => {
        alert("Failed to Apply");
      });
    if (this._isMounted) this.handleClose();
  }

  componentDidMount() {
    this._isMounted = true;
    axios.defaults.withCredentials = true;
    axios
      .get("http://localhost:8080/isLoggedIn")
      .then((response) => {
        if (response.data !== "Yes") {
          this.props.history.push("/login");
        }
      })
      .catch((err) => {
        console.log(err);
        this.props.history.push("/login");
      });
    axios
      .get("http://localhost:8080/jobs")
      .then((response) => {
        for (var i = 0; i < response.data.jobs.length; i++) {
          this.maxSalary = Math.max(
            this.maxSalary,
            response.data.jobs[i].salary
          );
        }
        if (this._isMounted)
          this.setState({
            jobs: response.data.jobs,
            filterSalary: [0, this.maxSalary],
          });
      })
      .catch((err) => {
        console.log(err);
        this.props.history.push("/login");
      });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  valuetext(value) {
    return `${value}`;
  }

  displayFilters() {
    let durationFilters = [];
    let jobTypeFilters = ["None", "Full Time", "Part Time", "Work from Home"];
    let typeFilters = [];
    for (var i = 1; i < 8; i++) {
      durationFilters.push(
        <MenuItem key={i} value={i}>
          {i}
        </MenuItem>
      );
    }

    for (i = 0; i < jobTypeFilters.length; i++) {
      typeFilters.push(
        <MenuItem key={i} value={jobTypeFilters[i]}>
          {jobTypeFilters[i]}
        </MenuItem>
      );
    }

    return (
      <div>
        <TextField
          style={{ margin: "20px" }}
          name='filterDuration'
          select
          label='Duration'
          value={this.state.filterDuration}
          onChange={this.handleChange}
        >
          {durationFilters}
        </TextField>
        <TextField
          style={{ margin: "20px" }}
          name='filterType'
          select
          label='Type'
          value={this.state.filterType}
          onChange={this.handleChange}
        >
          {typeFilters}
        </TextField>
        <div style={{ width: 300 }}>
          <Slider
            value={this.state.filterSalary}
            onChange={this.handleSlider}
            min={0}
            max={this.maxSalary}
            step={this.maxSalary / 10}
            getAriaLabel={(index) => "Slider"}
          />
          <h1>
            {this.state.filterSalary[0]}-{this.state.filterSalary[1]}
          </h1>
        </div>
      </div>
    );
  }

  applyToJob(jobId) {
    if (this.state.currUserInfo.appliedJobs.length === 10) {
      alert("Max number of applications filled by You");
    } else {
      this.setState({
        openDialog: true,
      });
      this.applyingToJob = jobId;
    }
  }

  canApply(job, jobId) {
    if (job.appliedBy.length === job.maxApp || job.gotBy.length === job.numPos)
      return (
        <Button
          variant='contained'
          style={{ backgroundColor: "#3f50b5", color: "white" }}
          disabled
        >
          Full
        </Button>
      );
    else {
      let returnButton = false;
      for (let i = 0; i < job.appliedBy.length; i++) {
        if (job.appliedBy[i].id === this.state.currUser._id)
          returnButton = true;
      }
      if (!returnButton)
        return (
          <Button
            color='secondary'
            id='applyButton'
            variant='contained'
            onClick={() => this.applyToJob(jobId)}
          >
            Apply
          </Button>
        );
      else
        return (
          <Button
            disabled
            variant='contained'
            style={{ backgroundColor: "#0bda51", color: "white" }}
          >
            Applied
          </Button>
        );
    }
  }

  displayJobs() {
    this.state.jobs.sort(
      (a, b) =>
        (a[this.state.sortChoice] - b[this.state.sortChoice]) *
        parseInt(this.state.order)
    );
    const [minSal, maxSal] = this.state.filterSalary;
    return this.state.jobs
      .filter((job) => new Date(job.deadlineDate) >= new Date())
      .filter((job) => job.title.includes(this.state.search))
      .filter((job) => job.duration < this.state.filterDuration)
      .filter((job) => job.salary <= maxSal && job.salary >= minSal)
      .filter((job) =>
        this.state.filterType === "None"
          ? true
          : job.jobType === this.state.filterType
      )
      .map((job) => {
        return (
          <div key={job._id}>
            <p key={job._id}>
              title: {job.title} RName: {job.recruiterName} salary: {job.salary}{" "}
              rating: {job.rating} duration: {job.duration} deadline:{" "}
              {job.deadlineDate}
            </p>
            {this.canApply(job, job._id)}
          </div>
        );
      });
  }
  handleChange(event) {
    if (this._isMounted)
      this.setState({
        ...this.state,
        [event.target.name]: event.target.value,
      });
  }
  handleSlider(event, newValue) {
    if (this._isMounted)
      this.setState({
        ...this.state,
        filterSalary: newValue,
      });
  }

  render() {
    if (this.state.jobs.length === 0) return <h1>Loading...</h1>;
    else
      return (
        <div style={{ margin: 100 }}>
          <h1>View Jobs</h1>
          <TextField
            style={{ margin: "20px" }}
            name='sortChoice'
            select
            label='Sort By'
            value={this.state.sortChoice}
            onChange={this.handleChange}
          >
            <MenuItem key='salary' value='salary'>
              Salary
            </MenuItem>
            <MenuItem key='rating' value='rating'>
              Rating
            </MenuItem>
            <MenuItem key='duration' value='duration'>
              Duration
            </MenuItem>
          </TextField>
          <TextField
            name='order'
            select
            label='Order'
            value={this.state.order}
            onChange={this.handleChange}
          >
            <MenuItem key='ascending' value='1'>
              Ascending
            </MenuItem>
            <MenuItem key='descending' value='-1'>
              Descending
            </MenuItem>
          </TextField>
          <TextField
            style={{ margin: "20px" }}
            name='search'
            lable='Search Jobs'
            value={this.state.search}
            onChange={this.handleChange}
            autoComplete='off'
          ></TextField>
          {this.displayFilters()}
          {this.displayJobs()}
          <Dialog
            open={this.state.openDialog}
            onClose={this.handleClose}
            aria-labelledby='form-dialog-title'
          >
            <DialogTitle id='form-dialog-title'>
              Statement of Purpose
            </DialogTitle>
            <DialogContent>
              <TextField
                style={{ minWidth: 500 }}
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
                variant='outlined'
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.handleClose()} color='primary'>
                Cancel
              </Button>
              <Button onClick={() => this.sendApplication()} color='primary'>
                Add
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      );
  }
}

export default ViewJobs;
