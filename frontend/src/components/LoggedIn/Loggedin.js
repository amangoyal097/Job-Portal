import React from "react";
import axios from "axios";
import ShowInfoJobApplicant from "../ShowInfo/ShowInfo";
import ShowInfoRecruiter from "../ShowInfoR/ShowInfoR";
import { Button } from "@material-ui/core";
import ViewJobs from "../ViewJobs/ViewJobs";
import MyApplications from "../MyApplications/MyApplications";
import CreateJob from "../CreateJob/CreateJob";

class LoggedIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currUser: {},
      currUserInfo: {},
      tabOpen: "profile",
    };
    this.logout = this.logout.bind(this);
    this.redirectTo = this.redirectTo.bind(this);
  }

  componentDidMount() {
    axios.defaults.withCredentials = true;
    axios
      .get("http://localhost:8080/currUser")
      .then((response) => {
        let obj = response.data;
        if (Object.entries(obj).length === 0) {
          this.props.history.push("/login");
        } else {
          this.setState({
            currUser: obj.currUser,
            currUserInfo: obj.currUserInfo,
          });
        }
      })
      .catch((err) => {
        this.props.history.push("/login");
      });
  }

  logout() {
    axios.defaults.withCredentials = true;
    axios
      .get("http://localhost:8080/logout")
      .then((response) => {
        this.props.history.push("/");
      })
      .catch((err) => {
        console.log(err);
        this.props.history.push("/");
      });
  }
  redirectTo(path) {
    this.setState({ tabOpen: path });
  }
  TopBarJobApplicant() {
    return (
      <div>
        <h3>{this.state.currUser.username}</h3>
        <Button onClick={() => this.redirectTo("profile")}>Profile</Button>
        <Button onClick={() => this.redirectTo("viewJobs")}>
          View Job Listings
        </Button>
        <Button onClick={() => this.redirectTo("myApplications")}>
          My Applications
        </Button>
        <Button onClick={this.logout}>Logout</Button>
      </div>
    );
  }
  TopBarRecruiter() {
    return (
      <div>
        <h3>{this.state.currUser.username}</h3>
        <Button onClick={() => this.redirectTo("profile")}>Profile</Button>
        <Button onClick={() => this.redirectTo("createJob")}>Create Job</Button>
        <Button onClick={this.logout}>Logout</Button>
      </div>
    );
  }
  render() {
    if (
      Object.entries(this.state.currUser).length === 0 ||
      Object.entries(this.state.currUserInfo).length === 0
    )
      return <h1>Loading...</h1>;
    else {
      return (
        <div>
          {this.state.currUser.type === "JA"
            ? this.TopBarJobApplicant()
            : this.TopBarRecruiter()}
          {this.state.tabOpen === "profile" ? (
            this.state.currUser.type === "JA" ? (
              <ShowInfoJobApplicant
                userInfo={this.state.currUserInfo}
                userType={this.state.currUser.type}
              />
            ) : (
              <ShowInfoRecruiter
                userInfo={this.state.currUserInfo}
                userType={this.state.currUser.type}
              />
            )
          ) : this.state.tabOpen === "viewJobs" ? (
            <ViewJobs
              user={this.state.currUser}
              userInfo={this.state.currUserInfo}
              history={this.props.history}
            />
          ) : this.state.tabOpen === "myApplications" ? (
            <MyApplications />
          ) : this.state.tabOpen === "createJob" ? (
            <CreateJob userInfo={this.state.currUserInfo} />
          ) : null}
        </div>
      );
    }
  }
}
export default LoggedIn;
