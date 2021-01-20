import React from "react";
import axios from "axios";
import { Chip, TextField, MenuItem, Button } from "@material-ui/core";

class ShowJobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortChoice: "name",
      order: 1,
      applicants: [],
      gotResponse: false,
      leftPositions: this.props.job.numPos - this.props.job.gotBy.length,
    };
    this.displayApplicants = this.displayApplicants.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.rejectleft = this.rejectLeft.bind(this);
  }

  componentDidMount() {
    axios.defaults.withCredentials = true;
    axios
      .post("http://localhost:8080/jobApplicants", {
        jobApplicants: this.props.job.appliedBy,
      })
      .then((response) => {
        let applicantsInfo = [];
        this.props.job.appliedBy.forEach((application) => {
          if (application.status !== "Rejected") {
            let index = response.data.applicantsInfo.findIndex(
              (x) => x.userId === application.id
            );
            applicantsInfo.push(
              Object.assign(response.data.applicantsInfo[index], application)
            );
          }
        });
        this.setState({
          applicants: applicantsInfo,
          gotResponse: true,
        });
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to retrieve Applicants");
        if (err.response.status === 401) this.props.history.push("/login");
      });
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  }

  displayFilters() {
    return (
      <div>
        <TextField
          style={{ margin: "20px" }}
          name='sortChoice'
          select
          label='Sort By'
          value={this.state.sortChoice}
          onChange={this.handleChange}
        >
          <MenuItem key='name' value='name'>
            Name
          </MenuItem>
          <MenuItem key='dateOfApplication' value='rdateOfApplication'>
            Application Date
          </MenuItem>
          <MenuItem key='rating' value='rating'>
            Rating
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
      </div>
    );
  }
  downloadFile(filename) {
    filename = filename.replace(/ /g, "");
    console.log(filename);
    axios({
      method: "POST",
      url: "http://localhost:8080/getFile2",
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
        alert("Failed to download");
        if (err.response.status === 401) this.props.history.push("/login");
      });
  }

  setStatus(status, index) {
    axios.defaults.withCredentials = true;
    axios
      .post("http://localhost:8080/setStatus", {
        jobId: this.props.job._id,
        applicationId: this.state.applicants[index]._id,
        status,
        userId: this.state.applicants[index].userId,
      })
      .then((response) => {
        if (response.data === "Success") {
          let updatedApplicationsArray = this.state.applicants;
          updatedApplicationsArray[index].status = status;

          this.setState({
            applicants: updatedApplicationsArray,
          });
          if (status === "Accepted") {
            this.props.job.gotBy.push(this.state.applicants[index].userId);
            if (this.state.leftPositions === 1) this.rejectLeft();
            this.setState((prevValues) => ({
              leftPositions: prevValues.leftPositions - 1,
            }));
          }
        } else {
          alert(response.data);
          let updatedApplicationsArray = this.state.applicants;
          updatedApplicationsArray[index].status = "Rejected";
          this.setState({
            applicants: updatedApplicationsArray,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to set status");
        if (err.response.status === 401) this.props.history.push("/login");
      });
  }

  displayButtons(index) {
    let appStatus = this.state.applicants[index].status;
    let isShortList = false;
    let isFinal = "";
    if (appStatus === "Applied") isShortList = true;
    if (appStatus === "Accepted" || appStatus === "Rejected")
      isFinal = appStatus;
    if (isFinal !== "") {
      return <Button disabled>{isFinal}</Button>;
    } else {
      if (isShortList) {
        return (
          <div>
            <Button
              variant='contained'
              color='primary'
              onClick={() => this.setStatus("ShortListed", index)}
            >
              ShortList
            </Button>
            <Button
              variant='contained'
              color='secondary'
              onClick={() => this.setStatus("Rejected", index)}
            >
              Reject
            </Button>
          </div>
        );
      } else
        return (
          <div>
            <Button
              variant='contained'
              style={{ backgroundColor: "#0bda51", color: "white" }}
              onClick={() => this.setStatus("Accepted", index)}
            >
              Accept
            </Button>
            <Button
              variant='contained'
              color='secondary'
              onClick={() => this.setStatus("Rejected", index)}
            >
              Reject
            </Button>
          </div>
        );
    }
  }

  displayApplicants() {
    return this.state.applicants
      .sort((a, b) => {
        let retValue;
        if (this.state.sortChoice === "name")
          retValue = a.name.localeCompare(b.name);
        else if (this.state.sortChoice === "rating")
          retValue = a.rating - b.rating;
        else
          retValue =
            new Date(a.dateOfApplication) - new Date(b.dateOfApplication);
        return retValue * parseInt(this.state.order);
      })
      .map((applicant, index) => {
        //         Name, Skills, Date of
        // Applica on, Educa on, SOP, Ra ng, Stage of Applica on in view.
        var dateFormat = require("dateformat");
        let applicationDate = new Date(applicant.dateOfApplication);
        const formattedApplicationDate = dateFormat(
          applicationDate,
          "dddd, mmmm dS, yyyy"
        );
        return (
          <div key={applicant.userId}>
            <p>
              {applicant.name} {formattedApplicationDate} {applicant.rating}{" "}
              {applicant.status} {applicant.SOP}
            </p>
            {applicant.skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill.skillName}
                clickable
                color='primary'
                style={{ width: 100, fontSize: 15 }}
              />
            ))}
            {applicant.education.map((instance, index) => (
              <span key={index}>
                {instance.instituteName} {instance.startYear} {instance.endYear}
              </span>
            ))}
            <Button
              disabled={applicant.resumePath === ""}
              onClick={() =>
                this.downloadFile(applicant.userId + applicant.resumePath)
              }
            >
              Download Resume
            </Button>
            {this.displayButtons(index)}
          </div>
        );
      });
  }

  rejectLeft() {
    let newApplications = this.state.applicants;
    newApplications.forEach((application, index) => {
      if (application.status !== "Accepted") {
        application.status = "Rejected";
        this.setStatus("Rejected", index);
      }
      return application;
    });
    this.setState({ applicants: newApplications });
  }

  render() {
    if (!this.state.gotResponse) return <h1>Loading..</h1>;
    else
      return (
        <div>
          <h2>Positions to Fill: {this.state.leftPositions}</h2>
          {this.displayFilters()}
          {this.state.applicants.length === 0 ? (
            <h1>No Applications!</h1>
          ) : (
            this.displayApplicants()
          )}
        </div>
      );
  }
}

export default ShowJobs;
