'use strict';

var username;
var audios = {};

$(function() {
  $(document).ready(function(){
    $('.owl-carousel').owlCarousel({
      mouseDrag: false,
      autoWidth: true,
      autoHeight: true,
      dotsSpeed: 400
    });
  });

  $('.next').click(function(e) {
    e.preventDefault();
    var next = $('.owl-dot.active').next();
    next.click();

    Sortable.create($('.owl-item.active ul')[0], {
      animation: 150
    });

    var ids = $('.owl-item.active li').get().map(function(el) {
      return $(el).data('id');
    });

    username = $('#username').val();

    $.post('/login', {
      username: $('#username').val(),
      password: $('#password').val()
    }, function(data) {
      if (data.success) {
        $.post('/api/initial_song', { username: username }, nextChallenge);
      }
    });

    console.log(ids);
  });

  function nextChallenge(data) {

  }

  $.get('data.json', function(data) {
    data.forEach(function(song) {
      $('<li data-id="' + song.id + '">' +
          '<img src="' + song.coverArt + '">' +
          '<div>' +
            '<p>' + song.name + '</p>' +
            '<p>' + song.artists + '</p>' +
          '</div>' +
          '<a href="#" class="listen"><i class="fas fa-volume-up"></i></a>' +
        '</li>').appendTo('ul');

      audios[song.id] = new Audio(song.previewURL);
    });
  });

  $('ul').on('click', 'a.listen', function(e) {
    e.preventDefault();
    var audio = audios[$(this).parent().attr('data-id')];

    if ($(this).hasClass('play')) audio.pause();
    else audio.play();

    audio.currentTime = 0;
    $(this).toggleClass('play');
  });
});
