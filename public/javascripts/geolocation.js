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
    if (data.length > 0) {
      for (var i = 0; i < data.length; i += 1) {
        var distance = geoDistance(data[i].user_lat, data[i].user_lon, user.lat, user.lon);
        // if (distance < 0.5) {
        if (distance < 25) {
          distanceOutput = Math.round(distance * 5280) + 'ft';
          output += '<div id="' + data[i].broadcast_id + '" class="joinRoom">' + 
            data[i].username + ' started a room about ' +
            moment(data[i].date_created).startOf('hour').fromNow() + ' about ' +
            distanceOutput + ' away</div>';
        }
      }
    } else {
      output = '<div>There are no nearby rooms</div>';
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

var geoDistance = function(lat1, lng1, lat2, lng2) {
  var R = 3958.756; // Radius of the earth in miles
  var dLat = (lat2 - lat1).toRad();
  var dLon = (lng2 - lng1).toRad();
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

$(function() {
  if (window.location.pathname === '/join') {
    var broadcasts = $.ajax({
      type: 'GET',
      url: '/broadcasts',
      success: function(data) {
        data = JSON.parse(data);
        getMyLocation(data);
      }
    });

    // Event bindings
    $('.rooms').on('click', '.joinRoom', function() {
      localStorage.room = $(this).attr('id');
      window.location = '/';
    });
  }
});
