// $(function() {
  var user = user || {};

  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  };

  var userLocation = {};

  var setUserLocation = function(position) {
    user.lat = position.coords.latitude;
    user.lon = position.coords.longitude;
    console.log(user);
    var hostRoom = $.ajax({
      type: 'POST',
      url: '/hostroom',
      data: {
        userId: user.soundmap_id,
        lat: user.lat,
        lon: user.lon
      },
      success: function(data) {
        console.log(data);
      }
    });
  };

  // TODO: Refactor this using setUserLocation with a callback
  var nearbyRooms = function(data) {
    return function(position) {
      user.lat = position.coords.latitude;
      user.lon = position.coords.longitude;
      console.log('*Your* lat/lon is: ', user.lat, user.lon);
      console.log('what is data', data);
      var output = '', distanceOutput = '';
      for (var i = 0; i < data.length; i += 1) {
        var distance = distanceBetweenHostAndClient(data[i].user_lat, data[i].user_lon, user.lat, user.lon);
        if (distance < 0.5) {
          distanceOutput = Math.round(distance * 5280) + 'ft';
          output += '<div>\
            <div>' + data[i].username + ' started a room about ' +
              moment(data[i].date_created).startOf('hour').fromNow() + ' about ' +
              distanceOutput + ' away'
            '</div>\
          </div>';
        }
      }
      $('.rooms').append(output);
    }
  };

  var getLocation = function() {
    if (navigator) {
      navigator.geolocation.getCurrentPosition(setUserLocation);
    }
  };

  var getMyLocation = function(data) {
    var callback = nearbyRooms(data);
    if (navigator) {
      navigator.geolocation.getCurrentPosition(callback);
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

  var distanceBetweenHostAndClient = function(hostLat, hostLon, clientLat, clientLon) {
    var R = 3958.756; // Radius of the earth in miles
    var dLat = (clientLat - hostLat).toRad();
    var dLon = (clientLon - hostLon).toRad();
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(hostLat.toRad()) * Math.cos(clientLat.toRad()) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  }

$(function() {
  if (user.host) {
    var broadcasts = $.ajax({
      type: 'GET',
      url: '/broadcasts',
      success: function(data) {
        data = JSON.parse(data);
        getMyLocation(data);
      }
    });
  }
});

  // function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  //   var R = 6371; // Radius of the earth in km
  //   var dLat = deg2rad(lat2-lat1);  // deg2rad below
  //   var dLon = deg2rad(lon2-lon1); 
  //   var a = 
  //     Math.sin(dLat/2) * Math.sin(dLat/2) +
  //     Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
  //     Math.sin(dLon/2) * Math.sin(dLon/2)
  //     ; 
  //   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  //   var d = R * c; // Distance in km
  //   return d;
  // }

  // function deg2rad(deg) {
  //   return deg * (Math.PI/180)
  // }
// });