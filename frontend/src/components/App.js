import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./Home/Home";
import Login from "./Login/Login";
import Register from "./Register/Register";
import LoggedIn from "./LoggedIn/Loggedin";
import ViewJobs from "./ViewJobs/ViewJobs";
import MyApplications from "./MyApplications/MyApplications";

const App = () => {
  return (
    <Router>
      <Route exact path='/' component={Home} />
      <Route exact path='/login' component={Login} />
      <Route exact path='/register' component={Register} />
      <Route path='/user' component={LoggedIn} />
      <Route exact path='/viewJobs' component={ViewJobs} />
      <Route exact path='/myApplications' component={MyApplications} />
    </Router>
  );
};

export default App;
