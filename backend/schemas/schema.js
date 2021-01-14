const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  // googleId: String,
  type: String,
});
userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);

const jaSchema = new mongoose.Schema({
  userId: String,
  name: { type: String, default: "" },
  email: { type: String, default: "" },
  education: {
    type: [
      {
        instituteName: String,
        startYear: Number,
        endYear: Number,
      },
    ],
    default: [],
  },
  skills: { type: [{ skillName: String }], default: [] },
  rating: { type: Number, default: 0 },
  resumePath: { type: String, default: "" },
  ImagePath: { type: String, default: "" },
  appliedJobs: [String],
});

const rSchema = new mongoose.Schema({
  userId: String,
  name: { type: String, default: "" },
  email: { type: String, default: "" },
  contactNo: { type: String, default: "" },
  bio: { type: String, default: "" },
  listedJobs: [String],
});

const jobSchema = new mongoose.Schema({
  title: String,
  recruiterName: String,
  recruiterEmail: String,
  maxApp: Number,
  numPos: Number,
  postingDate: Date,
  deadlineDate: Date,
  reqSkills: [String],
  jobType: String,
  duration: Number,
  salary: Number,
  rating: { type: Number, default: 0 },
  appliedBy: [{ id: String, SOP: String }],
  gotBy: [String],
});

const User = new mongoose.model("User", userSchema);
const JobApplicant = new mongoose.model("jobApplicant", jaSchema);
const Recruiter = new mongoose.model("recruiter", rSchema);
const Job = new mongoose.model("job", jobSchema);

module.exports = { User, JobApplicant, Recruiter, Job };
