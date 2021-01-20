import React, { useEffect, useState } from "react";
import axios from "axios";
import { TextField, MenuItem } from "@material-ui/core";
import Employee from "../Employee/Employee";

const AccApplications = (props) => {
  const [employees, setEmployees] = useState([]);
  const [gotResponse, setGotResponse] = useState(false);
  const [sortChoice, setSortChoice] = useState("name");
  const [order, setOrder] = useState("1");

  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios
      .post("http://localhost:8080/employeeInfo", { jobList: props.jobs })
      .then((response) => {
        setEmployees(response.data.employees);
        setGotResponse(true);
      })
      .catch((err) => {
        console.log(err);
        setGotResponse(true);
        if (err.response.status === 401) props.history.push("/login");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const displayFilters = () => {
    return (
      <div>
        <TextField
          style={{ margin: "20px" }}
          select
          label='Sort By'
          value={sortChoice}
          onChange={(e) => setSortChoice(e.target.value)}
        >
          <MenuItem key='name' value='name'>
            Name
          </MenuItem>
          <MenuItem key='title' value='title'>
            Job Title
          </MenuItem>
          <MenuItem key='dateOfJoining' value='dateOfJoining'>
            Joining Date
          </MenuItem>
          <MenuItem key='rating' value='rating'>
            Rating
          </MenuItem>
        </TextField>
        <TextField
          select
          label='Order'
          value={order}
          onChange={(e) => setOrder(e.target.value)}
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
  };

  const updateRating = (rating, userId) => {
    let tempArr = employees;
    tempArr.forEach((user, index) => {
      if (user.userId === userId) tempArr[index].rating = rating;
    });
    setEmployees(tempArr);
  };

  const displayEmployees = () => {
    return employees
      .sort((a, b) => {
        let retValue;
        if (sortChoice === "name" || sortChoice === "title")
          retValue = a[sortChoice].localeCompare(b[sortChoice]);
        else if (sortChoice === "rating") retValue = a.rating - b.rating;
        else
          retValue =
            new Date(a.dateOfApplication) - new Date(b.dateOfApplication);
        return retValue * parseInt(order);
      })
      .map((employee) => {
        return (
          <Employee
            key={employee.userId}
            employee={employee}
            updateRating={updateRating}
          />
        );
      });
  };

  if (!gotResponse) return <h1>Loading...</h1>;
  else {
    return (
      <div>
        {displayFilters()}
        {employees.length === 0 ? (
          <h1>No accepted Employees</h1>
        ) : (
          displayEmployees()
        )}
      </div>
    );
  }
};

export default AccApplications;
