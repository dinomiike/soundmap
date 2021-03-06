$(function() {
  window.user = {};
  user.hotspots = [];
  user.triggerPoint = '';
  user.triggerIndex = 0;
  var WAVEFORM_LENGTH = 668;
  var canvas = document.getElementById('sc-widget');
  var context = '';
  var imageCache = ['/images/heart-btn-hover.png'];

  // Program entry point: 
  // If local storage session is available, set user's last_login time and load the app
  if (localStorage['token']) {
    $('.header').attr('visibility: visible');
    $('.intro').hide();
    $('#sc-nav-login').hide();
    SC.accessToken(localStorage['token']);
    // Get the user info from Soundcloud
    SC.get('/me', function(me) {
      $('.splash').hide();
      $('header').attr('style', 'visibility: visible');
      $('#sc-nav-login').hide();
      // Update user's logged in time
      $.ajax({
        type: 'GET',
        url: '/login/?user=' + me.username + '&scid=' + me.id,
        success: function() {
          // Get local user id
          $.ajax({
            type: 'GET',
            url: '/find/?username=' + me.username + '&scid=' + me.id,
            success: function(data) {
              data = JSON.parse(data);
              user.soundmap_id = data.id;
            }
          });
        }
      });
      $('.userName').append(me.username);
      _.extend(user, me);
      // get the list of favorites
      favorites();
    });
    // display the disconnect button
    $('#connect').text('disconnect');

    // Show the queue initially if there are items in the queue
    var queueCheck = localStorage.queue;
    if (queueCheck) {
      queueCheck = JSON.parse(queueCheck);
      if (queueCheck.length > 0) {
        $('.queue').show();
      }
    }
  } else {
    // Render the home page
    $('.logoBox img').hide();
    $('.splash').show();
    $('.intro').show();
    $('.intro img').show();
  }

  var loadFirstTrack = function() {
    $('h1').fadeOut('slow');
    $('.player').fadeIn('slow').show();
  };

  // Helper functions
  // var songIntensity = function() {
  //   for (var n = 3; n < 140; n+=3) {
  //     if (pixels[Math.floor(((1800 * n) + 1201.3408655357287) * 4)] === 0) {
  //       console.log(n);
  //     }
  //   }
  // };

  var simplifyOutput = function(str) {
    if (str.length > 50) {
      var pos = 50;
      while (str[pos-1] === ' ') {
        pos -= 1;
      }
      return str.substring(0, pos) + '...';
    }
    return str;
  };

  var pluralize = function(num, word) {
    if (num > 1) {
      return word + 's';
    } else {
      return word;
    }
  };

  // Decrement a decimal or integer by 1
  var decrement = function(n) {
    if ((n % 1) > 0) {
      // A decimal number
      var decimals = n.toString().split('.');
      return parseFloat(decimals[0] + '.' + ((decimals[1] * 1) - 1));
    } else {
      // An integer
      return n - 1;
    }
  };

  var getHeatColor = function(n, max, min) {
    var limiter = Math.abs((min - max) / 4);
    var redUpperLimit = max;
    var redLowerLimit = max - limiter;
    var orangeUpperLimit = decrement(redLowerLimit);
    var orangeLowerLimit = orangeUpperLimit - limiter;
    var yellowUpperLimit = decrement(orangeLowerLimit);
    var yellowLowerLimit = yellowUpperLimit - limiter;
    var greenUpperLimit = decrement(yellowLowerLimit);
    var greenLowerLimit = 1;

    if (n <= redUpperLimit && n >= redLowerLimit) {
      // return 'red';
      // return '#08306B';
      // return '#f8716d';
      return '#de4d46';
    } else if (n <= orangeUpperLimit && n >= orangeLowerLimit) {
      // return 'orange';
      // return '#08519C';
      return '#fca377';
    } else if (n <= yellowUpperLimit && n >= yellowLowerLimit) {
      // return 'yellow';
      // return '#9ECAE1';
      return '#e7e581';
    } else if (n <= greenUpperLimit && n >= greenLowerLimit) {
      // return 'green';
      // return '#6BAED6';
      return '#6abf7c';
    } else {
      return false;
    }
  };

  // Initialize the widget
  var setWidget = function(trackUrl, trackId) {
    // Cleanup on existing elements
    $('.markers').empty();
    $('.cells').empty();
    $('.container').removeAttr('style');
    $('#audio').removeClass('pause');
    $('#audio').addClass('play');
    $('.playtime').text('0:00');
    $('#cheer').hide();

    var widgetIframe = document.getElementById('sc-widget');
    var widget = SC.Widget(widgetIframe);

    // Reset the hotspot cache
    user.hotspots = [];
    user.triggerPoint = '';
    user.triggerIndex = 0;

    // Reset the scrubber line
    widget.seekTo(0);
    $('.linewave').remove();
    $('.line').html('<canvas id="linewave" width="' + WAVEFORM_LENGTH + '" height="90">');

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
        // Define the parameters for determining heat color once per song
        var max = 0, min = 0;
        widget.bind(SC.Widget.Events.READY, function() {
          $('.loadingScreen').fadeOut();
          widget.bind(SC.Widget.Events.FINISH, function() {
            var queue = JSON.parse(localStorage.queue);
            if (queue !== undefined && queue.length >= 1) {
              var next = queue.shift();
              localStorage.queue = JSON.stringify(queue);
              $('.loadingScreen').show();
              setWidget(next[0], next[1]);
              setQueueDisplay(queue);
            }
          });
          // When the widget is ready, get the song duration and pass it to the global cache
          widget.getCurrentSound(function(sound) {
            user.soundDuration = sound.duration;
            // Has the user liked this song before?
            var userLikeCheck = $.ajax({
              type: 'GET',
              url: '/hasliked/?userid=' + user.soundmap_id + '&trackid=' + sound.id,
              success: function(data) {
                var hasLiked = JSON.parse(data);
                if (hasLiked) {
                  // Generate the heat map for this track
                  var heatmap = $.ajax({
                    type: 'GET',
                    url: '/heatmap/' + trackId + '/' + user.soundDuration,
                    success: function(data) {
                      var heatcells = JSON.parse(data);
                      // console.log(heatcells);
                      window._heatcells = heatcells;
                      max = _.max(heatcells);
                      min = _.min(heatcells);
                      var cellWidth = (1000 * WAVEFORM_LENGTH) / user.soundDuration;
                      var offset = 0, heatcolor;
                      for (var i = 0; i < heatcells.length; i += 1) {
                        if (heatcells[i] > 0) {
                          heatcolor = getHeatColor(heatcells[i], max, min);
                          if (heatcolor === '#de4d46') {
                            user.hotspots.push(i * 1000);
                          }
                          offset = ((i * 1000) * WAVEFORM_LENGTH) / user.soundDuration;
                          $('.cells').append('<aside class="cell" style="left: ' + offset + 'px; width: ' + cellWidth + 'px; background: ' + heatcolor + ';"></aside>');
                        }
                      }
                      // Clear out the existing d3 graphic element
                      $('svg').remove();
                      renderGraph(data);
                      $('.controls').append('<button id="toggleGraph">graph</button>');

                      user.triggerPoint = user.hotspots[user.triggerIndex];
                    }
                  });
                  // Display a marker where the user has liked the song
                  setMarker(hasLiked[0].event_point);
                } else {
                  // Don't generate a heat map in this scenario
                  $('#toggleGraph').remove();
                }
              }
            });

            user.waveform = sound.waveform_url;
            user.currentSongId = sound.id;
            $('.player .artist').html('<a href="' + sound.user.permalink_url + '">' + sound.user.username + '</a>');
            $('.player .trackName').html('<a href="' + sound.permalink_url + '">' + sound.title + '</a>');
            $('.waveform').attr('style', 'background-image: url(' + sound.waveform_url + ')');

          });
          // widget.getCurrentSound(function(sound) {
            // user.waveform = sound.waveform_url;
            // user.currentSongId = sound.id;
            // $('.player .artist').html('<a href="' + sound.user.permalink_url + '">' + sound.user.username + '</a>');
            // $('.player .trackName').html('<a href="' + sound.permalink_url + '">' + sound.title + '</a>');
            // $('.waveform').attr('style', 'background-image: url(' + sound.waveform_url + ')');

            // place the markers based on the event points -- hiding this feature for now
            // var markers = $('.markers').html();
            // for (var i = 0; i < eventPoints.length; i+=1) {
            //   var loc = (eventPoints[i] * WAVEFORM_LENGTH) / sound.duration;
            //   markers += '<aside class="marker" style="left: ' + loc + 'px"></aside>'
            //   $('.markers').html(markers);
            // }
          // });

          // var canvas = document.getElementById('linewave');
          // var context = canvas.getContext('2d');
          canvas = document.getElementById('linewave');
          context = canvas.getContext('2d');
          context.lineWidth = 100;
          // context.strokeStyle = '#1888ba';
          // context.strokeStyle = '#08519C';
          // var gradient = context.createLinearGradient(canvas.width / 2, 0, canvas.width / 2, canvas.height);
          // gradient.addColorStop(0, '#000000');
          // gradient.addColorStop(1, '#FFFFFF');
          // context.fillStyle = gradient;
          context.strokeStyle = '#1888ba';
          context.beginPath();
          context.moveTo(0,45);

          var startPos = 0;

          var cheerTimer = 0;

          var minutes = 0, seconds = 0;

          widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(pos) {
            seconds = Math.floor(pos.currentPosition / 1000);
            clockSeconds = seconds % 60;
            minutes = Math.floor(seconds / 60);
            if (clockSeconds <= 9) {
              clockSeconds = '0' + clockSeconds.toString();
            }
            $('.playtime').text(minutes + ':' + clockSeconds);
            context.lineTo((pos.currentPosition * WAVEFORM_LENGTH) / user.soundDuration,45);
            context.stroke();
            if (user.triggerPoint && pos.currentPosition > user.triggerPoint) {
              // console.log('fire event!', user.triggerIndex, user.triggerPoint);
              user.triggerIndex += 1;
              user.triggerPoint = user.hotspots[user.triggerIndex];
              $('#cheer').show('fast');
              if (cheerTimer >= 0) {
                cheerTimer = setTimeout(function() {
                  $('#cheer').fadeOut(500);
                }, 1000);
              }
            }
          });
        });
      }
    });
  };

  var enqueue = function(trackUrl, trackId, trackTitle) {
    if (localStorage.queue === '' || localStorage.queue === undefined) {
      localStorage.queue = JSON.stringify([[trackUrl, trackId, trackTitle]]);
    } else {
      var queue = JSON.parse(localStorage.queue);
      queue.push([trackUrl, trackId, trackTitle]);
      localStorage.queue = JSON.stringify(queue);
    }
  };

  var setQueueDisplay = function(queue) {
    if (localStorage.queue) {
      queue = queue || JSON.parse(localStorage.queue);
      if (queue && queue.length > 0) {
        $('.upNext').text('Up next:');
      } else {
        $('.upNext').text('');
      }
    }
  };

  var renderQueueList = function(option) {
    if (localStorage.queue) {
      var queue = JSON.parse(localStorage.queue);
      var output = '';
      // Ensure there are items in the queue
      if (queue.length > 0) {
        $('.queue').show();
        if (option === 'add') {
          // Add the last song added to the queue
          output = '<li class="queueItems">' + queue[queue.length - 1][2] + '</li>';
        } else if (option === 'initialize') {
          // Initialize all items in the queue
          for (var i = 0; i < queue.length; i += 1) {
            output += '<li class="queueItems">' + queue[i][2] + '</li>';
          }
        } else if (option === 'remove') {
          // Remove the first song in the queue
          // if (queue.length === 1) {
          //   $('.upNext').text('');
          // }
          $('.queueList :first-child').remove();
        }
      } else {
        $('.queue').hide();
      }
      $('.queueList').append(output);
    }
  };

  // API Calls
  var authenticate = function(_this) {
    var logoutButton = _this || $('#connect');
    $.ajax({
      type: 'GET',
      url: '/init',
      success: function(data) {
        var connectionObject = JSON.parse(data);
        SC.initialize({
          client_id: connectionObject.client_id,
          redirect_uri: connectionObject.redirect_uri
        });
        SC.connect(function() {
          SC.get('/me', function(me) {
            // Check to see if we have a record for this user
            var found = $.ajax({
              type: 'GET',
              url: '/find/?username=' + me.username + '&scid=' + me.id,
              success: function(data) {
                $('.splash').hide();
                $('#sc-nav-login').hide();
                $('header').attr('style', 'visibility: visible');
                // console.log(data);
                data = JSON.parse(data);
                if (data) {
                  $.ajax({
                    type: 'GET',
                    url: '/login/?user=' + me.username + '&scid=' + me.id,
                    success: function() {
                      user.soundmap_id = data.id;
                    }
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
                    },
                    success: function() {
                      $('.splash').hide();
                      $('header').attr('style', 'visibility: visible');
                      // User has been created. Now to retrieve their id and log them in
                      var findUser = $.ajax({
                        type: 'GET',
                        url: '/find/?username=' + me.username + '&scid=' + me.id,
                        success: function(data) {
                          data = JSON.parse(data);
                          if (data) {
                            user.soundmap_id = data.id;
                            alert(user.soundmap_id);
                          }
                        }
                      });
                    }
                  });
                }
              }
            });
            $(logoutButton).text('disconnect');
            $('.userName').append(me.username);
            // cache the user
            _.extend(user, me);
            favorites();
          });
          localStorage['token'] = SC.accessToken();
        });
      }
    });
  };

  var favorites = function() {
    var loadedFirstTrack = false;
    SC.get('/users/' + user.id + '/favorites', {limit: 200}, function(favs) {
      var output = '<h4>Your SoundCloud Favorites</h4>';
      _(favs).each(function(fav) {
        var imgArtworkUrl = fav.artwork_url || 'https://a2.sndcdn.com/assets/images/default/cloudx120-1ec56ce9.png';
        output += '<div class="favorite" draggable="true" data-trackid="' + fav.id + '" data-trackurl="' + fav.permalink_url + '">\
            <div class="favoriteArtwork"><img src="' + imgArtworkUrl + '" width="100" height="100"></div>\
            <div class="favoriteDetails">\
              <div class="favoriteArtist artist"><a href="' + fav.user.permalink_url + '">' + fav.user.username + '</a></div>\
              <div class="favoriteTitle title"><a href="' + fav.permalink_url + '">' + fav.title + '</a></div>\
              <div class="favoriteLink">\
              <button class="setTrack" data-link="' + fav.permalink_url + '" data-trackid="' + fav.id + '">play</button>\
              <button class="queueTrack" data-link="' + fav.permalink_url + '" data-trackid="' + fav.id + '" data-title="' + fav.title.replace(/\"/g, '&quot;') + '">queue</button>\
              </div>\
            </div>\
          </div>';
        // load the first favored track to the widget and render the track visible
        if (!loadedFirstTrack) {
          // Set up the widget
          $('.loadingScreen').show();
          setWidget(fav.permalink_url, fav.id);
          loadFirstTrack();
          $('.player .artist').text(fav.user.username);
          $('.player .trackName').text(fav.title);
          setQueueDisplay();
          renderQueueList('initialize');
          loadedFirstTrack = true;
        }
      });
      $("#userFavorites").append(output);
    });
  };

  var getPopularContent = function() {
    var popular = $.ajax({
      type: 'GET',
      url: '/popular',
      success: function(data) {
        var results = JSON.parse(data);
        var output = '<h4>Popular songs</h4>';
        for (var i = 0; i < results.length; i += 1) {
          output += '<div class="popularTracks" data-trackid="' + results[i].track_id + '" data-trackurl="' + results[i].permalink_url + '">\
            <div class="likeCount">' + results[i].like_count + '<em>' + pluralize(results[i].like_count, 'like') + '</em></div>\
            <div><img src="' + results[i].artwork_url + '" width="100" height="100"></div>\
            <div class="likeTrackTitle">' + simplifyOutput(results[i].track_title) + '</div>\
          </div>';
        }
        $('.popularBox').append(output);
      }
    });
  };

  var getRecentContent = function() {
    var recent = $.ajax({
      type: 'GET',
      url: '/recent',
      success: function(data) {
        var results = JSON.parse(data);
        var toggle = ' right';
        var output = '<h4>Recently liked songs</h4>\
          <div class="recentLikes">';
        for (var i = 0; i < results.length; i += 1) {
          if (toggle === '') {
            toggle = ' right';
          } else {
            toggle = '';
          }
          output += '<div class="recentLike">\
            <div class="userLike">\
            <div class="likeBlockUserName' + toggle + '" data-trackid="' + results[i].track_id + '" data-trackurl="' + results[i].uri + '">' + results[i].track_title + ' liked by ' + results[i].username + ' ' + moment(results[i].date_set).startOf('minute').fromNow() + '</div>\
            <div class="likeBlockUserAvatar' + toggle + '"><img src="' + results[i].avatar_url + '"></div>\
            </div>\
          </div>';
        }
        output += '</div>';
        $('.recentBox').append(output);
      }
    });
  };

  var setMarker = function(pos) {
    // Grab the existing marker for this user (if any)
    var currentMarker = $('.markers .me');
    if (currentMarker.length > 0) {
      for (var i = 0; i < currentMarker.length; i += 1) {
        $(currentMarker[i]).remove();
      }
    }
    var loc = (pos * WAVEFORM_LENGTH) / user.soundDuration;
    $('.markers').append('<aside class="marker me" style="left: ' + loc + 'px;"></aside');
    $('.markers').append('<aside class="note me" style="left: ' + (loc - 23) + 'px;">Me</aside>');
  };

  // Event bindings
  $('#logo').on('click', function() {
    window.location = '/';
  });

  $('#queue').on('click', function() {
    ($('.queue').is(':visible')) ? $('.queue').slideUp() : $('.queue').slideDown();
  });

  $('#popular').on('click', function() {
    var popularVisible = $('.news').is(':visible');
    if (popularVisible) {
      $('.news').slideUp('fast');
      $('.popularBox').empty();
      $('.recentBox').empty();
    } else {
      getPopularContent();
      getRecentContent();
      $('.news').slideDown('slow');
    }
  });

  $('#host').on('click', function() {
    if ($('.host').is(':visible')) {
      $('.host').hide();
      $('.host .container').empty();
    } else {
      // var output = '<div>Would you like to host a music room? Soundmap will need your location information to continue. Is that all right with you?\
      //   <button id="hostAgree">Yep</button> <button id="hostReject">Hell Nah</button></div>';
      var output = '<div>This feature is still under development but will be available soon</div>';
      $('.host .container').prepend(output);
      $('.host').show();
    }
  });

  $('#connect').on('click', function() {
    if (localStorage.token) {
      delete localStorage.token;
      window.location = '/';
    } else {
      authenticate(this);
    }
  });

  $('#sc-connect').on('click', function() {
    authenticate();
  });

  $('#sc-connect').on('touchstart', function() {
    authenticate();
  });

  $('#heart').on('click', function() {
    var widgetIframe = $('#sc-widget')[0];
    var widget = SC.Widget(widgetIframe);
    var heart, heartCursor = widget.getPosition(function(pos) {
      heart = pos;
      widget.getCurrentSound(function(sound) {
        var submitLikePoint = $.ajax({
          type: 'POST',
          url: '/likesong',
          data: {
            userId: user.soundmap_id,
            trackId: user.currentSongId,
            trackTitle: sound.title,
            artistId: sound.user.id,
            artist: sound.user.username,
            uri: sound.uri,
            permalinkUrl: sound.permalink_url,
            artworkUrl: sound.artwork_url || 'https://a2.sndcdn.com/assets/images/default/cloudx120-1ec56ce9.png',
            genre: sound.genre.replace("'", "''"),
            label: sound.label_name,
            bpm: sound.bpm,
            eventPoint: heart
          },
          success: function() {
            // console.log('like point saved!');
            setMarker(heart);
          }
        });
      });
    });
  });

  $('.controls').on('click', '#toggleGraph', function() {
    // $('#likechart').toggleClass('hideLikeGraph');
    if ($('#likechart').is(':visible')) {
      $('#likechart').hide();
      $('.heatmap').show();
      $('.waveform').show();
    } else {
      $('#likechart').show();
      $('.heatmap').hide();
      $('.waveform').hide();
    }
  });

  $('#userFavorites').on('click', '.setTrack', function() {
    $('.loadingScreen').show();
    setWidget($(this).data('link'), $(this).data('trackid'));
    $("html, body").animate({ scrollTop: 0 }, "slow");
  });

  $('#userFavorites').on('click', '.queueTrack', function() {
    enqueue($(this).data('link'), $(this).data('trackid'), $(this).data('title'));
    setQueueDisplay();
    renderQueueList('add');
  });

  $('.controls').on('click', '#audio', function() {
    var widget = SC.Widget(document.getElementById('sc-widget'));
    widget.toggle();
    $(this).toggleClass('play');
    $(this).toggleClass('pause');
  });

  $('.controls').on('click', '#next', function() {
    var queue = !!(localStorage.queue) ? JSON.parse(localStorage.queue) : false;
    if (queue && queue.length > 0) {
      $('.loadingScreen').show();
      setWidget(queue[0][0], queue[0][1], queue[0][2]);
      renderQueueList('remove');
      queue.shift();
      localStorage.queue = JSON.stringify(queue);
      if (queue.length === 0) {
        $('.queue').slideUp('slow');
      }
    }
  });

  $('.controls').on('click', '#mute', function() {
    var widget = SC.Widget(document.getElementById('sc-widget'));
    widget.getVolume(function(volume) {
      if (volume > 0) {
        widget.setVolume(0);
      } else {
        widget.setVolume(100);
      }
    });
    $('#mute').toggleClass('unmute');
  });

  $('.popularBox').on('click', '.popularTracks', function() {
    $('.loadingScreen').show();
    setWidget($(this).data('trackurl'), $(this).data('trackid'));
    $("html, body").animate({ scrollTop: 0 }, "slow");
  });

  $('.recentBox').on('click', '.likeBlockUserName', function() {
    $('.loadingScreen').show();
    setWidget($(this).data('trackurl'), $(this).data('trackid'));
    $("html, body").animate({ scrollTop: 0 }, "slow");
  });

  $('.news').on('click', '#hostAgree', function() {
    user.host = true;
    getLocation();
  });

  $('.news').on('click', '#hostReject', function() {
    $('.news').hide();
  });

  // $('#userFavorites').on('click', '.favorite', function() {
  //   setWidget($(this).data('trackurl'), $(this).data('trackid'));
  // });

  // $("#userFavorites").on("dragstart", ".favorite", function() {
  //   dragStart();
  // });

  // $("#userFavorites").on("dragover", ".favorite", function() {
  //   dragOver();
  // });

  // $("#userFavorites").on("drop", ".favorite", function() {
  //   drop();
  // });

  $('.scrubber').on('mouseup', function(e) {
    var iframe = document.getElementById('sc-widget');
    var widget = SC.Widget(iframe);
    widget.isPaused(function(isPaused) {
      if (!isPaused) {
        var seekTime = ((user.soundDuration * e.offsetX) / WAVEFORM_LENGTH);
        widget.seekTo(seekTime);
        $('.linewave').remove();
        $('.line').html('<canvas id="linewave" width="' + WAVEFORM_LENGTH + '" height="90">');
        canvas = document.getElementById('linewave');
        context = canvas.getContext('2d');
        context.lineWidth = 100;
        context.strokeStyle = '#1888ba';
        context.beginPath();
        context.moveTo(0,45);
        context.lineTo(e.offsetX,45);
        context.stroke();
      }
    });
  });
});