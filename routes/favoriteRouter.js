const express = require("express"); // using express middleware
const Favorite = require("../models/favorite"); // using Campsite model
const bodyParser = require("body-parser"); // using body-parser middleware
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find()
      .populate("user")
      .populate("campsite")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // creating a new document in the campsite collection
    //TODO this might be req.user._id or req.user
    console.log(req.body);
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsite")
      .then((favorites) => {
        //check if the campsiteids array from body are in the favorites- if not then add them
        favorites
          .forEach((favorite) => {
            favorite.campsites.filter((campsite) => {
              // check what format the req.body comes in.  should be an array like the instructions say.
              req.body.forEach((bodyCampsite) => {
                if (campsite != bodyCampsite) {
                  favorites.campsites.push(bodyCampsite);
                }
              });
            });
          })
          .catch((err) => next(err));
      });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // put request that is not supported
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //TODO this might be req.user._id or req.user
    Favorite.deleteMany({ user: req.user._id })
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  });
favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    // put request that is not supported
    res.statusCode = 403;
    res.end("GET operation not supported on /favorites");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log(req.body);
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsite")
      .then((favorites) => {
        //check if the campsiteids array from body are in the favorites- if not then add them
        favorites
          .forEach((favorite) => {
            favorite.campsites.filter((campsite) => {
              if (campsite.id != req.params.campsiteId) {
                favorites.campsites.push(req.params.campsiteId);
              }
            });
          })
          .catch((err) => next(err));
      });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // put request that is not supported
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites/campsiteId");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .populate("user")
      .populate("campsite")
      .then((favorite) => {
        // can do this in one line prob
        const favs = favorite.campsites.filter((campsite) => {
          return campsite.id != req.params.campsiteId;
        });
        favorite.campsite = favs;
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
