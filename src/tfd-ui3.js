(function($) {

  Fundaments.import();

  var eventQ  = [];

  // Data stored on elements
  var D_CHK   = "actslike_checked",
      D_VAL   = "actslike_value",
      D_HID   = "actslike_hidden";

  // Special attributes
  var A_ACT   = "acts-like",
      A_DEP   = "depends-on",
      A_TYP   = "type";

  // Input types that are "checked" or "unchecked"
  var C_TYP   = ["CHECKBOX", "RADIO"];

  // Elements that have values
  var E_VAL   = ["INPUT", "SELECT", "TEXTAREA", "BUTTON"];

  // Special events
  var EV_CG   = "actslike_change",
      EV_FU   = "actslike_form_update";

  $.isInArray = function(needle, haystack) {
    return $.inArray(needle, haystack) >= 0;
  };

  $.fn.actsLike = function() {
    var a;
    return (a = this.attr(A_ACT)) ? a.toUpperCase() : "";
  };

  $.fn.hasAttr = function(attr) {
    return this.is("["+attr+"]");
  };

  $.fn.nodeName = function() {
    return this[0].nodeName.toUpperCase();
  };

  $.fn.nodeName2 = function() {
    var n;
    return (n = this.actsLike()) ? n : this.nodeName();
  };

  $.fn.type = function() {
    var n;
    return (n = this.attr(A_TYP)) ? n.toUpperCase() : "";
  };

  $.fn.checked = function() {
    if (arguments.length)
      return this.attr("checked", !! arguments[0]);
    return this.attr("checked");
  };

  $.fn.checked2 = function() {
    if (arguments.length)
      return this.checked(arguments[0]).data(D_CHK, !! arguments[0]);
    return this.data(D_CHK);
  };

  $.fn.val2 = function() {
    if (arguments.length)
      return this.val(arguments[0]).data(D_VAL, arguments[0]);
    return this.data(D_VAL);
  };

  $.fn.hidden2 = function() {
    if (arguments.length)
      return this.data(D_HID, !! arguments[0]);
    return this.data(D_HID);
  };

  $.fn.show2 = function() {
    this.hidden2(false);
    return this.show();
  };

  $.fn.hide2 = function() {
    this.hidden2(true);
    return this.hide();
  };

  $.fn.toggle2 = function() {
    return this[this.hidden2() ? "show2" : "hide2"];
  };

  $.fn.listen = function() {
    var n = this.nodeName2(),
        t = this.type();
    return ((n === "INPUT" && t === "BUTTON") || n === "BUTTON")
      ? "click" : ($.isInArray(n, E_VAL) ? "change" : "");
  };

  $.fn.initVal = function() {
    var n = this.nodeName2(),
        t = this.type(),
        ret;

    if ($.isInArray(t, C_TYP))
      this.checked2(this.checked());
    else if (n === "SELECT")
      this.val2(this.find("option, ["+A_ACT+"='option']")
                           .filter("[selected]")
                           .attr("value"));
    else if ($.isInArray(n, E_VAL))
      this.val2(this.attr("value"));

    return this;
  };

  $.fn.initEvent = function() {
    var e     = this.listen(),
        jself = this;

    return $.isInArray(this.nodeName2(), E_VAL) && e
      ? this.bind(e, function(event) {
          $("body").trigger(EV_CG, [jself]);
          // translate a click event to a change event if necessary
          if (e == "click") {
            jself.trigger("change");
            return false;
          }
        })
      : this;
  };

  function init() {
    $("body")
      .bind(EV_CG, handleUpdate)
      .bind("change click", processUpdates)
      .find("*").each(function(i,v) {
        $(v).initVal().initEvent();
      });
  };

  function handleUpdate(event, elem) {
    eventQ.push(elem);
  }

  function processUpdates(event) {
    if (event.type != "change")
      return;
    while(eventQ.length)
      console.log(eventQ.shift());
  }

  $(function() {
    init();
  });

})(jQuery);
