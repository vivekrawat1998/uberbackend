const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const mapController = require("../controllers/map.controller");
const { query } = require("express-validator");

router.get(
  "/get-coordinates",
  authMiddleware.authUser,
  query("address").isString().isLength({ min: 3 }),
  mapController.getCordinates
);

router.get(
  "/get-distance",
  authMiddleware.authUser,
  query("origin").isString().isLength({ min: 3 }),
  query("destination").isString().isLength({ min: 3 }),
  authMiddleware.authUser,
  mapController.getDistanceTime
);

router.get(
  "/get-suggestions",
  authMiddleware.authUser,
  query("input").isString().isLength({ min: 3 }),
  mapController.getAutoCompleteSuggestions
);

module.exports = router;
