//jshint esversion:6
require("dotenv").config();
const nodemailer = require("nodemailer");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const upload = require("express-fileupload");
const { User, JobApplicant, Recruiter, Job } = require("./schemas/schema");
require("./schemas/dummyJobs.js");
const cors = require("cors");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
var LocalStorage = require("node-localstorage").LocalStorage,
  localStorage = new LocalStorage("./scratch");

mongoose.connect("mongodb://localhost:27017/userTestDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
});
passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/user",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.countDocuments({ googleId: profile.id }, function (err, count) {
        if (count === 0 && localStorage.getItem("type") === "") {
          let error = new Error("No record found");
          cb(err);
        } else {
          User.findOrCreate(
            { googleId: profile.id, username: profile._json.email },
            function (err, user, created) {
              if (created) {
                const type = localStorage.getItem("type");
                localStorage.setItem("type", "");
                user.type = type;
                user.save();
                let chosenModel = Recruiter;
                if (type === "JA") chosenModel = JobApplicant;
                let newUser = new chosenModel({
                  userId: user._id,
                  name: profile.displayName,
                  email: profile._json.email,
                });
                newUser.save();
              }
              return cb(err, user);
            }
          );
        }
      });
    }
  )
);

const app = express();
app.use(upload());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(
  session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", function (req, res) {
  res.send("Server is up and running");
});

app.get("/registerType/:profileType", (req, res) => {
  localStorage.setItem("type", req.params.profileType);
  res.redirect("/auth/google");
});

app.get("/currUser", function (req, res) {
  if (!req.isAuthenticated()) res.sendStatus(401);
  else {
    let currUser = req.user;
    if (req.user.type === "JA") {
      JobApplicant.findOne({ userId: req.user._id }, function (err, userInfo) {
        if (err) res.json();
        if (userInfo) {
          currUserInfo = userInfo;
          res.json({ currUser, currUserInfo });
        }
      });
    } else {
      Recruiter.findOne({ userId: req.user._id }, function (err, userInfo) {
        if (err) res.json();
        if (userInfo) {
          currUserInfo = userInfo;
          res.json({ currUser, currUserInfo });
        }
      });
    }
  }
});

app.get("/logout", function (req, res) {
  req.logout();
  res.send("Logout Successful");
});

app.get("/jobs", function (req, res) {
  Job.find({}, function (err, foundJobs) {
    if (err) {
      console.log(err);
      res.json({ jobs: [] });
    } else {
      res.json({ jobs: foundJobs });
    }
  });
});

app.get("/isLoggedIn", function (req, res) {
  if (req.isAuthenticated()) res.send("Yes");
  else res.send("No");
});

app.get("/myApplications", (req, res) => {
  if (typeof req.user === "undefined") res.sendStatus(401);
  else {
    userId = req.user._id;
    Job.find(
      { appliedBy: { $elemMatch: { id: userId } } },
      function (err, foundJobs) {
        if (err) {
          console.log(err);
          res.sendStatus(400);
        } else {
          res.json({ foundJobs });
        }
      }
    );
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/user",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/register",
  }),
  function (req, res) {
    res.redirect("http://localhost:3000/user");
  }
);

app.post("/updateUserInfo", (req, res) => {
  let chosenModel = Recruiter;
  if (req.body.type == "JA") chosenModel = JobApplicant;
  chosenModel
    .updateOne({ _id: req.body.userInfo._id }, req.body.userInfo)
    .exec()
    .then((foundUser) => res.send("OK"))
    .catch((err) => {
      console.log(err), res.sendStatus(400);
    });
});

app.post("/getFile", (req, res) => {
  if (typeof req.user === "undefined") res.sendStatus(401);
  else res.download(__dirname + "/uploads/" + req.user._id + req.body.filename);
});

app.post("/getFile2", (req, res) => {
  if (typeof req.user === "undefined") res.sendStatus(401);
  else res.download(__dirname + "/uploads/" + req.body.filename);
});

app.post("/storeFile", function (req, res) {
  if (req.files) {
    var file = req.files.file;
    var filename = file.name.replace(/ /g, "");
    file.mv("./uploads/" + req.user._id + filename, (err) => {
      if (err) {
        res.send(err);
      } else {
        res.send("File Uploded");
        let path = __dirname + "/uploads/" + req.user._id + filename;
        let obj = {
          resumePath: filename,
        };
        if (req.body.type === "Image")
          obj = {
            ImagePath: filename,
          };
        JobApplicant.updateOne(
          { userId: req.user._id },
          obj,
          function (err, foundUser) {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    });
  }
});

app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username, type: req.body.profileType },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        console.log(user);
        req.login(user, function (err) {
          if (err) console.log(err);
          else {
            passport.authenticate("local")(req, res, function () {
              console.log("LoggedIn");
            });
          }
        });
        let chosenModel;
        if (user.type === "JA") chosenModel = JobApplicant;
        else chosenModel = Recruiter;
        const temp = new chosenModel({
          userId: user._id,
        });
        temp.save(function (err) {
          if (err) {
            res.send("Failed to register");
          } else res.send("Success");
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.send("Failed");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.send("Success");
      });
    }
  });
});

app.post("/applyToJob", async (req, res) => {
  try {
    let dateOfApplication = new Date(Date.now());
    let dateString = dateOfApplication.toISOString();
    const userApplied = {
      id: req.body.userId,
      SOP: req.body.jobSOP,
      status: "Applied",
      dateOfApplication: dateString,
    };
    let user = await JobApplicant.findOne({ userId: req.body.userId });
    if (user.foundJob) {
      res.send("Already Accepted in another Job!");
      return;
    }
    const appliedTo = req.body.jobId;
    let job = await Job.findById(appliedTo);
    if (job.appliedBy.length == job.maxApp || job.gotBy.length == job.numPos) {
      res.send(" The job is already full");
    } else {
      job.appliedBy.push(userApplied);
      await job.save();
      await JobApplicant.updateOne(
        { userId: req.body.userId },
        { $push: { appliedJobs: appliedTo } },
        { useFindAndModify: false }
      );
      res.send("Success");
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post("/addJob", async (req, res) => {
  if (!req.isAuthenticated()) res.sendStatus(401);
  else {
    let userId = req.body.id;
    delete req.body["id"];
    try {
      const newJob = new Job(req.body);
      let user = await newJob.save();
      await Recruiter.updateOne(
        { userId },
        { $push: { listedJobs: user._id } }
      );
      res.send(user._id);
    } catch (err) {
      console.log(err);
      res.sendStatus(400);
    }
  }
});

app.post("/myJobs", async (req, res) => {
  if (!req.isAuthenticated()) res.sendStatus(401);
  else {
    try {
      const jobList = req.body.listOfJobs;
      let foundJobs = await Job.find({ _id: { $in: jobList } });
      res.json({ foundJobs });
    } catch (err) {
      console.log(err);
      res.sendStatus(500).send("Failed to Read Database");
    }
  }
});

app.post("/updateJob", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  else {
    try {
      updatedJob = req.body.job;
      await Job.updateOne({ _id: updatedJob._id }, updatedJob);
      res.send("Success");
    } catch (err) {
      console.log(err);
      res.sendStatus(400);
    }
  }
});

app.post("/deleteJob", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const jobId = req.body.job._id;
      const appliedUsers = req.body.job.appliedBy;
      await appliedUsers.forEach((user) => {
        JobApplicant.updateMany(
          { userId: user.id },
          { $pull: { appliedJobs: jobId } },
          function (err, user) {
            if (err) console.log(err);
          }
        );
      });
      const gotUsers = req.body.job.gotBy;
      await gotUsers.forEach((id) => {
        JobApplicant.updateMany(
          { userId: id },
          { $set: { foundJob: false } },
          function (err, user) {
            if (err) console.log(err);
          }
        );
      });
      await Recruiter.findOneAndUpdate(
        { listedJobs: jobId },
        { $pull: { listedJobs: jobId } },
        { useFindAndModify: false }
      );
      await Job.deleteOne({ _id: jobId });
      res.send("Success");
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post("/jobApplicants", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const applicants = req.body.jobApplicants;
      let applicantsId = [];
      applicants.forEach((applicant) => {
        applicantsId.push(applicant.id);
      });
      let applicantsInfo = await JobApplicant.find({
        userId: { $in: applicantsId },
      });
      res.json({ applicantsInfo });
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

const sendEmail = (userEmail, jobTitle) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dass.sample.email@gmail.com",
      pass: "dassassignment1",
    },
  });

  var mailOptions = {
    from: "dass.sample.email@gmail.com",
    to: userEmail,
    subject: "U have been accepted to the job!!",
    text: "Ur job application has been accepted for the job " + jobTitle,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent");
    }
  });
};

app.post("/setStatus", async (req, res) => {
  let dateOfJoining = new Date(Date.now());
  let dateString = dateOfJoining.toISOString();
  try {
    if (req.isAuthenticated()) {
      const { jobId, applicationId } = req.body;
      let job = await Job.findById(jobId);
      const title = job.title;
      let newApplications = job.appliedBy.map((application) => {
        if (application._id == applicationId) {
          if (application.status == "Rejected") {
            res.send("Applicant has taken Job elsewhere");
            return;
          }
          application.status = req.body.status;
          if (req.body.status === "Accepted")
            application.dateOfJoining = dateString;
        }
        return application;
      });
      if (req.body.status === "Accepted") {
        job.gotBy.push(req.body.userId);
        let user = await JobApplicant.findOne({ userId: req.body.userId });
        user.foundJob = true;
        await user.save();
        const userEmail = user.email;
        const appliedJobs = user.appliedJobs;
        await Job.find({ _id: { $in: appliedJobs } }, (err, foundJobs) => {
          if (err) console.log(err);
          if (foundJobs) {
            foundJobs.forEach((job) => {
              let newAppliedBy = job.appliedBy.map((application) => {
                if (application.id === req.body.userId) {
                  application.status = "Rejected";
                }
                return application;
              });
              job.appliedBy = newAppliedBy;
              job.save();
            });
          }
        });
        if (userEmail) sendEmail(userEmail, job.title);
      }
      job.appliedBy = newApplications;
      await job.save();

      res.send("Success");
    } else res.sendStatus(401);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.post("/employeeInfo", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      let jobList = req.body.jobList;
      let jobs = await Job.find(
        { _id: { $in: jobList } },
        { title: 1, jobType: 1, appliedBy: 1, _id: 0, gotBy: 1 }
      );
      let employees = [];
      for (let i = 0; i < jobs.length; i++) {
        let title = jobs[i].title;
        let jobType = jobs[i].jobType;
        for (let j = 0; j < jobs[i].appliedBy.length; j++) {
          if (jobs[i].appliedBy[j].status === "Accepted") {
            let dateOfJoining = jobs[i].appliedBy[j].dateOfJoining;
            let user = await JobApplicant.find({
              userId: jobs[i].appliedBy[j].id,
            });
            let name = user[0].name;
            let rating = user[0].rating;
            employees.push({
              name,
              title,
              dateOfJoining,
              jobType,
              rating,
              userId: jobs[i].appliedBy[j].id,
            });
          }
        }
      }
      res.json({ employees });
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post("/updateRating", async (req, res) => {
  try {
    const { userId, newRating } = req.body;
    await JobApplicant.updateOne({ userId }, { rating: newRating });
    res.send("Success");
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post("/updateJobRating", async (req, res) => {
  let dateOfJoining = new Date(Date.now());
  let dateString = dateOfJoining.toISOString();
  try {
    const { jobId, userId, rating } = req.body;
    let job = await Job.findById(jobId);
    let newApplications = job.appliedBy.map((application) => {
      if (application.id === userId) application.rating = rating;

      return application;
    });
    job.appliedBy = newApplications;
    await job.save();
    res.send("Success");
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.listen(8080, function () {
  console.log("Server started on port 8080");
});
