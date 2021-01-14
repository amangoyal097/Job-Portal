import React from "react";

const CreateJob = (props) => {
  console.log(props.userInfo);
  return (
    <div>
      <h1>{props.userInfo.name}</h1>
      <h1>{props.userInfo.email}</h1>
    </div>
  );
};

export default CreateJob;
