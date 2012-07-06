
(function() {
  
  $UI.m.dep("text", function(elem, val, same) {
    if (val !== same)
      elem.text(val);
  });

})();
