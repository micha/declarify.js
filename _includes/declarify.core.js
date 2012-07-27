
Fundaments.load();

console = console || {};
console.time = console.time || function() {};
console.timeEnd = console.timeEnd || function() {};

console.time("load");

(function() {

  var eventQ=[], nextQ=[];
  
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

  /**
   * Get a map of this element's attributes and their associated values.
   */
  $.fn.attrMap = function() {
    var ret = {};
    if (this.size())
      $.each(this.get(0).attributes, function(i,attr) {
        ret[attr.nodeName.toLowerCase()] = attr.nodeValue;
      });
    return ret;
  };

  $.fn.pop = function() {
    var ret = this.get(-1);
    this.splice(this.length-1,1);
    return ret;
  };

  $.fn.shift = function() {
    var ret = this.get(0);
    this.splice(0,1);
    return ret;
  };

  /**
   * Get the child element of this element with name attribute set to `name`
   */
  $.fn.byName = function(name) {
    var ret = $("[data-name='"+$.sq(name)+"']", this);
    //ret = ret.filter($.invoke("isVisibleParents"));
    return ret.type() == "radio" ? ret.filter("[data-checked]") : ret;
  };

  /**
   * The type attribute of this element.
   */
  $.fn.type = function() {
    var n;
    return (n = this.attr("type") || this.attr("data-type"))
      ? n.toLowerCase()
      : "";
  };

  function attr(name, fn) {
    attr.fns[name] = (attr.fns[name]||[]).concat([fn]);
  }

  attr.fns = {};

  function onAttr(elem, name, ini, fin, op) {
    if (name in attr.fns)
      map(applyto([elem, ini, fin, op]), attr.fns[name]);
  }

  function init() {
    map(apply, init.fns);
  }

  function prepare(ctx) {
    map(partial(apply, _, [ctx]), prepare.fns);
    return ctx;
  }

  function prerun(q) {
    map(applyto([q]), prerun.fns);
  }

  function process(q) {
    map(applyto([q]), process.fns);
  }

  function finalize(q) {
    map(applyto([q]), finalize.fns);
  }

  function run(defer) {
    var pre=0, tmpQ, elemQ, doneQ=[];

    console.time("run");

    if ($.type(defer) === "number")
      return setTimeout(function() {
        $(document).trigger("attr-change");
      }, defer);

    function elems(q) {
      return keep(map(function(x) {
        var y = x.split(":"),
            e = $("body").byName(y[0]);
        return e.size() ? [e, x, y[0], y[1]] : false;
      }, q));
    }

    while (eventQ.length) {
      console.time("run iter", true);

      tmpQ = uniquearray(eqq, eventQ);
      eventQ.length = 0;

      elemQ = elems(tmpQ);

      if (! pre++)
        prerun(elemQ);

      process(elemQ);
      doneQ = doneQ.concat(tmpQ);

      console.timeEnd("run iter");
    }

    console.time("finalize");
    finalize(elems(uniquearray(eqq, doneQ)));
    console.timeEnd("finalize");

    console.timeEnd("run");
    console.timeEnd("load");

    $UI.initComplete = true;
  }

  function enqueue(meth, q) {
    return function() {
      if (this.size() > 1)
        return this.each($.invoke(meth));
      if ( (n = this.attr("data-name")) || (n = this.attr("name")) )
        q.push(n);
      return this;
    };
  }

  $.fn.prepare = function() {
    if (this.size() > 1)
      return this.each($.invoke("prepare"));
    return prepare(this);
  };

  $.fn.qNow   = enqueue("qNow", eventQ);
  $.fn.qNext  = enqueue("qNext", nextQ);

  $UI = {
    CREATE:       1,
    UPDATE:       2,
    REMOVE:       3,
    q:            function() { return eventQ },
    m:            {},
    attr:         attr,
    init:         init.fns      = [],
    prepare:      prepare.fns   = [],
    prerun:       prerun.fns    = [],
    process:      process.fns   = [],
    finalize:     finalize.fns  = [],
    run:          run
  };

  $(function() {
    init();
    prepare($("html"));
    run();
  });

  (function(orig) {
    $UI._attr = orig;
    $.attr = function(elem, name, value, pass) {
      var len=arguments.length, ini, op, n;

      if ((len == 3 || len == 4) && name.substr(0,5) === "data-") {
        ini = orig(elem, name);

        op = arguments.length == 3
          ? $UI.REMOVE
          : (ini === undefined ? $UI.CREATE : $UI.UPDATE);

        if (value === true) {
          value = name;
        } else if (value === false) {
          op = $UI.UPDATE;
          value = null;
        }

        if (op !== $UI.UPDATE || value !== null) {
          onAttr(elem, name, ini, value, op);
          if ( (n = orig(elem, "data-name")) || (n = orig(elem, "name")) )
            eventQ.push(n+":"+name);
        }
      }

      return apply(orig, vec(arguments));
    };
  })($.attr);

  $(document).on("attr-change", function(event) {
    $UI.run();
  });
})();
