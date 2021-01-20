import React, { useState } from "react";
import { Rating } from "@material-ui/lab";
import axios from "axios";

const Employee = (props) => {
  const [rating, setRating] = useState(props.employee.rating);
  let dateFormat = require("dateformat");
  let formattedJoiningDate = "Not available";
  if (props.employee.dateOfJoining) {
    let joiningDate = new Date(props.employee.dateOfJoining);
    formattedJoiningDate = dateFormat(joiningDate, "dddd, mmmm dS, yyyy");
  }

  const updateRating = (event) => {
    let newRating = event.target.value;
    let userId = props.employee.userId;
    console.log(newRating);
    axios
      .post("http://localhost:8080/updateRating", { userId, newRating })
      .then((response) => {
        setRating(newRating);
        props.updateRating(newRating, userId);
      })
      .catch((err) => {
        console.log(err);
      });
    setRating(newRating);
  };

  return (
    <div>
      {props.employee.name} {props.employee.title} {props.employee.jobType}{" "}
      {formattedJoiningDate} {props.employee.rating}
      <Rating
        name={props.employee.name}
        value={Number(rating)}
        onChange={updateRating}
        defaultValue={Number(props.employee.rating)}
        precision={0.5}
      />
      <span>{rating}</span>
    </div>
  );
};

export default Employee;
