$(function() {
  window.user = {};

  if (localStorage['token']) {
    console.log('you are connected');
    SC.accessToken(localStorage['token']);
    // display the disconnect button
    $('#connect').text('disconnect');
    // get the list of favorites
    SC.get('/me', function(me) {
      $('.userName').append(me.username);
      user = me;
      favorites();
    });
    // load the first in the player
    // unhide shit
  }

  window.bgColors = ['papayawhip', 'saddlebrown', 'lightblue', 'lemonchiffon', 'slateblue', 'cornflowerblue', 'limegreen', 'darkkhaki', 'indianred', 'yellowgreen', 'tomato', 'steelblue', 'crimson'];

  var loadFirstTrack = function() {
    $('h1').slideUp('slow');
    $('.player').fadeIn('slow').show();
  };

  // Initialize the widget
  var setWidget = function(trackUrl) {
    $('.container').removeAttr('style');
    var widgetIframe = document.getElementById('sc-widget');
    var widget = SC.Widget(widgetIframe);

    widget.load(trackUrl, {
      // auto_play: true,
      buying: false,
      liking: false,
      download: false,
      show_artwork: true,
      show_comments: false
    });

    var eventPoints = [1822, 3500, 4500, 6000, 8000, 10000, 10500];

    var index = 0;
    var triggerPoint = eventPoints[index];

    widget.bind(SC.Widget.Events.READY, function() {
      // When the widget is ready, get the song duration and pass it to the global cache
      widget.getDuration(function(duration) {
        scrubber(duration);
      });

      widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(pos) {
        drawLine(pos.currentPosition);
        if (triggerPoint && pos.currentPosition > triggerPoint) {
          console.log('fire event!', index, triggerPoint);
          $('.container').attr('style', 'background: ' + bgColors[Math.floor(Math.random() * bgColors.length)]);
          index += 1;
          triggerPoint = eventPoints[index];
        }
      });
    });
  };

  // API Calls
  var authenticate = function(_this) {
    SC.initialize({
      client_id: '94d2eca97b9355ab27efa95d60ee64ef',
      redirect_uri: 'http://localhost:3000/authenticated.html'
    });
    SC.connect(function() {
      SC.get('/me', function(me) {
        $(_this).text('disconnect');
        $(".userName").append(me.username);
        // cache the user
        user = me;
        favorites();
      });
      localStorage['token'] = SC.accessToken();
    });
  };

  var favorites = function() {
    var loadedFirstTrack = false;
    SC.get('/users/' + user.id + '/favorites', function(favs) {
      var output = '';
      _(favs).each(function(fav) {
        var imgArtworkUrl = fav.artwork_url || 'https://a2.sndcdn.com/assets/images/default/cloudx120-1ec56ce9.png';
        output += '<div class="favorite" draggable="true">\
            <div class="favoriteArtwork"><img src="' + imgArtworkUrl + '" width="100" height="100"></div>\
            <div class="favoriteDetails">\
              <div class="favoriteArtist artist"><a href="' + fav.user.permalink_url + '">' + fav.user.username + '</a></div>\
              <div class="favoriteTitle title"><a href="' + fav.permalink_url + '">' + fav.title + '</a></div>\
              <div class="favoriteLink">\
              <button class="setTrack" data-link="' + fav.permalink_url + '"></button>\
              </div>\
            </div>\
          </div>';
        // load the first favored track to the widget and render the track visible
        if (!loadedFirstTrack) {
          // Set up the widget
          setWidget(fav.permalink_url);
          $('.widgetBox').fadeIn(1500);
          loadFirstTrack();
          $('.player .trackName').text(fav.title);
          $('.player .artist').text(fav.user.username);
          // $(".heartBox button").fadeIn(1500);
          // $(".userBox").fadeIn(1500);
          loadedFirstTrack = true;
        }
      });
      $("#userFavorites").append(output);
    });
  };

  // Event callbacks
  var dragStart = function() {
    console.log('drag start');
  };

  var dragOver = function() {
    console.log('drag over');
  };

  var drop = function() {
    console.log('drop');
  };

  // Event bindings
  $("#connect").on("click", function() {
    if (localStorage.token) {
      delete localStorage.token;
    } else {
      authenticate(this);
    }
  });

  $(".heartBox button").on("click", function() {
    var widgetIframe = $("#sc-widget")[0];
    var widget = SC.Widget(widgetIframe);
    var heart, heartCursor = widget.getPosition(function(pos) {
      heart = pos;
      console.log('<3 ' + heart + '!');
    });
  });

  $("#userFavorites").on("click", "button", function() {
    setWidget($(this).data('link'));
  });

  $("#userFavorites").on("dragstart", ".favorite", function() {
    dragStart();
  });

  $("#userFavorites").on("dragover", ".favorite", function() {
    dragOver();
  });

  $("#userFavorites").on("drop", ".favorite", function() {
    drop();
  });
});