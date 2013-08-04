Number.prototype.toRad = function() {
  return this * Math.PI / 180;
};

var userLocation = {};

var setUserLocation = function(position) {
  user.lat = position.coords.latitude;
  user.lon = position.coords.longitude;
  console.log(user);
};

var getLocation = function() {
  if (navigator) {
    navigator.geolocation.getCurrentPosition(setUserLocation);
  }
};

// Testing locations
var peets = {
  lat: 37.774929,
  lon: -122.419416
};

var hackReactor = {
  lat: 37.783594,
  lon: -122.408904
};

var hell = {
  lat: 37.790514,
  lon: -122.399161
};

var bestFishAndChips = {
  lat: 64.135338,
  lon: -21.895210
};

var distanceBetweenHostAndClient = function(lat1, lon1, lat2, lon2) {
  var R = 3958.756; // Radius of the earth in miles
  var dLat = (lat2 - lat1).toRad();
  var dLon = (lon2 - lon1).toRad();
  var a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  var d = R * c;
  return d;
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}