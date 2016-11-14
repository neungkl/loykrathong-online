function initStyle() {
  $('.game').css('height', $(window).height() - $('.header').outerHeight() - $('.footer').outerHeight());
}

$(function() {
  initStyle();
});
