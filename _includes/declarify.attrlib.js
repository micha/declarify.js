
(function() {
  
  $UI.m.dep("text", function attrlib_text(elem, val) {
    elem.text(val);
  });

  $UI.m.dep("class", function attrlib_class(elem, val, classname) {
    elem[(val ? "add" : "remove") + "Class"](classname);
  });

})();
