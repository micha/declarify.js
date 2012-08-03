
(function() {
  
  $UI.m.dep("text", function attrlib_text(elem, val) {
    elem.text(val);
  });

  $UI.m.dep("class", function attrlib_class(elem, val, classname) {
    elem[(val ? "add" : "remove") + "Class"](classname);
  });

  $UI.m.dep("log", function attrlib_text(elem, val, tag) {
    console.log(tag+":", val);
  });

  $UI.attr("data-hide", function(elem, ini, fin, op) {
    $(elem)[fin ? "hide" : "show"]();
  });

})();
