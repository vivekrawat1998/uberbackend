const axios = require("axios");
const captainModel = require("../models/captain.model");

module.exports.getAddressCoordinate = async (address) => {
  const apiKey = process.env.GOMAPS_API_KEY;
  const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    console.log(`Requesting URL: ${url}`);
    const response = await axios.get(url);
    if (response.data.status === 'OK') {
      console.log('Geocode API response:', response.data);
      const location = response.data.results[0]?.geometry?.location;
      if (location) {
        return {
          ltd: location.lat,
          lng: location.lng,
        };
      } else {
        throw new Error("Location not found in the Geocode response");
      }
    } else {
      throw new Error('Unable to fetch coordinates');
    }
  } catch (error) {
    handleApiError(error);
    throw new Error("Error occurred while fetching coordinates");
  }
};
module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  const apiKey = process.env.GOMAPS_API_KEY;
  const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    console.log(`Requesting URL: ${url}`);
    const response = await axios.get(url);
    const data = response.data;

    console.log("GoMaps API response:", data);

    if (data.status === "OK") {
      if (response.data.rows[0].elements[0].status === "ZERO_RESULTS") {
        throw new Error("No routes found");
      }

      return response.data.rows[0].elements[0];
    } else {
      console.error("GoMaps API error:", data.status, data.error_message);
      throw new Error("Unable to fetch distance and time");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error request data:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    console.error("Error config:", error.config);
    throw new Error("Error occurred while fetching distance and time");
  }
};

module.exports.getAutoCompleteSuggestion = async (input) => {
  if (!input) {
    throw new Error("Input is required for autocomplete suggestions");
  }

  const apiKey = process.env.GOMAPS_API_KEY;
  const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}`;

  try {
    console.log(`Requesting URL: ${url}`);
    const response = await axios.get(url);
    const data = response.data;

    console.log("GoMaps API autocomplete response:", data);

    if (response.data.status === 'OK') {
      return response.data.predictions.map(prediction => prediction.description).filter(value => value);
    } else {
      throw new Error("Unable to fetch coordinates");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error request data:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    console.error("Error config:", error.config);
    throw new Error("Error occurred while fetching autocomplete suggestions");
  }
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
  console.log(`Searching for captains within ${radius} km of location: ${ltd}, ${lng}`);
  
  // radius in km
  const captains = await captainModel.find({
    location: {
      $geoWithin: {
        $centerSphere: [[ltd, lng], radius / 6371], // 6371 is the radius of Earth in km
      },
    },
  });

  console.log(`Found ${captains.length} captains in the radius`);

  if (captains.length === 0) {
    console.log("No captains found in the specified radius.");
  } else {
    captains.forEach((captain) => {
      console.log(`Captain Location: ${captain.location}`);
    });
  }

  return captains;
};
