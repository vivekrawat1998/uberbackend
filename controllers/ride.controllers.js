const { validationResult } = require("express-validator");
const rideService = require("../services/ride.services");
const mapServices = require("../services/Maps.services");
const { sendMessageToSocketId } = require("../socket");
const rideModel = require("../models/ride.model")

module.exports.createRide = async (req, res) => {
    console.log("Received Request Body:", req.body);
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { pickup, destination, vehicleType } = req.body;
    const userId = req.user._id;
  
    if (!pickup || !destination || !vehicleType) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    try {
      const ride = await rideService.createRide({
        user: userId,
        pickup: pickup,
        destination: destination,
        vehicleType: vehicleType,
      });
  
      res.status(201).json(ride);
  
      const pickupCordinates = await mapServices.getAddressCoordinate(pickup);
      const distance = await mapServices.getDistanceTime(pickup,destination)
      const distanceInKm = distance.distance.value / 1000;
      console.log("Pickup Coordinates:", pickupCordinates);
  
      const captainInRadius = await mapServices.getCaptainsInTheRadius(
        pickupCordinates.ltd,
        pickupCordinates.lng,
        distanceInKm,
        100
      );
  
      ride.otp = "";
  
      const rideWithUser = await rideModel
        .findOne({ _id: ride._id })
        .populate("user");
  
      captainInRadius.forEach((captain) => {
        sendMessageToSocketId(captain.socketId, {
          event: "new-ride",
          data: rideWithUser,
        });
      });
  
      console.log(captainInRadius);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  };
  
  
module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { pickup, destination } = req.query;
  try {
    const fare = await rideService.getFare(pickup, destination);
    return res.status(200).json(fare);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
      const ride = await rideService.confirmRide({ rideId, captain: req.captain });

      sendMessageToSocketId(ride.user.socketId, {
          event: 'ride-confirmed',
          data: ride
      })

      return res.status(200).json(ride);
  } catch (err) {

      console.log(err);
      return res.status(500).json({ message: err.message });
  }
}

module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  try {
      const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

      console.log(ride);

      sendMessageToSocketId(ride.user.socketId, {
          event: 'ride-started',
          data: ride
      })

      return res.status(200).json(ride);
  } catch (err) {
      return res.status(500).json({ message: err.message });
  }
}