//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const FormData = require("form-data");
const session = require("express-session");
const passport = require("passport");
const upload = require("express-fileupload");
const { User, JobApplicant, Recruiter, Job } = require("./schemas/schema");
require("./schemas/dummyJobs.js");
const cors = require("cors");
// const findOrCreate = require("mongoose-findorcreate");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;

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
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       callbackURL: "http://localhost:3000/auth/google/secrets",
//     },
//     function (accessToken, refreshToken, profile, cb) {
//       console.log(profile);
//       User.findOrCreate({ googleId: profile.id }, function (err, user) {
//         return cb(err, user);
//       });
//     }
//   )
// );

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

app.get("/currUser", function (req, res) {
  if (typeof req.user === "undefined") res.json();
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
  if (typeof req.user === "undefined")
    res.sendStatus("400").send("Not logged In");
  else {
    userId = req.user._id;
    Job.find(
      { appliedBy: { $elemMatch: { id: userId } } },
      function (err, foundJobs) {
        if (err) {
          console.log(err);
          res.sendStatus(500).send("Failed to read database");
        } else {
          res.json({ foundJobs });
        }
      }
    );
  }
});

// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile"] })
// );

// app.get(
//   "/auth/google/secrets",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   function (req, res) {
//     // Successful authentication, redirect to secrets.
//     res.redirect("/secrets");
//   }
// );
app.post("/updateUserInfo", (req, res) => {
  let chosenModel = Recruiter;
  if (req.body.type == "JA") chosenModel = JobApplicant;
  chosenModel
    .updateOne({ _id: req.body.userInfo._id }, req.body.userInfo)
    .exec()
    .then((foundUser) => res.send("OK"))
    .catch((err) => console.log(err));
});
app.post("/getFile", (req, res) => {
  if (typeof req.user === "undefined") res.sendStatus(400).send("Bad Request");
  else res.download(__dirname + "/uploads/" + req.user._id + req.body.filename);
});
app.post("/storeFile", function (req, res) {
  if (req.files) {
    var file = req.files.file;
    var filename = file.name;
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

app.post("/applyToJob", (req, res) => {
  let sendMsg = "Success";
  const userApplied = {
    id: req.body.userId,
    SOP: req.body.jobSOP,
  };
  const appliedTo = req.body.jobId;
  Job.findByIdAndUpdate(
    appliedTo,
    { $push: { appliedBy: userApplied } },
    { useFindAndModify: false },
    function (err, msg) {
      if (err) {
        console.log(err);
        sendMsg = "Failed";
      } else {
        JobApplicant.updateOne(
          { userId: req.body.userId },
          { $push: { appliedJobs: appliedTo } },
          { useFindAndModify: false },
          function (err, msg) {
            if (err) {
              console.log(err);
            } else {
              sendMsg = "Success";
            }
          }
        );
      }
    }
  );
  res.send(sendMsg);
});

app.listen(8080, function () {
  console.log("Server started on port 8080");
});
