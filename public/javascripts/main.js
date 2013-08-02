$(function() {
  window.user = {};

  // Program entry point: 
  // If local storage session is available, set user's last_login time and load the app
  if (localStorage['token']) {
    SC.accessToken(localStorage['token']);
    // Get the user info from Soundcloud
    SC.get('/me', function(me) {
      // Update user's logged in time
      $.ajax({
        type: 'GET',
        url: '/login/' + me.username + '/' + me.id,
        success: function() {
          // Get local user id
          $.ajax({
            type: 'GET',
            url: '/find/' + me.username + '/' + me.id,
            success: function(data) {
              data = JSON.parse(data);
              user.soundmap_id = data.id;
            }
          });
        }
      });
      $('.userName').append(me.username);
      user = me;
      // get the list of favorites
      favorites();
    });
    // display the disconnect button
    $('#connect').text('disconnect');
  }

  window.bgColors = ['papayawhip', 'saddlebrown', 'lightblue', 'lemonchiffon', 'slateblue', 'cornflowerblue', 'limegreen', 'darkkhaki', 'indianred', 'yellowgreen', 'tomato', 'steelblue', 'crimson'];

  var loadFirstTrack = function() {
    $('h1').slideUp('slow');
    $('.player').fadeIn('slow').show();
  };

  var songIntensity = function() {
    for (var n = 3; n < 140; n+=3) {
      if (pixels[Math.floor(((1800 * n) + 1201.3408655357287) * 4)] === 0) {
        console.log(n);
      }
    }
  };

  // Initialize the widget
  var setWidget = function(trackUrl, trackId) {
    // Cleanup on existing elements
    $('.widgetBox').show();
    $('.heatmap').empty();
    $('.container').removeAttr('style');

    var widgetIframe = document.getElementById('sc-widget');
    var widget = SC.Widget(widgetIframe);

    // Reset the scrubber line
    widget.seekTo(0);
    $('.linewave').remove();
    $('.line').html('<canvas id="linewave" width="580" height="90">');

    widget.load(trackUrl, {
      // auto_play: true,
      buying: false,
      liking: false,
      download: false,
      show_artwork: true,
      show_comments: false
    });

    // Get event points for this track
    var likes = $.ajax({
      type: 'GET',
      url: '/likes/' + trackId,
      success: function(data) {
        var eventPoints = JSON.parse(data);
        eventPoints = eventPoints.event_points;
        console.log(eventPoints);
        var index = 0;
        var triggerPoint = eventPoints[index];

        widget.bind(SC.Widget.Events.READY, function() {
          // When the widget is ready, get the song duration and pass it to the global cache
          widget.getDuration(function(duration) {
            // scrubber(duration);
            user.soundDuration = duration;
          });
          widget.getCurrentSound(function(sound) {
            user.waveform = sound.waveform_url;
            user.currentSongId = sound.id;
            $('.player .artist').html('<a href="' + sound.user.permalink_url + '">' + sound.user.username + '</a>');
            $('.player .trackName').html('<a href="' + sound.permalink_url + '">' + sound.title + '</a>');
            $('.waveform').html('<img src="' + sound.waveform_url + '" width="580" height="90" style="-webkit-mask-box-image: url(\'' + sound.waveform_url + '\');">');
            // outline the heatmap based on the event points
            var markers = $('.heatmap').html();
            for (var i = 0; i < eventPoints.length; i+=1) {
              var loc = (eventPoints[i] * 500) / sound.duration;
              markers += '<aside class="marker" style="left: ' + loc + 'px"></aside>'
              $('.heatmap').html(markers);
            }
          });

          var canvas = document.getElementById('linewave');
          var context = canvas.getContext('2d');
          context.lineWidth = 100;
          context.strokeStyle = '#1888ba';
          context.beginPath();
          context.moveTo(0,45);

          var startPos = 0;

          widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(pos) {
            // console.log('playing the song with the following event points', eventPoints);
            context.lineTo((pos.currentPosition * 580) / user.soundDuration,45);
            context.stroke();
            if (triggerPoint && pos.currentPosition > triggerPoint) {
              console.log('fire event!', index, triggerPoint);
              // $('.container').attr('style', 'background: ' + bgColors[Math.floor(Math.random() * bgColors.length)]);
              index += 1;
              triggerPoint = eventPoints[index];
              // drawLine(startPos, pos.currentPosition, 0);
            } else {
              // drawLine(startPos, pos.currentPosition);
            }
          });
        });
      }
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
        // Check to see if we have a record for this user
        var found = $.ajax({
          type: 'GET',
          url: '/find/' + me.username + '/' + me.id,
          success: function(data) {
            console.log(data);
            if (data) {
              $.ajax({
                type: 'GET',
                url: '/login/' + me.username + '/' + me.id
              });
            } else {
              // If not, create an account for them
              var create = $.ajax({
                type: 'POST',
                url: '/create',
                data: {
                  sc_id: me.id,
                  username: me.username,
                  permalink: me.permalink_url,
                  avatar_url: me.avatar_url,
                  country: me.country,
                  full_name: me.full_name,
                  city: me.city
                }
              });
            }
          }
        });
        $(_this).text('disconnect');
        $('.userName').append(me.username);
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
              <button class="setTrack" data-link="' + fav.permalink_url + '" data-trackid="' + fav.id + '"></button>\
              </div>\
            </div>\
          </div>';
        // load the first favored track to the widget and render the track visible
        if (!loadedFirstTrack) {
          // Set up the widget
          setWidget(fav.permalink_url, fav.id);
          $('.widgetBox').fadeIn(1500);
          loadFirstTrack();
          $('.player .artist').text(fav.user.username);
          $('.player .trackName').text(fav.title);
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
      window.location = '/';
    } else {
      authenticate(this);
    }
  });

  $("#heart").on("click", function() {
    var widgetIframe = $("#sc-widget")[0];
    var widget = SC.Widget(widgetIframe);
    var heart, heartCursor = widget.getPosition(function(pos) {
      heart = pos;
      console.log('<3 ' + heart + '!');
      var submitLikePoint = $.ajax({
        type: 'POST',
        url: '/likesong',
        data: {
          userId: user.soundmap_id,
          trackId: user.currentSongId,
          eventPoint: heart
        },
        success: function() {
          console.log('like point saved!');
        }
      });
    });
  });

  $("#userFavorites").on("click", "button", function() {
    setWidget($(this).data('link'), $(this).data('trackid'));
  });

  $('.player .controls').on('click', '#audio', function() {
    var iframe = document.getElementById('sc-widget');
    var widget = SC.Widget(iframe);
    widget.isPaused(function(paused) {
      if (paused) {
        widget.play();
      } else {
        widget.pause();
      }
    });
    $(this).toggleClass('play');
    $(this).toggleClass('pause');
  });

  // $('.player .controls').on('click', 'button#pause', function() {
  //   var iframe = document.getElementById('sc-widget');
  //   var widget = SC.Widget(iframe);
  //   widget.pause();
  // });

  // $('.player .controls').on('click', 'button#stop', function() {
  //   var iframe = document.getElementById('sc-widget');
  //   var widget = SC.Widget(iframe);
  //   widget.pause();
  //   widget.seekTo(0);
  //   $('.linewave').remove();
  //   $('.line').html('<canvas id="linewave" width="580" height="90">');
  // });

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