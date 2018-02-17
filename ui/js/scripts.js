'use strict';

var audios = {};

$(function() {
  $('.next').click(function(e) {
    e.preventDefault();

    var ids = $('li').get().map(function(el) {
      return $(el).data('id');
    });

    console.log(ids);
  });

  Sortable.create($('ul')[0], {
    animation: 150
  });

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
