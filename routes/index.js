const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/index");
const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const e = require("express");

router.use(cookieParser("secret"));
router.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    maxAge: 3600000,
  })
);

router.use(cookieParser("secret"));

router.use(passport.initialize());
router.use(passport.session());

router.get("/", (req, res) => {
  User.find({}, (err, data) => {
    res.json(data);
  });
});

router.get("/:id", (req, res) => {
  User.findById(req.params.id, (err, data) => {
    res.json(data);
  });
});

router.delete("/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: "User Deleted Successfully !!" });
});

router.post("/", (req, res) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(200).json({
          error: "Email Already Existed!!",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              fullName: req.body.fullName,
              email: req.body.email,
              password: hash,
              phone: req.body.phone,
              diagnosis: req.body.diagnosis,
              prescribedMedication: req.body.prescribedMedication,
              address: req.body.address,
              city: req.body.city,
              state: req.body.state,
              country: req.body.country,
              pincode: req.body.pincode,
            });
            user
              .save()
              .then((result) => {
                res.status(200).json({
                  success: "User Created",
                  result,
                });
              })
              .catch((err) => {
                res.status(200).json({
                  error: "Please Fill Form Correctly",
                });
              });
          }
        });
      }
    });
});

router.put("/:id", async (req, res) => {
  // await User.findByIdAndUpdate(req.params.id, req.body);
  // res.json({ success: "Profile Updated" });
  User.findByIdAndUpdate(req.params.id, req.body, function (err, docs) {
    if(docs){
      res.json({ success: "Profile Updated Successfully !!" });
    }
    else{
      res.json({ error: "Email Already Taken !!" });
    }
    
  });
});

router.put("/password-update/:id", (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      res.json({ error: "Something went wrong !!" });
    } else {
      req.body.password = hash;
      
      User.findByIdAndUpdate(
        { _id: req.params.id },
        { password: req.body.password },
        function (err, docs) {
          res.json({ success: "Password Updated Successfully !!" });
        }
      );
    }
  });
});

router.post("/doctor-login", (req, res) => {
  if (
    req.body.email === "healthcare@gmail.com" &&
    req.body.password === "Healthcare"
  ) {
    res.json({ success: "Login Successfully!!" });
  } else {
    res.json({ error: "Incorrect Email or Password" });
  }
});

router.post("/guest-login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) {
      res.send({ error: "Incorrect Email or Password" });
    } else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send({ user, success: "Login Successfully!!" });
      });
    }
  })(req, res, next);
});

passport.use(
  new localStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
      if (err) throw err;
      if (!user) return done(null, false);

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) throw err;
        if (result === true) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    });
  })
);

passport.serializeUser(function (data, cb) {
  cb(null, data.id);
});
passport.deserializeUser(function (id, cb) {
  User.findOne({ id: id }, (err, data) => {
    cb(err, data);
  });
});

router.get("/logout", (req, res) => {
  res.json({ success: "Logged out Successfully!!" });
  req.logout();
});

module.exports = router;
