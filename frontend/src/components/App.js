import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./Home/Home";
import Login from "./Login/Login";
import Register from "./Register/Register";
import LoggedIn from "./LoggedIn/Loggedin";
import RegisterInfo from "./RegisterInfo/RegisterInfo.js";
const App = () => {
  return (
    <Router>
      <Route exact path='/' component={Home} />
      <Route exact path='/login' component={Login} />
      <Route exact path='/register' component={Register} />
      <Route exact path='/user' component={LoggedIn} />
      <Route exact path='/registerInfo' component={RegisterInfo} />
    </Router>
  );
};

export default App;
