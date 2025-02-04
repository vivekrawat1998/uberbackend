const ridemodel = require('../models/ride.model');
const mapService = require('../services/Maps.services');
const crypto = require('crypto');
async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error('Pickup and destination are required');
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);

  const baseFare = {
    auto: 30,
    car: 50,
    moto: 20,
  };

  const perKmRate = {
    auto: 10,
    car: 15,
    moto: 8,
  };

  const perMinuteRate = {
    auto: 2,
    car: 3,
    moto: 1.5,
  };

  const fare = {
    auto: Math.round(baseFare.auto + ((distanceTime.distance.value / 1000) * perKmRate.auto) + ((distanceTime.duration.value / 60) * perMinuteRate.auto)),
    car: Math.round(baseFare.car + ((distanceTime.distance.value / 1000) * perKmRate.car) + ((distanceTime.duration.value / 60) * perMinuteRate.car)),
    moto: Math.round(baseFare.moto + ((distanceTime.distance.value / 1000) * perKmRate.moto) + ((distanceTime.duration.value / 60) * perMinuteRate.moto))
};

  console.log('Calculated fare:', fare);

  return fare;
}

module.exports.getFare = getFare;

function getOtp(num) {
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}





exports.createRide = async ({ user, pickup, destination, vehicleType }) => {
  console.log('Received Fields:', { user, pickup, destination, vehicleType });

  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error('All fields are required');
  }

  const fare = await getFare(pickup, destination);

  console.log(`Fare for ${vehicleType}:`, fare[vehicleType]);

  const ride = new ridemodel({
    user,
    pickup,
    destination,
    vehicleType,
    otp: getOtp(6),
    fare: fare[vehicleType],
  });

  console.log('Ride Object:', ride);

  return ride.save();
};

module.exports.confirmRide = async ({
  rideId, captain
}) => {
  if (!rideId) {
      throw new Error('Ride id is required');
  }

  await ridemodel.findOneAndUpdate({
      _id: rideId
  }, {
      status: 'accepted',
      captain: captain._id
  })

  const ride = await ridemodel.findOne({
      _id: rideId
  }).populate('user').populate('captain').select('+otp');

  if (!ride) {
      throw new Error('Ride not found');
  }

  return ride;

}

module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) {
      throw new Error('Ride id and OTP are required');
  }

  const ride = await ridemodel.findOne({
      _id: rideId
  }).populate('user').populate('captain').select('+otp');

  if (!ride) {
      throw new Error('Ride not found');
  }

  if (ride.status !== 'accepted') {
      throw new Error('Ride not accepted');
  }

  if (ride.otp !== otp) {
      throw new Error('Invalid OTP');
  }

  await rideModel.findOneAndUpdate({
      _id: rideId
  }, {
      status: 'ongoing'
  })

  return ride;
}