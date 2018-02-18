'use strict';

var username;
var audios = {};

Audio.prototype.fadeIn = function() {
  var actualVolume = 0;

  this.volume = actualVolume;
  this.play();

  var fadeInInterval = setInterval(function() {
    actualVolume = (parseFloat(actualVolume) + 0.1).toFixed(1);
    if (actualVolume <= 1) this.volume = actualVolume;
    else clearInterval(fadeInInterval);
  }.bind(this), 50);
};

Audio.prototype.fadeOut = function() {
  var actualVolume = this.volume;
  var fadeOutInterval = setInterval(function() {
      actualVolume = (parseFloat(actualVolume) - 0.1).toFixed(1);
      if (actualVolume >= 0) this.volume = actualVolume;
      else {
          this.pause();
          this.currentTime = 0;
          clearInterval(fadeOutInterval);
      }
  }.bind(this), 50);
};

$(window).on('load', function() {
  $('.owl-carousel').owlCarousel({
    mouseDrag: false,
    autoWidth: true,
    autoHeight: true,
    dotsSpeed: 400
  });

  setInterval(function() {
    $('.owl-carousel').each(function() {
      console.log($(this).data('owl.carousel'));
      $(this).data('owl.carousel').updateVars();
    });
  },1500);
});

$(function() {
  $('.next').click(function(e) {
    e.preventDefault();
    $(this).addClass('disabled');

    var next = $('.owl-dot.active').next();

    var ids = $('.owl-item.active li').get().map(function(el) {
      return $(el).data('id');
    });

    if ($('.owl-item.active section').hasClass('initial')) {
      username = $('#username').val();

      $.post('/login', {
        username: $('#username').val(),
        password: $('#password').val()
      }, function(data) {
        if (data.success) {
          $.post('/api/initial_song', { username: username }, function(data) {
            // data.push(data[0]); // REMOVE!!!
            data.forEach(function(song) {
              $('.owl-item.active').next()
                .find('ul')
                .append('<li data-id="' + song.id + '">' +
                          '<img src="' + song.coverArt + '">' +
                          '<div>' +
                            '<p>' + song.name + '</p>' +
                            '<p>' + song.artists + '</p>' +
                          '</div>' +
                          '<a href="#" class="listen">' +
                            '<i class="fas fa-volume-up"></i>' +
                          '</a>' +
                        '</li>');

              audios[song.id] = new Audio(song.previewURL);
            });

            $('a.next').removeClass('disabled');
            next.click();

            Sortable.create($('.owl-item.active ul')[0], {
              animation: 150
            });
          });
        }
      });
    } else {
      $.post('/api/authenticate', {
        username: username,
        order: ids
      }, function(data) {
        switch (data.mode) {
          case 'hold':
            // data.songs.push(data.songs[0]); // REMOVE!!!
            data.songs.forEach(function(song) {
              $('.owl-item.active').next()
                .find('ul')
                .append('<li data-id="' + song.id + '">' +
                          '<img src="' + song.coverArt + '">' +
                          '<div>' +
                            '<p>' + song.name + '</p>' +
                            '<p>' + song.artists + '</p>' +
                          '</div>' +
                          '<a href="#" class="listen">' +
                            '<i class="fas fa-volume-up"></i>' +
                          '</a>' +
                        '</li>');
              audios[song.id] = new Audio(song.previewURL);
            });

            $('a.next').removeClass('disabled');
            next.click();

            Sortable.create($('.owl-item.active ul')[0], {
              animation: 150
            });
            break;
          case 'pass':
            alert('Passed');
            $('.owl-dot').first().click();
            break;
          case 'fail':
            alert('Failed');
            $('.owl-dot').first().click();
            break;
          default:
            console.error('Invalid mode: ' + data.mode);
        }
      });
    }
  });

  $('ul').on('click', 'a.listen', function(e) {
    e.preventDefault();
    var audio = audios[$(this).parent().attr('data-id')];

    if ($(this).hasClass('play')) audio.fadeOut();
    else audio.fadeIn();

    $(this).toggleClass('play');
  });
});
