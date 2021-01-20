import React, { useState } from "react";
import { Rating } from "@material-ui/lab";
import axios from "axios";

const Application = (props) => {
  let status;
  let joiningDate;
  let userRating;

  const updateJobRating = (event) => {
    let value = event.target.value;
    axios
      .post("http://localhost:8080/updateJobRating", {
        jobId: props.application._id,
        userId: props.userId,
        rating: value,
      })
      .then((response) => {
        setRating(value);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  props.application.appliedBy.forEach((user) => {
    if (user.id === props.userId) {
      status = user.status;
      if (status === "Accepted") {
        joiningDate = user.dateOfJoining;
        userRating = user.rating;
      }
    }
  });
  const [rating, setRating] = useState(userRating);
  let dateOfJoining = "Not Applicable";
  if (status === "Accepted") {
    let dateFormat = require("dateformat");
    dateOfJoining = dateFormat(joiningDate, "dddd, mmmm dS, yyyy");
  }
  return (
    <div>
      <p>
        {props.application.title} {props.application.duration}{" "}
        {props.application.salary} {props.application.recruiterName} {status}{" "}
        {dateOfJoining}
      </p>
      {status === "Accepted" ? (
        <Rating
          name={props.application._id}
          value={rating}
          onChange={updateJobRating}
        />
      ) : null}
    </div>
  );
};

export default Application;
