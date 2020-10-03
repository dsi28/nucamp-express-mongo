const mongoose = require("mongoose");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const config = require("./config");
const uploadRouter = require("./routes/uploadRouter");
const favoriteRouter = require("./routes/favoriteRouter");

function auth(req, res, next) {
  console.log(req.user);

  if (!req.session.user) {
    const authHeader = req.headers.authorization;
    if (!req.user) {
      const err = new Error("You are not authenticated!");
      err.status = 401;
      return next(err);
    } else {
      return next();
    }
  } else {
    if (req.session.user === "admin") {
      console.log("req.session:", req.session);
      return next();
    } else {
      const err = new Error("You are not authenticated!");
      err.status = 401;
      return next(err);
    }
  }
}
// app.use(auth);

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();
app.all("*", (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    console.log(
      `Redirecting to: https://${req.hostname}:${app.get("secPort")}${req.url}`
    );
    res.redirect(
      301,
      `https://${req.hostname}:${app.get("secPort")}${req.url}`
    );
  }
});

const campsiteRouter = require("./routes/campsiteRouter");
const promotionRouter = require("./routes/promotionRouter");
const partnerRouter = require("./routes/partnerRouter");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
// app.use(cookieParser('12345-67890-09876-54321'));

app.use(passport.initialize());

app.use("/", indexRouter);
app.use("/users", usersRouter);

// App.use(express.static(path.join (__dirname, 'public')));

app.use("/campsites", campsiteRouter);
app.use("/promotions", promotionRouter);
app.use("/partners", partnerRouter);
app.use("/favorites", favoriteRouter);
app.use("/imageUpload", uploadRouter);

// cath 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

const url = config.mongoUrl;
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connect.then(
  () => console.log("Connected correctly to server"),
  (err) => console.log(err)
);

module.exports = app;
