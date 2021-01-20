import React from "react";
import axios from "axios";
import Application from "../Application/Application";

class MyApplications extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      applications: [],
    };
    this.displayApplications = this.displayApplications.bind(this);
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
    axios.get("http://localhost:8080/myApplications").then((response) => {
      this.setState({
        applications: response.data.foundJobs,
      });
    });
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  displayApplications() {
    // Title, date of joining, salary per month, name of recruiter.
    // Date of joining?
    return this.state.applications.map((application) => {
      return (
        <Application
          key={application._id}
          application={application}
          userId={this.props.userId}
        />
      );
    });
  }
  render() {
    return (
      <div>
        <h1>My Applications</h1>
        {this.displayApplications()}
      </div>
    );
  }
}

export default MyApplications;
