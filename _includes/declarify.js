
Fundaments.load();

/******************************************************************************
 ** Core $UI module                                                          **
 ******************************************************************************/

(function($) {

  var eventQ = [];

  /**
   * Returns `true` if `needle` is in `haystack` array.
   */
  $.isInArray = function(needle, haystack) {
    return $.inArray(needle, haystack) >= 0;
  };

  /**
   * Returns an array without duplicate elements, where "duplicate" is defined
   * by the (optional) `comparator` function. If the comparator is omitted then
   * the default, `eq` is used.
   */
  $.uniqueArray = function(arr, comparator) {
    var i, j, l=arr.length, ret=[];
    comparator = comparator || eq;

    for (i=0; i<l; i++) {
      for (j=i+1; j<l; j++)
        if (comparator(arr[i], arr[j]))
          j = ++i;
      ret.push(arr[i]);
    }

    return ret;
  }

  /**
   * Create an object containing the key-value pairs in a query string. This
   * is the inverse of the jQuery.param() function.
   */
  $.unparam = function(str) {
    return into({}, map(function(x) {
      return map(decodeURIComponent, x.split("=").concat([""]));
    }, !!str ? str.replace(/\+/gi," ").split("&") : []));
  };

  /**
   * Encode string for use as a URI fragment: different rules than a URI
   * component. Decoding is the same though, because URI fragments are less
   * restrictive than URI components are.
   */
  $.encodeURIFragment = function(str) {
    return encodeURIComponent(str)
             .replace(/%20/g, ' ')
             .replace(/%2B/g, '+')
             .replace(/%2F/g, '/')
             .replace(/%24/g, '$')
             .replace(/%25/g, '+')
             .replace(/%3B/g, ';')
             .replace(/%3A/g, ':')
             .replace(/%40/g, '@')
             .replace(/%2F/g, '/')
             .replace(/%3F/g, '?');
  };

  /**
   * Decode a URI fragment. Since fragments are less restrictive than URI
   * components, we can use the regular decodeURIComponent for this.
   */
  $.decodeURIFragment = function(str) {
    return decodeURIComponent(str);
  };

  /**
   * Encode an object into a string that can be used as a URI fragment.
   */
  $.param2 = function(obj) {
    return map(function(x) {
      return map($.encodeURIFragment, x).join("=");
    }, outof(obj)).join("&");
  };

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
   * Serialize an element's value, producing a string.
   */
  $.serialize = function(val) {
    switch ($.type(val)) {
      case "boolean":
        return val ? "1" : "0";
      case "undefined":
      case "null":
        return "";
      default:
        return val+"";
    }
  };

  /**
   * Returns `true` if this element is in the DOM, and `false` if it's been
   * removed or hasn't been appended yet.
   */
  $.fn.isInDOM = function() {
    return this.parents("body").size() > 0;
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

  /**
   * Get the (extended) name of the element, if possible.
   */
  $.fn.name = function(name) {
    return arguments.length
      ? this.attr({"data-name":name, "name":name})
      : this.attr("data-name") || this.attr("name");
  };

  /**
   * Get the html of the element, not just the contents.
   */
  $.fn.outerHtml = function() {
    if (this.size() > 1)
      return this.map($.invoke("outerHtml")).get().join("\n");
    return this.clone().wrap("<div/>").parent().html();
  };

  /**
   * True if this element has the `attr` attribute.
   */
  $.fn.hasAttr = function(attr) { return attr in this.attrMap() };

  /**
   * The tag name of this element.
   */
  $.fn.nodeName = function() {
    return this[0].nodeName.toLowerCase();
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

  $.fn.hidden = function() {
    return this.is(":hidden");
  };

  /**
   * True if this element has not been hidden by tfd-ui state.
   */
  $.fn.isVisible = function() {
    return ! this.hidden();
  };

  /**
   * True if this element and all of its parents have not been hidden by the
   * tfd-ui state.
   */
  $.fn.isVisibleParents = function() {
    return ! this.hiddenParents();
  };

  /**
   * True if this element or any of its parents have been hidden by the tfd-ui
   * state.
   */
  $.fn.hiddenParents = function() {
    if (this.is("body"))
      return false;
    else
      return !!this.hidden() || !!this.parent().hiddenParents();
  };

  /**
   * Get the child element of this element with name attribute set to `name`,
   * and not hidden by the tfd-ui state.
   */
  $.fn.byName = function(name) {
    var ret = $("[data-name='"+name+"']", this);
    ret = ret.filter($.invoke("isVisibleParents"));
    return ret.type() == "radio" ? ret.filter("[data-checked]") : ret;
  };

  $.fn.prepare = function() {
    prepare(this);
    return this;
  };

  $.fn.qEvent = function() {
    return this.each(function() { eventQ.push(this) });
  };

  function init() {
    map(apply, init.fns);
  }

  function prepare(elem) {
    $(elem)
      .find("*")
      .andSelf()
      .each(function() {
        map(partial(apply, _, [$(this)]), prepare.fns);
      });
  }

  function action(elem) {
    map(partial(apply, _, [elem]), action.fns);
  }

  function finalize(q) {
    map(partial(apply, _, [q]), finalize.fns);
  }

  function run() {
    var tmpQ, doneQ=[];

    while (eventQ.length) {
      tmpQ = $($.uniqueArray(eventQ)).filter($.invoke("hasAttr", "data-name")).get();
      eventQ.length = 0;
      map(action, tmpQ);
      doneQ = $.uniqueArray(doneQ.concat(tmpQ));
    }

    finalize(doneQ);

    return ($UI.initComplete = true);
  }

  window.$UI = {
    q:            eventQ,
    initComplete: false,
    init:         init.fns        = [],
    prepare:      prepare.fns     = [],
    action:       action.fns      = [],
    finalize:     finalize.fns    = [],
    run:          run
  };

  $UI.init.push(function() {
    $("body").prepare();
    $("body").on("tfd-change", function() {
      $UI.run();
    });
  });

  $(function() {
    init();
    run();
  });

})(jQuery);

/******************************************************************************

  Module: attr
  ------------
 
  Register callbacks to be executed when the given attribute is changed. Al-
  so set up data-* attributes linked to element properties such that the
  element's state is completely expressed in terms of its attributes & child
  nodes (or text).
 
  Interface
  ---------

    $UI.attr: Attach a callback to run when the given attibute changes.

  Usage
  -----
 
    $UI.attr =>
      <void> function(<scalar> attrname, <callback> fn)
   
        attrname: The data-* attr name (w/o 'data-' prefix).
        fn:       The callback function.
 
    <callback> =>
      <void> function(<scalar> attrname, <scalar> ini, <scalar> fin)

        attrname: The data-* attr name (w/o 'data-' prefix) that is being changed.
        ini:      The initial value of the attribute.
        fin:      The final value of the attribute.
        this:     <global> The top-level JS object.

 ******************************************************************************/

(function($) {

  var reg = [];

  $UI.attr = function(name, f) { reg.push(vec(arguments)) };

  /**
   * Convenience function to encapsulate access to the `D_AHLR` element data.
   */
  function attrHandler(op, elem, attr, f) {
    var D_AHLR  = "tfd-attr-handlers",
        h       = elem.data(D_AHLR) || {};

    h[attr] = h[attr] || [];

    if (op == "get")
      return h[attr];

    h[attr] = (op == "set")
      ? h[attr].concat([f])
      : (f ? filter(partial(comp(not, eqq), f), h[attr]) : []);

    return elem.data(D_AHLR, h);
  }

  /**
   * Add a callback `f` to be executed when the `attr` attribute of this
   * element is changed via the jQuery.attr() method.
   *
   * If `f` is not given then return the list of handlers for the `attr`
   * attribute.
   */
  $.fn.bindAttr = function(attr, f) {
    return attrHandler((f ? "set" : "get"), this, attr, f);
  };

  /**
   * Remove a single callback `f` from the list of attribute change handlers
   * for the `attr` attribute of this element.
   *
   * If `f` is not given then remove all handlers for the `attr` attribute.
   */
  $.fn.unbindAttr = function(attr, f) {
    return attrHandler("remove", this, attr, f);
  };

  $.fn.pureAttr = $.fn.attr;
  $.fn.pureRemoveAttr = $.fn.removeAttr;

  function addRadioAttr(elem, attr, pure) {
    elem[pure ? "pureAttr" : "attr"]("data-"+attr, "data-"+attr)
      .addClass(attr);
  }

  function addRadioAttrEvent(elem, attr, pure) {
    addRadioAttr(elem, attr, pure);
    setTimeout(function() { $("body").trigger("tfd-change") }, 0);
  }

  function removeRadioAttr(elem, attr, pure) {
    elem[pure ? "pureRemoveAttr" : "removeAttr"]("data-"+attr)
      .removeClass(attr);
  }

  function removeRadioAttrEvent(elem, attr, pure) {
    removeRadioAttr(elem, attr, pure);
    setTimeout(function() { $("body").trigger("tfd-change") }, 0);
  }

  /**
   * Monkey-patch the jQuery attribute manipulation methods to install the
   * callback hooks.
   */
  map(function(x) {
    $.fn[x] = (function(orig) {
      return function() {
        var argv = vec(arguments);

        // Just do the normal thing for fetching or for non-data attrs.
        if ((argv.length == 1 && x == "attr") || argv[0].substr(0,5) != "data-")
          return orig.apply(this, argv);

        this.each(function() {
          var name        = argv[0],
              val         = argv[1],
              jself       = $(this),
              op          = orig;

          // Special case if value is `true` or `false`: value set to attr
          // name or attr is removed, respectively

          if (val === false) {
            op = jself.pureRemoveAttr;
            argv.length = 1;
          } else if (val === true)
            argv[1] = name;

          var hlrs        = jself.bindAttr(name),
              ini         = this.getAttribute(name),
              ret         = op.apply(jself, argv),
              fin         = this.getAttribute(name),
              t           = jself.type();

          if (ini != fin) {
            jself.qEvent();
            map(applyto([name, ini, fin]), hlrs);
          }
        });
        return this;
      };
    })($.fn[x]);
  }, ["attr", "removeAttr"]);

  $UI.prepare.push(function(elem) {

    // The $.fn.byName() fn uses the `data-name` attribute, because the `name`
    // attribute is only valid on forms and form elements. This code standard-
    // izes the behavior, to ensure that the `data-name` attribute is always
    // present, but also that the `name` attribute is correctly set on the
    // applicable elements so that radio buttons work as expected, etc.
    
    if (elem.attr("name"))
      elem.pureAttr("data-name", elem.attr("name"));
    else if (elem.is("form,input,textarea,select") && elem.attr("data-name"))
      elem.pureAttr("name", elem.attr("data-name"));

    if (elem.attr("type"))
      elem.pureAttr("data-type", elem.attr("type"));

    if (elem.is("option") && elem.attr("data-selected"))
      elem.pureAttr("selected", true);

    // Some browsers may check a checkbox in a form when the page is reloaded
    // (if the box was previously checked), like firefox, for example.

    if (elem.is(":checked")) 
      elem.attr("data-checked", "data-checked");
    
    if (elem.is(":disabled")) 
      elem.attr("data-disabled", "data-disabled");
    
    if (elem.is(":selected")) 
      elem.attr("data-selected", "data-selected");
    
    // Make sure that the `data-value` attribute is initialized correctly for
    // all form elements.

    if (elem.is("input,select") && !elem.is("[data-value]"))
      elem.attr("data-value", $.serialize(elem.val()));

    // For native form elements, set native attribute according to the
    // corresponding data-* attribute.
    
    function handleFlag(flag) {
      return function(name, ini, fin) {
        if (elem.is("input,select,textarea")) {
          if (fin)
            elem.pureAttr(flag, true);
          else
            elem.pureRemoveAttr(flag);
        }
        elem[(fin ? "add" : "remove") + "Class"](flag);
      };
    }

    elem
      .bindAttr("data-checked", function(name, ini, fin) {
        var nm = elem.attr("data-name"), e;
        if (elem.type() == "radio" && fin && nm) {
          e = $("[data-name='"+nm+"']").not(elem);
          removeRadioAttr(e.removeAttr("checked"), "checked", true);
        }
      })
      .bindAttr("data-checked", handleFlag("checked"))
      .bindAttr("data-selected", handleFlag("selected"))
      .bindAttr("data-disabled", handleFlag("disabled"))
      .bindAttr("data-value", function(name, ini, fin) {
        if (elem.is("input,select,option") && elem.val() != fin)
          elem.val(fin);
      });

    // Initialize native form elements.
    
    if (elem.is("select,option") && ! elem.hasAttr("data-value"))
      elem.attr("data-value", elem.val());
    else
      map(function(x) {
        if (x[0] in {"data-checked":1, "data-disabled":1, "data-selected":1})
          elem.removeAttr(x[0]).attr(x[0], x[0]);
        else if (x[0] == "data-value")
          elem.removeAttr(x[0]).attr(x[0], x[1]);
      }, outof(elem.attrMap()));

    // Update data-* attributes when native form elements are interacted with
    // by the user.

    if (elem.is("input,select,textarea")) {
      if (elem.type() == "checkbox" || elem.type() == "radio")
        elem.on("click.tfd", function(event) {
          $(this).attr("data-checked", !! $(this).is(":checked"));
          setTimeout(function() { $("body").trigger("tfd-change") }, 0);
        });
      else if (elem.is("textarea"))
        elem.on("change.tfd", function(event) {
          setTimeout(function() { $("body").trigger("tfd-change") }, 0);
        });
      else
        elem.on("change.tfd", function(event) {
          $(this).attr("data-value", elem.val());
          setTimeout(function() { $("body").trigger("tfd-change") }, 0);
        });
    } else if (elem.type() == "checkbox" || elem.type() == "radio") {
      elem.on("click.tfd", function(event) {
        var checked = "data-checked";
        elem.attr(checked, elem.type() == "radio" || ! elem.attr(checked));
        setTimeout(function() { $("body").trigger("tfd-change") }, 0);
      });
    }

    // Link data-* attributes (and class attribute) to state

    elem.on("mouseenter.tfd", function(event) {
      addRadioAttrEvent($(this), "hover");
    }).on("mouseleave.tfd", function(event) {
      removeRadioAttr($(this), "active");
      removeRadioAttrEvent($(this), "hover");
    }).on("focusin.tfd", function(event) {
      addRadioAttrEvent($(this), "focused");
    }).on("focusout.tfd", function(event) {
      removeRadioAttrEvent($(this), "focused");
    }).on("mousedown.tfd", function(event) {
      addRadioAttrEvent($(this), "active");
    }).on("mouseup.tfd", function(event) {
      removeRadioAttrEvent($(this), "active");
    });

    // Install registered attr change handlers

    map(function(x) {
      var name = "data-"+x[0],
          val  = elem.attr(name);
      elem.bindAttr(name, function() { x[1].apply(elem, rest(arguments)) });
    }, reg);

    // Ensure that all dependencies are initialized correctly.

    if (elem.is("option"))
      setTimeout(function() {
        elem.parentsUntil("body").filter("select").eq(0).trigger("change");
      }, 0);
    else
      elem.qEvent();
  });

})(jQuery);

/******************************************************************************

  Module: dep
  -----------
 
    A basic dependency module. Dependencies are specified by setting certain
    attributes on the dependent element. A "dependency specification" is a set
    of attributes of the following form:

      <prefix>::<module>[.<action>] = "value"

        prefix:   All attributes in the set share a common prefix.
        module:   The name of the dep module handling this attribute.
        action:   The (optional) action to be executed.
        value:    The argument to be passed to the action when called.

    An element can have multiple dependency specifications, each with different
    prefix, but within an attribute set all attributes must have the same pre-
    fix.

    The dependency is set by specifying an attribute without the optional
    `action` part, whose value is set to the `data-name` attribute of the
    element this element is to depend on. That is to say,

      data-foo::bar = "baz"

    would set up a dependency between this element and the one with the attri-
    bute `data-name = "baz"`. When that element changes, the set of actions
    specified in the `data-foo` prefixed attribute set will be executed.

    The `module` part specifies which dep module will handle the action. When
    executed, the `action`, if defined (see the Usage section below) will be
    called. If the module did not define that action then the default callback
    handler for that module will be used, instead.

  Interface
  ---------
 
    $UI.dep:          Add a module to the dependency handler mechanism.
    $UI.dep.prepare:  Add a callback to handle namespaced referent names,
                      called during the dependent element's `prepare` phase.

  Usage
  -----
 
    $UI.dep => 
      <void> function(<scalar> modname, <actionmap> defs, <callback> dfl)
 
        modname:  The data-* attribute name (w/o the 'data-' prefix).
        defs:     A map of action-callback pairs.
        dfl:      The default action, if no match is found in `defs`.
 
    <actionmap> =>
      { <scalar> action : <callback> fn, ... }

        action:   The action name.
        fn:       Executed when the `action` is triggered on the element.

    <callback> =>
      <void> function(<scalar> name, <scalar> action, <scalar> value)

        name:     The value of the 'data-name' attribute of the referent.
        action:   The name of the action being executed.
        value:    The value of the attribute that specified the action.
        this:     <jQuery> The dependent element.

    ---

    $UI.dep.prepare => 
      <void> function(<scalar> prefix, <callback> fn)
 
        prefix:   The namespace prefix of the referent name (separated from
                  the name by a dot (.)).
        fn:       The callback function, called during the dependent element's
                  `prepare` phase.
 
    <callback> =>
      <void> function(<jQuery> elem, <scalar> name)

        elem:     The dependent element.
        name:     The referent's `data-name` attribute (no namespace prefix).
        this:     <window>

 ******************************************************************************/

(function($) {

  var reg = {},
      dfl = {},
      phl = {};

  $UI.dep = function(name, obj, f) {
    reg[name] = obj;
    dfl[name] = f;
  };

  $UI.dep.prepare = partial(assoc, phl);

  function byModule(obj) {
    return reduce(function(x, xs) {
      map(function(y) {
        var m = y[0].match(/^([^.]+)(\.(.+))?$/);

        if (m) {
          xs[m[1]] = xs[m[1]] || {};
          xs[m[1]][x[0]] = assoc(xs[m[1]][x[0]], m[3] || "", y[1]);
        }
      }, outof(x[1]));
      return xs;
    }, {}, outof(obj));
  }

  function byName(obj) {
    return reduce(function(x, xs) {
      var name, m, z;

      if (! x[0] || ! (name = x[1].dep))
        return xs;

      map(function(xname) {
        xs[xname] = xs[xname] || {};

        map(function(y) {
          if ( (m = y[0].match(/^([^.]+)(\.(.+))?$/)) ) {
            z = xs[xname][x[0]] = xs[xname][x[0]] || {};
            z[m[1]] = assoc(z[m[1]], m[3] || "", y[1]);
          }
        }, outof(x[1]));
      }, x[1].dep.split(" "));

      return xs;
    }, {}, outof(obj));
  }

  window.bn = byName;

  function allDeps(elem) {
    return keep(map(partial(nth, _, ""),
                    map(partial(nth, _, 1),
                        outof(byModule(elem.tfdAttrMap())["dep"]))));
  }

  $.fn.tfdAttrMap = function(name) {
    var tmp = reduce(function(x, xs) {
      var y = x[0].replace(/^data-/, '');

      if (y.length == x[0].length)
        return xs;

      var m = y.match(/^([a-z0-9-]+)::(.*)$/i),
          j = m ? m[1] : "",
          k = m ? m[2] : y;

      return assoc(xs, j, assoc(xs[j], k, x[1]));
    }, {}, outof(this.attrMap()));

    return name ? byName(tmp)[name] : tmp;
  };

  $.fn.tfdProcessDep = function(name) {
    var jself = $(this),
        obj   = name,
        name  = $.type(obj) == "string" ? obj : obj.name;

    map(function(x) {
      map(function(y) {
        if (reg[y[0]])
          map(function(z) {
            (reg[y[0]][z[0]] ? reg[y[0]][z[0]] : dfl[y[0]])
              .call(jself, obj, z[0], z[1]);
          }, outof(y[1]));
      }, outof(x[1]));
    }, outof(jself.tfdAttrMap(name)));
  };

  $UI.prepare.push(function(elem) {
    var a = allDeps(elem),
        d = a.join(" ");
    if (d)
      elem.pureAttr("data-dep.depends", d);
    map(function(x) {
      var m = x.match(/^([^\.]+)\.(.*)$/);
      if (m && phl[m[1]])
        phl[m[1]](elem, m[2]);
    }, a);
  });

  $UI.action.push(function(elem) {
    var name  = $(elem).attr("data-name"),
        sel   = "[data-dep\\.depends~='"+name+"']";
    $(sel).each($.invoke("tfdProcessDep", name));
  });

  $UI.dep("log", {}, function(name, attr, val) {
    //if (attr == "fill")
    console.log((attr ? attr+": " : ""), $(this).tfdEval(val, name, ""));
  });

})(jQuery);

/******************************************************************************

  Module: dep.attr
  ----------------
 
    The `dep.attr` submodule implements a mechanism for updating attributes on
    the dependent element when an attribute on the referent changes. A typical
    example would be:

      <elem
        data-a::dep       = "foo"
        data-a::attr.bar  = "$$.baz">
        Content.
      </elem>

    The first attribute creates a dependency, with the element named "foo" as
    the referent. The second attribute calls the `dep.attr` module to update
    the `data-bar` attribute on <elem>, setting its value to be the same as
    the current value of the `data-baz` attribute of the referent, whenever an
    attribute on the referent is changed.

    The general attribute specification is:

      <prefix>::attr.<name> = "<expr>"

        prefix:   The dependency set prefix.
        name:     The name of the attribute to update (w/o the 'data-' prefix).
        expr:     A JS expression, which is eval-ed in a special environment,
                  producing the value to which the attribute will be set. (See
                  below for more info.)

  Expression Evaluation
  ---------------------

    Expressions are JavaScript, eval-ed in a special environment. The eval is
    done in the global context, with the following objects in the local scope
    of the expression's evaluation:

    <callable> $$(<scalar> name)

      This is a map representing the referent dom element. Element attributes
      are mapped to object properties (with property names w/o the 'data-'
      prefix).
      
      When called as a function with an element name as an argument it returns
      another `$$` type callable representing the dom element with that name.

      Additionally, the callable has a `toMap` method which returns a pure map
      of the callable's properties.
        
    <map> $this

      A map representing the dependent element's attributes (again, property
      names w/o the 'data-' prefix).

    <string> $same

      The current value of the attribute. (Returning this leaves the attribute
      unchanged.)

    <string> $expr
      
      The expression being evaluated.

    <jQuery> this

      The dependent element's jQuery object.

  Interface
  ---------
 
    $UI.dep.attr: Specify a callback to handle a specific attribute.

  Usage
  -----
 
    $UI.dep.attr => 
      <void> function(<scalar> name, [<callback> fn])
 
        name:     The attribute name (w/o the 'data-' prefix)
        fn:       The (optional) callback function. If no fn is specified then
                  the attribute is treated as a flag (eg. the `checked` attr,
                  which is either present or not, but has no significant value).
                  Flag attributes are set when the value is truthy, and removed
                  when the value is falsy.
 
    <callback> =>
      <void> function(<scalar> name, <scalar> value)

        name:     The attribute name.
        value:    The value the attribute would be set to.
        this:     <jQuery> The dependent element.

 ******************************************************************************/

// This must be a global function to have a clean namespace for the eval (i.e.
// without local vars other than `$expr`, `$this`, `$$`, and `$same`).

function tfdDoEval($expr, $this, $$, $same) {
  return (function() {
    $this = $this.tfdAsMap();
    return eval($expr);
  }).call($this);
}

(function($) {
 
  var reg = {};

  $.fn.tfdEval = function(val, name, same) {
    return tfdDoEval(val, this, asMap(name), same);
  };

  $.fn.tfdAsMap = function() {
    return into({}, keep(map(function(x) {
      return x[0].indexOf("::") >= 0 || x[0].substr(0, 5) != "data-"
        ? null
        : [x[0].replace(/^data-/, ""), x[1]];
    }, outof(this.attrMap()))));
  };

  $UI.dep.attr = function(name, f) {
    reg[name] = f ? f : function(attr, val) {
      this.attr(attr, !! val);
    };
  };

  $UI.dep.attr("checked");
  $UI.dep.attr("disabled");

  function asMap(name) {
    var ret = function(name) { return asMap(name) },
        obj = $.type(name) == "string"
                ? $("body").byName(name).tfdAsMap()
                : name;
    ret.toMap = function() { return obj };
    return $.extend(ret, obj);
  }

  $UI.dep("attr", {}, function(name, attr, val) {
    var attrname = "data-"+attr,
        op       = attr in reg ? reg[attr] : this.attr;
    op.call(this, attrname, this.tfdEval(val, name, this.attr(attrname)));
  });

})(jQuery);

/******************************************************************************

  Module: dep.attr.hide
  ---------------------
 
    The `dep.attr.hide` submodule implements both a custom attribute to control
    and obtain the visibility state of a dom element, and a modular system for
    defining and specifying show/hide animations and effects.

      <elem
        data-a::dep       = "foo"
        data-a::attr.hide = "! $$.checked"
        data-hide.style   = "fade">
        Content.
      </elem>

    The first attribute creates a dependency, with the element named "foo" as
    the referent. The second attribute calls the `dep.attr.hide` module to
    hide the dependent element whenever the referent (a checkbox, presumably)
    is not checked. The showing/hiding is accomplished by setting/removing the
    `data-hide` attribute on the element.

    The `data-hide.style` attribute (if present) selects which animation effect
    to use for the showing/hiding.

  Interface
  ---------
 
    $UI.dep.attr.hide:  Specify callback pair to which show/hide can be dele-
                        gated.

  Usage
  -----
 
    $UI.dep.attr.hide => 
      <void> function(<scalar> name, <animationmap> impl)
 
        name:     The animation name.
        impl:     The `show` and `hide` implementations to use.
 
    <animationmap> =>
      { show: <animate> fn, hide: <animate> fn }

    <animate> =>
      <void> function()

        this:     <jQuery> The dependent element.

 ******************************************************************************/

(function($) {

  var reg = {};

  $UI.dep.attr.hide = partial(assoc, reg);

  $UI.dep.attr("hide");

  $UI.attr("hide", function(ini, fin) {
    var eff = $(this).attr("data-hide.style"),
        op  = reg[eff] && $UI.initComplete ? reg[eff] : this;

    op[!! fin ? "hide" : "show"].call(this);
  });

})(jQuery);

/******************************************************************************
 ** Defines the `class` module to toggle an element's css class, the `text`  **
 ** module to set an element's text node, and the `append` module to append  **
 ** children to a node.                                                      **
 ******************************************************************************/

(function($) {

  $UI.dep("class", {}, function(name, cls, val) {
    this.toggleClass(cls, (!! this.tfdEval(val, name, this.hasClass(cls))));
  });

  $UI.dep("text", {}, function(name, attr, val) {
    this.text(this.tfdEval(val, name, this.text()));
  });

  $UI.dep("append", {}, function(name, attr, val) {
    this.append(this.tfdEval(val, name, this.text()));
  });

})(jQuery);

/******************************************************************************
 ** Defines the `tpl` module to process inline templates                     **
 ******************************************************************************/

(function($) {

  var tpl = {};

  window.tpl = tpl;
  function tplClone(elem, name, data) {
    return elem.clone().tfdFillTpl(name, data).prepare();
  }

  // Set initial state---no change event will be fired from the referent when
  // the template is filled, so must synthetically do this to ensure that the
  // initial state is consistent.
  function tplInit(elem) {
    map(function(x) {
      elem.tfdProcessDep(x);
    }, elem.attr("data-dep.depends").split(" "));
  }

  $.fn.tfdFillTpl = function(name, data) {
    data.name = name;
    this.find("*").andSelf().each($.invoke("tfdProcessDep", data));
    return this;
  };

  $.tfdFillTpl = function(name, data) {
    data = data || [];

    var deps  = $("[data-tpl~='"+name+"']").get(),
        t     = tpl[name],
        minl  = min(deps.length, data.length),
        tmp, i;

    map(partial(assoc, _, "i", _), data);

    for (i=0; i<minl; i++) {
      tmp = tplClone(t, name, data[i]);
      $(deps).eq(i).replaceWith(tmp);
      tplInit(tmp);
    }
    
    if (deps.length > data.length) {
      $(deps).each(function(i) {
        if (i >= max(minl,1))
          $(this).remove();
        else if (! i && ! data.length)
          $(this).replaceWith(tplClone(t, name, {}).hide());
      });
    }

    if (data.length > deps.length) {
      deps  = $("[data-tpl~='"+name+"']").get();
      for (i=minl; i<data.length; i++) {
        tmp = tplClone(t, name, data[i]);
        deps = $(deps).last().after(tmp).end().add(tmp).get();
        tplInit(tmp);
      }
    }

    if (data.length)
      $("[data-tpl~='"+name+"']").show();

    $UI.initComplete = false;
    $UI.run();
  };

  $UI.prepare.push(function(elem) {
    if (elem.attr("data-tpl"))
      map(function(x) {
        if (! tpl[x])
          tpl[x] = elem.hide().clone();
      }, elem.attr("data-tpl").split(/[\s]+/));
  });

})(jQuery);

/******************************************************************************
 ** Defines the `form` module to handle form update/submit events.           **
 ******************************************************************************/

(function($) {

  var hlr = {},
      pcs = {},
      fQ  = [];

  $UI.form = {
    submit:  partial(assoc, hlr),
    process: partial(assoc, pcs)
  };

  $.fn.tfdFormData = function() {
    var ret = into({},
                   map(function(x) { return [x.name, x.value] },
                   this.serializeArray()));

    this.find("input[data-type='checkbox']")
        .filter("[data-name]")
        .each(function() {
          var name = $(this).attr("data-name");
          ret[name] = $(this).is("[data-checked]") ? 1 : 0;
        });

    return ret;
  };

  function doForm(hlr, data) {
    var jself = $(this);
    map(function(x) {
      var m = x[0].match(/^data-form\.(.*)$/),
          s = partial(onSuccess, jself),
          e = partial(onError, jself);
      if (m && (m[1] in hlr))
        hlr[m[1]](jself, x[1], data, s, e);
    }, outof($(this).attrMap()));
  }

  var count = 1;

  function handleData(mode, form, data) {
    form.data("tfd-form"+(mode ? "error" : "data"), null);
    form.attr("data-form."+(mode ? "error" : "success"), false)
        .attr("data-form."+(mode ? "success" : "error"), true)
        .data("tfd-form"+(mode ? "data" : "error"), data)
        .qEvent();
    $UI.run();
    doForm.call(form, pcs, data);
    form.data("tfd-form"+(mode ? "data" : "error"), null);
  }

  var onSuccess = partial(handleData, true);
  var onError   = partial(handleData, false);

  $UI.prepare.push(function(elem) {
    var form;

    if (elem.is("form"))
      elem.on("submit", function(event) {
        event.preventDefault();
        doForm.call(this, hlr, $(this).tfdFormData());
      });

    if (elem.is("input,select,textarea") &&
      (form = elem.parentsUntil("body").filter("form")).size() &&
      ! form.find("[type='submit']").size()) {
      if (elem.type() == "checkbox" || elem.type() == "radio")
        elem.bindAttr("data-checked", function(name, ini, fin) {
          if (((elem.type() == "radio" && fin) || elem.type() != "radio") &&
            ini != fin)
            fQ.push(form[0]);
        });
      else
        elem.bindAttr("data-value", function(name, ini, fin) {
          if (ini != fin)
            fQ.push(form[0]);
        });
    }
  });

  $UI.finalize.push(function(q) {
    var tmpQ = $.unique(fQ);
    fQ = [];

    map(function(x) {
      $(x).trigger("submit");
    }, tmpQ);
  });

  $UI.form.submit("log", function(form, val, data) {
    console.log("form data: ",
                [form.tfdEval(val, data, ""), form.data("tfd-formdata")]);
  });

  $UI.form.submit("json", function(form, val, data, success, error) {
    $.ajax({
      url:      val,
      dataType: "json",
      data:     data,
      async:    true,
      success:  success,
      error:    function(xhr, err, msg) { error([{ message: msg }]) }
    });
  });

  $UI.form.process("tpl.success", function(form, val, data) {
    data = form.data("tfd-formdata");
    $.tfdFillTpl(val, data);
  });

  $UI.form.process("tpl.error", function(form, val, data) {
    data = form.data("tfd-formerror");
    $.tfdFillTpl(val, data);
  });

})(jQuery);

/******************************************************************************
 ** Widget module.                                                           **
 ******************************************************************************/

(function($) {

  var wgt = {};

  function Widget() {}

  function doApply(_js, jQuery, $, _obj, _args, _ref, sym) {
    var _f, _i;
    for (_i in _ref)
      eval("var "+_i+" = _ref."+_i);
    eval("_f = "+_js);
    _f.apply(_obj, _args);
  };

  function parseCSS(src) {
    var parsed = (new CSSParser()).parse(src, false, false);

    if (!parsed)
      return {};

    return into({}, map(function(x) {
      var decl = into({}, map(function(y) {
        return [y.property, y.valueText];
      }, x.declarations));
      return [x.mSelectorText, decl];
    }, parsed.cssRules));
  }

  var gensym = (function(count) {
    return function(sym) {
      return "gensym_"+sym.replace(/\*$/,'_')+String(count++);
    };
  })(1);

  function makeConstructor(name, cmp) {
    var result = function() {
      var argv  = vec(arguments),
          obj   = this,
          attrs = {},
          ref   = {},
          i;

      $fake = function(selector, context) {
        var isHtml = /^[^<]*(<(.|\s)+>)[^>]*$/;

        // if it's a function then immediately execute it (DOM loading
        // is guaranteed to be complete by the time this runs)
        if ($.isFunction(selector)) {
          selector();
          return;
        }

        // if it's not a css selector then passthru to jQ
        if (typeof selector != "string" || selector.match(isHtml))
          return new $(selector);

        // it's a css selector
        if (context != null)
          return $(context).find(selector)
                           .not($("[data-widget\\.inst] *", obj._dom).get())
                           .not($("* [data-widget\\.inst]", context).get());
        else 
          return $(obj._dom).find("*")
                      .andSelf()
                      .filter(selector)
                      .not($("[data-widget\\.inst] *", obj._dom).get())
                      .not($("* [data-widget\\.inst]", obj._dom).get());
      };

      $.extend($fake, $);
      $fake.prototype = $fake.fn;
      $fake.component = cmp;

      if (cmp) {
        obj._dom = cmp.dom.clone();
        obj.$    = $fake;
        obj._dom.find("*").add(obj._dom).filter(function() {
          return $(this).is("[data-widget\\.ref]");
        }).each(function() {
          var r = $(this).attr("data-widget.ref");
          if (r)
            ref[r] = $(this);
        });
        
        // Gensyms (FIXME: unimplemented)
        syms = {};

        // Find gensym declarations
        obj._dom
          .find("*")
          .andSelf()
          .filter("[name$='*'],[data-name$='*']")
          .each(function() {
            var name = $(this).name(),
                sym  = gensym(name);

            // Add to syms map, so that syms are accessible in the JS widget
            // constructor.
            syms[name.replace(/\*$/, '')] = sym;

            // Replace name with gensym name
            $(this).name(sym);

            // Replace all references to the name with the gensym name
            obj._dom.find("*").andSelf().each(function() {
              var jself = $(this);
              map(function(x) {
              var r = new RegExp(requote(name), 'g'),
                  m = x[1].match(r);
              if (m)
                jself.attr(x[0], x[1].replace(r, sym));
              }, outof(jself.attrMap()));
            });
          });

        // Prevent endless loops
        argv[0].removeAttr("data-widget");

        // Parse the placeholder to create template data
        attrs = into({}, map(function(x) {
          return [x[0].replace(/^data-/, ""), x[1]];
        }, outof(argv[0].attrMap())));

        attrs[':children']  = argv[0].children();

        // Copy the attributes of the placeholder onto the outer element
        // of the widget instance
        map(function(x) {
          console.log("attr", (x[0][0] == ":" ? "data-" : "") + x[0]);
          if (x[0] != "class")
            obj._dom.attr((x[0][0] == ":" ? "data-" : "") + x[0], x[1]);
          else
            map(function(y) { obj._dom.addClass(y) }, x[1].split(/[\s]+/));
        }, outof(argv[0].attrMap()));

        // Fill the widget as an inline template
        obj._dom.tfdFillTpl("widget."+name, attrs);

        // Run the widget constructor
        doApply(cmp.js, $fake, $fake, obj, argv, ref, into({}, outof(syms)));
        
        // Apply widget CSS styles
        map(function(x) {
          $fake("*").andSelf().filter(x[0]).each($.invoke("css", x[1]));
        }, outof(parseCSS(cmp.css)));
      } else {
        throw "can't find widget: "+name;
      }
    };

    result.prototype = new Widget();
    return result;
  };

  $UI.prepare.push(function(elem) {
    var e, cmp, name;

    if (elem.attr("data-widget.def")) {
      name = elem.attr("data-widget.def");
      cmp = {
        css:  elem.find("style").remove().text() || "",
        js:   elem.find("script").remove().text() || "function() {}",
        dom:  elem.removeAttr("data-widget.def").attr("data-widget.inst", name)
      };
      wgt[name] = makeConstructor(name, cmp);
      elem.remove();
    } else if (elem.attr("data-widget")) {
      name = elem.attr("data-widget");
      if (wgt[name]) {
        e = (new wgt[name](elem))._dom;
        elem.replaceWith(e);
        e.prepare();
      }
    }
  });

})(jQuery);

/******************************************************************************
 ** Initialization of the above modules                                      **
 ******************************************************************************/

(function($) {

  $UI.dep.attr.hide("slide", {
    show: function() { $(this).slideDown("fast") },
    hide: function() { $(this).slideUp("fast") }
  });

  $UI.dep.attr.hide("fade", {
    show: function() { $(this).fadeIn("fast") },
    hide: function() { $(this).fadeOut("fast") }
  });

})(jQuery);
