import React from "react";
import axios from "axios";
import { Button } from "@material-ui/core";
import ShowInfoJobApplicant from "../ShowInfo/ShowInfo";
import ShowInfoRecruiter from "../ShowInfoR/ShowInfoR";
class LoggedIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currUser: {},
      currUserInfo: {},
    };
    this.logout = this.logout.bind(this);
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

  render() {
    if (Object.entries(this.state.currUser).length === 0)
      return <h1>Loading...</h1>;
    else {
      return (
        <div>
          <Button onClick={() => this.props.history.push("/viewJobs")}>
            View Job Listings
          </Button>
          <Button onClick={() => this.props.history.push("/myApplications")}>
            My Applications
          </Button>
          <Button onClick={this.logout}>Logout</Button>
          <h1>{this.state.currUser.username}</h1>
          {this.state.currUser.type === "JA" ? (
            <ShowInfoJobApplicant
              userInfo={this.state.currUserInfo}
              userType={this.state.currUser.type}
            />
          ) : (
            <ShowInfoRecruiter
              userInfo={this.state.currUserInfo}
              userType={this.state.currUser.type}
            />
          )}
        </div>
      );
    }
  }
}
export default LoggedIn;
