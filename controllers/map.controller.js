const mapsService = require("../services/Maps.services");
const { validationResult } = require("express-validator");

module.exports.getCordinates = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { address } = req.query;
    const coordinates = await mapsService.getAddressCoordinate(address);
    res.status(200).json({
      coordinates,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports.getDistanceTime = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { origin, destination } = req.query;
    const distanceTime = await mapsService.getDistanceTime(origin, destination);
    res.status(200).json({
      distanceTime,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports.getAutoCompleteSuggestions = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { input } = req.query;
    const suggestion = await mapsService.getAutoCompleteSuggestion(input);

    res.status(200).json(suggestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ messsage: "Internal server errors" });
  }
};
