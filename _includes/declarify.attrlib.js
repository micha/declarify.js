
(function() {
  
  $UI.m.dep("text", function attrlib_text(elem, val, same) {
    if (val !== same)
      elem.text(val);
  });

})();
