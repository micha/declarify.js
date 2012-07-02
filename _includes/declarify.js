
Fundaments.load();

(function() {
  
  var eventQ = [];

  /**
   * Returns a function that, when called with no arguments, invokes the given
   * method on the `this` object, with the given (optional) arguments. This is
   * useful for mapping over the jQuery object:
   *
   *   $(foo).map($.invoke("hasClass", "foo"));
   */
  $.invoke = function(meth) {
    var args = rest(arguments);
    return function() {
      return $(this)[meth].apply($(this), args);
    }
  };

  /**
   * Quote special css chars in a selector.
   */
  $.sq = function(x) {
    return x.replace(/([^a-zA-Z0-9-_])/g, '\\$1');
  };

  $.fn.qElem = function() {
    if (this.size() > 1)
      return this.each($.invoke("qElem"));
    eventQ.push(this[0]);
    return this;
  }

  function prepare(elem) {
    map(partial(apply, _, [elem]), prepare.fns);
    return elem;
  }

  function init() {
    map(apply, init.fns);
  }

  function run() {
  }

  $.fn.prepare = function() {
    if (this.size() > 1)
      return this.each($.invoke("prepare"));
    return prepare(this);
  };

  $UI = {
    q:            function() { return eventQ },
    init:         init.fns    = [],
    prepare:      prepare.fns = [],
    run:          run,
  };

  $(function() {
    init();
    prepare($("html"));
  });

})();

(function() {

  var attrHlrs    = {},
      preAttrHlrs = {};

  // Log attr mutation events in the console (if available)
  if ( window.console && window.console.log ) { 
    $(document).bind('pre-attr attr pre-val val', function(event) {
      console.log('Event %s%s: %o %o %o', event.type, 
        event.attrName ? ' @'+event.attrName : '', 
        event.newValue, event, event.target);

      if ( event.isDefaultPrevented() ) { 
        console.log('DEFAULT PREVENTED');
      }   
    }); 
  }

  $(document).initMutation();

  (function(orig) {
    $.attr = function(elem, name, newValue, silent) {
      return $.type(newValue) === "boolean"
        ? (newValue
            ? orig.call(this, elem, name, name, silent)
            : $.removeAttr(elem, name))
        : orig.call(this, elem, name, newValue, silent);
    };
  })($.attr);

  function handler(hlrs) {
    return function(event) {
      if (event.attrName in hlrs)
        map(applyto([event.target, event.prevValue, event.newValue, event]),
            hlrs[event.attrName]);
    }
  };

  $UI.attr = function(name, fn) {
    attrHlrs[name] = concat(attrHlrs[name] || [], [fn]);
  };

  $UI.preAttr = function(name, fn) {
    preAttrHlrs[name] = concat(preAttrHlrs[name] || [], [fn]);
  };

  $(document).bind('pre-attr', handler(preAttrHlrs));
  $(document).bind('attr', handler(attrHlrs));
})();

(function() {

  $UI.prepare.push(function(elem) {
    var fe;

    function dataAttrs(sel, attrs) {
      map(function(x) {
        elem
          .andSelf()
          .find(sel)
          .filter("["+$.sq(x)+"]")
          .each(function() {
            $.attr(this, "data-"+x, $(this).attr(x), true);
          })
          .end()
          .filter("[data-"+$.sq(x)+"]")
          .not("["+$.sq(x)+"]")
          .each(function() {
            $.attr(this, x, $(this).attr("data-"+x), true);
          });
      }, attrs);
    }

    function stateAttr(name) {
      $UI.attr(name, function(elem, ini, fin) {
        $(elem)[(fin ? "add" : "remove")+"Class"](name.replace(/^data-/,""));
      });
    }

    dataAttrs("input,select,textarea", ["checked", "type", "value"]);
    dataAttrs("option", ["selected"]);

    stateAttr("data-checked");
    stateAttr("data-selected");
    stateAttr("data-active");
    stateAttr("data-focused");
    stateAttr("data-disabled");
    stateAttr("data-readonly");
  });

})();
