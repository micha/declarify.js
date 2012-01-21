(function($) {

  window.wlog = function(f) {
    Wigwam.async(f, console.log, thrw);
  };

})(jQuery);
