
Fundaments.load();

/**
 * Core module
 */
(function($) {

  /** Event queue */
  var eventQ  = [];

  /** Input types that are "checked" or "unchecked" */
  var C_TYP   = ["CHECKBOX", "RADIO"];

  /** Elements that have values */
  var E_VAL   = ["INPUT", "SELECT", "TEXTAREA", "BUTTON"];

  /** Input types that normally change on click event */
  var E_CLK   = ["BUTTON", "RADIO", "CHECKBOX"];

  /**
   * Generate a globally unique symbol.
   */
  $.gensym = function() {
    return "gensym-"+(++syms);
  };

  /**
   * Returns `true` if `needle` is in `haystack` array.
   */
  $.isInArray = function(needle, haystack) {
    return $.inArray(needle, haystack) >= 0;
  };

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
   *   $(foo).map($.invoke("show"));
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
   * Convenience function to encapsulate access to the `D_AHLR` element data.
   */
  function attrHandler(op, elem, attr, f) {
    var D_AHLR  = "tfd-attr-handlers",
        h       = elem.data(D_AHLR) || {};

    h[attr] = h[attr] || [];

    if (op == "get")
      return h[attr];

    h = (op == "set")
      ? h.concat([f])
      : (f ? filter(partial(comp(not, eqq), f), h) : []);

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

  /**
   * Monkey-patch the jQuery attribute manipulation methods to install the
   * callback hooks.
   */
  map(function(x) {
    $.fn[x] = (function(orig) {
      return function() {
        if (arguments.length == 1)
          return orig.apply(this, vec(arguments));

        var argv = vec(arguments);

        this.each(function() {
          var name = argv[0],
              hlrs = $(this).bindAttr(name),
              ini  = this.getAttribute(name),
              ret  = orig.apply($(this), argv),
              fin  = this.getAttribute(name);

          if (ini != fin)
            $(this).trigger("tfd-attr", [name, ini, fin]);

          if (ini != fin && hlrs.length)
            map(applyto([ini, fin]), hlrs);

          if (name.indexOf(":") == -1)
            $(this)[$(this).hasAttr(name) ? "addClass" : "removeClass"](name);
        });
        return this;
      };
    })($.fn[x]);
  }, ["attr", "removeAttr"]);

  /**
   * Get a map of this element's attributes and their associated values.
   */
  $.fn.attrMap = function() {
    var ret = {};
    $.each(this.get(0).attributes, function(i,attr) {
      ret[attr.nodeName.toLowerCase()] = attr.nodeValue;
    });
    return ret;
  };

  /**
   * Get the html of the element, not just the contents.
   */
  $.fn.outerHtml = function() {
    return this.eq(0).clone().wrap("<div/>").parent().html();
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
    return (n = this.attr("type")) ? n.toLowerCase() : "";
  };

  /**
   * True if this element has not been hidden by tfd-ui state.
   */
  $.fn.isVisible = function() {
    return ! this.hidden2();
  };

  /**
   * True if this element and all of its parents have not been hidden by the
   * tfd-ui state.
   */
  $.fn.isVisibleParents = function() {
    return ! this.hidden2Parents();
  };

  /**
   * True if this element or any of its parents have been hidden by the tfd-ui
   * state.
   */
  $.fn.hidden2Parents = function() {
    if (this.is("body"))
      return false;
    else
      return !!this.hidden2() || !!this.parent().hidden2Parents();
  };

  /**
   * True if this element has been hidden by the tfd-ui state.
   */
  $.fn.hidden2 = function() {
    if (arguments.length)
      return this.data(D_HID, !! arguments[0]);
    return this.data(D_HID);
  };

  /**
   * Return the element with name attribute set to `name`, from among the
   * elements that are not hidden by the tfd-ui state.
   *
   * If an element `e` is provided, then only children of `e` are searched.
   */
  function getByName(name, e) {
    return $("[name='"+name+"']", e ? e : $("body")).filter(isVisible);
  }

  /**
   * Get the child element of this element with name attribute set to `name`,
   * and not hidden by the tfd-ui state.
   */
  $.fn.byName = function(name) {
    return getByName(name, this);
  };

  $.fn.prepare = function() {
    prepare(this);
    return this;
  };

  $.fn.initVal = function() {
    var t = this.type();

    if (t == "CHECKBOX")
      this.checked(this.checked2()).setSavedCheck(this.checked());
    else if (this.actsLike())
      this.val(this.is("[value]") ? this.attrMap().value : "")

    if (t != "CHECKBOX")
      this.setSavedVal(this.val());

    return this;
  };

  $.fn.qEvent = function() {
    return this.each(function() { eventQ.push(this) });
  };

  $.fn.startTransaction = function() {
    var a     = this.actsLike(),
        t     = this.type(),
        jself = this;

    if (t == "RADIO") {
      if (! jself.checked()) {
        getByName(jself.attr("name")).checked(false);
        jself.checked(true);
      } else
        return false;
    } else if (t == "CHECKBOX")
      jself.toggleChecked();

    return true;
  };

  $.fn.endTransaction = function(commit) {
    var a     = this.actsLike(),
        t     = this.type(),
        jself = this;

    if (commit) {
      if (t == "RADIO") {
        getByName(jself.attr("name")).each(function() {
          $(this).setSavedCheck($(this).checked()).setSavedVal($(this).val());
        });
      } else if (t == "CHECKBOX")
        jself.setSavedCheck(jself.checked());
      else
        jself.setSavedVal(jself.val());
    } else {
      if (t == "RADIO") {
        getByName(jself.attr("name")).each(function() {
          $(this).checked($(this).getSavedCheck()).val($(this).getSavedVal());
        });
      } else if (t == "CHECKBOX")
        jself.checked(jself.getSavedCheck());
      else
        jself.val(jself.getSavedVal());
    }
    return this;
  };

  $.fn.doEvent = function(event) {
    var e     = this.listen(),
        a     = this.actsLike(),
        t     = this.type(),
        jself = this;

    if (e == event.type)
      this.qEvent();

    if (!jself.is("body"))
      jself.parent().doEvent(event);
    else
      processUpdates(event);
  };

  $.fn.initEvent = function() {
    var e     = this.listen(),
        n     = this.nodeName(),
        a     = this.actsLike(),
        t     = this.type(),
        jself = this;

    if (a && e == "click")
      this.css("cursor", "pointer");

    return $.isInArray(this.nodeName2(), E_VAL) && e
      ? this.unbind("click change").bind("click change", function(event) {
          // Send tfd-ui synthetic event, but not when bubbling
          if (event.type.substr(0,4) == "tfd-")
            return;
          else if (event.target == this)
            setTimeout(function() { jself.trigger("tfd-"+event.type) }, 0);

          if (event.type != e)
            return;

          event.stopPropagation();

          jself.doEvent(event);
        }).each(function() { if ($(this).type() != "SUBMIT") $(this).qEvent() })
      : this;
  };

  $.fn.doDepends = function() {
    return apply(doDepends, [this].concat(vec(arguments)));
  };

  // Given an object `obj` with property names that are regular expressions
  // for which the corresponding values are functions that take a RegExp match
  // array as a first argument, a string `str`, return a partial application of
  // the function corresponding to the first property name regex that matches
  // `str` or `undefined` if no match is found.
  
  function dispatchRe(obj, str) {
    return first(filter(identity, map(function(x, m) {
      return (m = (new RegExp("^"+x[0]+"$")).exec(str))
        ? partial(x[1], m)
        : false;
    }, outof(obj))));
  }

  function dispatchAttr(obj, elem) {
    elem = $(elem);
    return filter(identity, map(function(x, f) {
      return (f = dispatchRe(obj, x[0]))
        ? partial(f, x[1], elem)
        : false;
    }, outof(elem.attrMap())));
  }

  function dispatch(obj, elems) {
    var args  = rest(rest(vec(arguments)));
    elems = vec(elems);
    return map(function(x) {
      return map(partial(apply, _, args), dispatchAttr(obj, $(x)));
    }, vec(elems));
  }

  function getByAttr(attr, val) {
    return $("["+attr+"='"+val+"']").filter(isVisible);
  }

  function isVisible(elem) {
    return ! $(elem).hidden2();
  }

  function getVal(name) {
    var e = getByName(name);
    return e.type() == "RADIO"
      ? $.serialize(e.filter(function() { return $(this).checked() }).val())
      : (e.type() == "CHECKBOX" 
          ? (e.checked() ? "1" : "0")
          : $.serialize(e.val()));
  }

  function predicate(elem, val) {
    return reduce(and, true, map(applyto([$(elem), val]), predicate.fns));
  }

  function doDepends(elem, val) {
    var test = predicate((elem = $(elem)), val);
    map(partial(apply, _, [elem, test, val]), doDepends.fns);
  }

  function prepare(elem) {
    $(elem)
      .find("*")
      .andSelf()
      .each($.invoke("initVal"))
      .each($.invoke("initEvent"))
      .each(function() {
        map(partial(apply, _, [$(this)]), prepare.fns);
      });
  }

  function bubble(elem) {
    return apply(and, map(applyto([$(elem)]), bubble.fns));
  }

  function process(elem) {
    var name = (elem = $(elem)).attr("name"),
        deps = getByAttr(A_DEP, name),
        accp = true;
    if ($UI.initComplete && (accp = elem.startTransaction()))
        elem.endTransaction(accp = accept(elem));
    if (accp && name && deps.size())
      map(partial(doDepends, _, getVal(name)), deps.get());
    return elem;
  }

  function finalize(q) {
    map(partial(apply, _, [q]), finalize.fns);
  }

  function processUpdates() {
    var tmpQ, doneQ=[], t=$(window).scrollTop();

    while (eventQ.length) {
      tmpQ = vec(eventQ);
      eventQ.length = 0;
      tmpQ.length = min(inc(takewhile(bubble, tmpQ).length), tmpQ.length);
      map(process, tmpQ);
      doneQ = $.unique(doneQ.concat(tmpQ));
    }

    finalize(doneQ);
    //$(window).scrollTop(t);
    return ($UI.initComplete = true);
  }

  function init() {
    map(apply, init.fns);
  }

  $(function() {
    init();
  });

  window.$UI  = {
    q:            eventQ,
    initComplete: false,
    init:         init.fns        = [],
    prepare:      prepare.fns     = [],
    predicate:    predicate.fns   = [],
    accept:       accept.fns      = [constant(true)],
    bubble:       bubble.fns      = [constant(true)],
    process:      doDepends.fns   = [],
    finalize:     finalize.fns    = [],
    mod:          {},
    dispatchRe:   dispatchRe,
    dispatchAttr: dispatchAttr,
    dispatch:     dispatch,
    run:          processUpdates
  };

})(jQuery);

/**
 * Bootstrap module
 */
(function($) {

  $UI.init.push(function() {
    $("body").prepare();
    $UI.run();
  });

})(jQuery);

/**
 * Dependent value matching predicate module
 */
(function($) {
    
  // Various tests
  var test    = {
    "eq":       eq,
    "neq":      neq,
    "eqq":      eqq,
    "neqq":     neqq,
    "lt":       lt,
    "le":       le,
    "gt":       gt,
    "ge":       ge,
    "re":       argrev(re),
    "nre":      argrev(nre),
    "num-eq":   mapargs(eq,  Number),
    "num-neq":  mapargs(neq, Number),
    "num-lt":   mapargs(lt,  Number),
    "num-le":   mapargs(le,  Number),
    "num-gt":   mapargs(gt,  Number),
    "num-ge":   mapargs(ge,  Number),
    "any":      constant(true),
    "none":     constant(false)
  };

  var matcher = {
    "depends-val(-(.*))" :
      function(match, val1, elem, val2) {
        return test[match[2]]($.serialize(val1), $.serialize(val2));
      }
  };

  $UI.predicate.push(function(elem, val) {
    return reduce(and, true, map(applyto([val]),
                                 $UI.dispatchAttr(matcher, $(elem))));
  });

})(jQuery);

/**
 * Simple toggle depends actions module
 */
(function() {

  var toggleQ = {},
      loading = true;

  function toggle(elem, test, show, hide) {
    var args = arguments.length > 4 ? vec(arguments).slice(4) : [];
    if (! $UI.initComplete) {
      show = "show";
      hide = "hide";
      args = [];
    }
    elem.hidden2(!test);
    if (! $UI.initComplete)
      elem[test ? "hide" : "show"].apply(elem);
    elem[test ? show : hide].apply(elem, args);
  }

  function toggleChain(name, elem, test, show, hide, duration) {
    if (!toggleQ[name])
      toggleQ[name] = [[],[]];
    toggleQ[name][test ? 1 : 0].push(
      partial(toggle, elem, test, show, hide, duration));
  };

  var doers = {
    "do-set-val" :
      function(match, val, elem, test, refval) {
        if (test && !loading && elem.val() != refval) {
          elem.val(refval).qEvent();
        }
      },

    "do-set-text" :
      function(match, val, elem, test, refval) {
        if (test)
          elem.text(refval);
      },

    "do-set-check" :
      function(match, val, elem, test, refval) {
        if (!loading)
          elem.checked(!test).qEvent();
      },

    "do-set-attr" :
      function(match, val, elem, test, refval) {
        if (test && refval)
          elem.attr(val, refval);
        else
          elem.removeAttr(val);
      },

    "do-toggle" :
      function(match, val, elem, test) {
        toggle(elem, test, "show", "hide", 0);
      },

    "do-toggle-hide" :
      function(match, val, elem, test) {
        if (!test)
          toggle(elem, test, "show", "hide", 0);
      },

    "do-toggle-show" :
      function(match, val, elem, test) {
        if (test)
          toggle(elem, test, "show", "hide", 0);
      },

    "do-fade" :
      function(match, val, elem, test) {
        toggle(elem, test, "fadeIn", "fadeOut", val || "fast");
      },

    "do-fade-hide" :
      function(match, val, elem, test) {
        if (!test)
          toggle(elem, test, "fadeIn", "fadeOut", val || "fast");
      },

    "do-fade-show" :
      function(match, val, elem, test) {
        if (test)
          toggle(elem, test, "fadeIn", "fadeOut", val || "fast");
      },

    "do-slide" :
      function(match, val, elem, test) {
        toggle(elem, test, "slideDown", "slideUp", val || "fast");
      },

    "do-slide-hide" :
      function(match, val, elem, test) {
        if (!test)
          toggle(elem, test, "slideDown", "slideUp", val || "fast");
      },

    "do-slide-show" :
      function(match, val, elem, test) {
        if (test)
          toggle(elem, test, "slideDown", "slideUp", val || "fast");
      },

    "do-chain-slide(-(.*))?" :
      function(match, val, elem, test) {
        toggleChain(val, elem, test, "slideDown", "slideUp", match[2] || "fast");
      },

    "do-chain-fade(-(.*))?" :
      function(match, val, elem, test) {
        toggleChain(val, elem, test, "fadeIn", "fadeOut", match[2] || "fast");
      },
  };

  $UI.init.push(function() {
    loading = false;
  });

  $UI.process.push(function(elem, test, refval) {
    var actions = filter(partial(re, _, "^do-"),
                         map(first, outof(elem.attrMap())));
    if (! actions.length)
      elem.attr("do-toggle", "");
    $UI.dispatch(doers, elem, test, refval);
  });

  $UI.finalize.push(function(q) {
    map(function(x) {
      return !loading
        ? reduce(partial, constant(true), reverse(apply(concat, x[1])))()
        : map(apply, apply(concat, x[1]));
    }, outof(toggleQ));
    toggleQ = {};
    loading = false;
  });

})(jQuery);

/**
 * "Disabled" elements module---uses 'readonly' because events on input
 * elements with the 'disabled' attribute do not sink any event.
 */
(function($) {

  $UI.accept.push(function(elem) {
    return !elem.is("[readonly]");
  });

})(jQuery);

/**
 * Positioning module
 */
(function($) {

  var pos = {
    "position(-(.*))" :
      function(match, val, elem, test) {
        var ref = $("[name='"+args.name+"']").filter($.invoke("isVisible")),
            off = ref.offset();

        elem.css({height:ref.height()+"px"});
        off.left += ref.outerWidth();
        elem.offset(off);

        console.log("args", args);
      }
  };

  $UI.process.push(function(elem, test) {
    $UI.dispatch(pos, elem, test);
  });

})(jQuery);

/**
 * Widget module
 */
(function($) {

  var w = {}, syms;

  var gensyms = {
    "gensym(-(.*))" :
      function(match, val, elem) { syms[match[2]] = $.gensym() }
  };

  var setsyms = {
    "sym(-(.*))" :
      function(match, val, elem) {
        if (syms[val])
          elem.attr(match[2], syms[val]);
      }
  };

  var widgets = {
    "widget-def" :
      function(match, val, elem) {
        var cmp = {
          js:   elem.find("script").remove().text() || "function() {}",
          dom:  elem.removeAttr("widget-def").attr("widget-inst", val)
        };
        w[val] = makeConstructor(val, cmp);
        elem.remove();
      },

    "widget" :
      function(match, val, elem) {
        var e = (new w[val](elem))._dom;
        elem.replaceWith(e);
        e.prepare();
      }
  };
      
  function doApply(_js, jQuery, $, _obj, _args, _ref, sym) {
    var _f, _i;
    for (_i in _ref)
      eval("var "+_i+" = _ref."+_i);
    eval("_f = "+_js);
    _f.apply(_obj, _args);
  };

  function Widget() {
  }

  function makeConstructor(name, cmp) {
    var result = function() {
      var argv  = vec(arguments),
          obj   = this,
          attrs = {},
          ref   = {};

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
                           .not($("[widget-inst] *", obj._dom).get())
                           .not($("* [widget-inst]", context).get());
        else 
          return $(obj._dom).find("*")
                     .andSelf()
                     .filter(selector)
                     .not($("[widget-inst] *", obj._dom).get())
                     .not($("* [widget-inst]", obj._dom).get());
      };

      $.extend($fake, $);
      $fake.prototype = $fake.fn;
      $fake.component = cmp;

      if (cmp) {
        obj._dom = cmp.dom.clone();
        obj.$    = $fake;
        obj._dom.find("*").add(obj._dom).filter(function() {
          return $(this).is("[ref]");
        }).each(function() {
          var r = $(this).attr("ref");
          if (r)
            ref[r] = $(this);
        });
        
        syms = {};

        obj._dom.find("*").add(obj._dom).each(function() {
          $UI.dispatch(gensyms, $(this));
        });
        obj._dom.find("*").add(obj._dom).each(function() {
          $UI.dispatch(setsyms, $(this));
        });

        // Prevent endless loops
        argv[0].removeAttr("widget");

        // Parse the placeholder to create template data
        attrs = argv[0].attrMap();
        attrs[':content'] = argv[0].children();

        // Copy attributes from placeholder to widget instance
        map(function(x) {
          if (! x[0].match(/^:/) && ! obj._dom.is("["+x[0]+"]"))
            obj._dom.attr(x[0], x[1]);
        }, outof(argv[0].attrMap()));

        // Fill the widget as an inline template
        obj._dom.fillTemplate(attrs);

        // Run the widget constructor
        doApply(cmp.js, $fake, $fake, obj, argv, ref, into({}, outof(syms)));
      } else {
        throw "can't find widget: "+name;
      }
    };

    result.prototype = new Widget();
    return result;
  };

  $UI.init.unshift(function() {
    $("body").find("[widget-def]").each(function() {
      $UI.dispatch(widgets, $(this));
    });
  });

  $UI.prepare.push(function(elem) {
    $UI.dispatch(widgets, elem);
  });

})(jQuery);

/**
 * Periodic interval trigger module
 */
(function($) {

  var interval = {
    "interval" :
      function(match, val, elem) {
        setInterval(function() {
          if (! elem.hidden2())
            elem.trigger(elem.listen());
        }, val);
      }
  };

  $UI.prepare.push(function(elem) {
    $UI.dispatch(interval, elem);
  });

})(jQuery);

/**
 * Back button / deep linking module
 */
(function($) {

  var addrQ   = [],
      loading = true,
      saved   = window.location.hash.replace(/^#/,"");

  var count = 0;
  var address = {
    "bind-url" :
      function(match, val, elem) {
        loading = true;
        $.address.change(function(event) {
          var n = event.path,
              q = event.parameters,
              r = elem.paramsVisible(),
              i, v;
          if (n == elem.attr("name")) {
            for (i in q) {
              q[i] = decodeURIComponent(q[i]);
              if (q[i] != r[i]) {
                v = elem.byName(i);
                if (v.type() != "RADIO" && v.type() != "CHECKBOX")
                  v.val(q[i]);
                if (v.type() == "RADIO")
                  v.filter(function() { return $(this).val() == q[i] })
                    .qEvent();
                else
                  v.qEvent();
              }
            }
            elem.qEvent();
            $UI.run();
          }
        });

        elem.submit(function() {
          var a = $.address.value(),
              b = elem.attr("name")+"?"+$.param2(elem.paramsVisible());
          if (a != b)
            setTimeout(function() { $.address.value(b) }, 0);
        });
      }
  };

  $UI.init.push(function() {
    $.address.wrap(true);
    
    function setInitialHash(hash) {
      if (!hash)
        return;
      if ($UI.initComplete && !loading)
        $.address.value(hash);
      else
        setTimeout(partial(setInitialHash, hash), 0);
    }

    setTimeout(partial(setInitialHash, saved), 0);
  });

  $UI.prepare.push(function(elem) {
    $UI.dispatch(address, elem);
  });

  $UI.finalize.push(function(q) {
    map(function(x) {
      var a = $.address.value(),
          b = $(x).attr("name")+"?"+$.param2($(x).paramsVisible());
      if (a != b && !loading)
        $.address.value(b);
    }, $.unique(addrQ));
    addrQ   = [];
    setTimeout(function() { loading=false }, 100);
  });

})(jQuery);

/**
 * Form handling & template module
 */
(function($) {
  
  var submitQ = [],
      loading = true,
      tpls    = {};

  function doSubmit(elem) {
    $(elem).trigger("submit");
  }

  var formAction = {
    "get-json" :
      function(match, val, elem) {
        $.ajax({
          url: val,
          dataType: "json",
          data: elem.paramsVisible(),
          async: true,
          success: function(data) {
            $UI.dispatch(formUpdate, elem, data);
          },
          error: function() { console.log("error getting json") }
        });
      },

    "get-wigwam" :
      function(match, val, elem) {
        //console.log("get-wigwam:",[match,val,elem[0]]);
      },

    "get-sections" :
      function(match, val, elem) {
        $UI.dispatch(
          formUpdate,
          elem,
          $("[name='"+val+"']")
            .find("[depends-on='section']")
            .map(function() {
              var id    = $(this).attr("depends-val-eq"),
                  title = $(this).find("h1").text();
              return { id: id, title: title };
            })
        );
      }
  };

  var formUpdate = {
    "fill-template(-(.+))" :
      function(match, val, elem, data) {
        var tname = match[2],
            tpl   = $("body").find("[template='"+tname+"']").get(),
            t     = tpls[tname],
            minl  = min(tpl.length, data.length),
            scrl  = $(window).scrollTop(),
            tmp, i;

        if (tpl.length == 0 || data.length == 0)
          return;
        
        for (i=0; i<minl; i++)
          $(tpl).eq(i).replaceWith(t.clone().fillTemplate(data[i]).prepare());

        if (tpl.length > data.length) {
          $(tpl).each(function(i) {
            if (i >= minl)
              $(this).remove();
          });
        }

        if (data.length > tpl.length) {
          tpl = $("body").find("[template='"+tname+"']").get();
          for (i=minl; i<data.length; i++) {
            tmp = t.clone().fillTemplate(data[i]).prepare();
            tpl = $(tpl).last().after(tmp).end().add(tmp).get();
          }
        }

        $(window).scrollTop(scrl);
        $UI.initComplete = false;
        $UI.run();
      }
  };

  var processDeps = {
    "do-submit" :
      function(match, val, elem, test) {
        if (test && elem.is("form"))
          elem.qEvent();
      }
  };

  function interp(s, name, val) {
    r = new RegExp("([^']|^)\\$\\{([^\\}]+)\\}([^']|$)", "g");
    return s.match(r) ? s.replace(r, "$1"+val) : false;
  }

  $.fn.prepTemplate = function() {
    this.find("*").add(this).each(function() {
      if ($(this).is("[data-fill]"))
        $(this).text("");
      else if ($(this).is("[data-append]"))
        $(this).empty();
    });
  };

  $.fn.fillTemplate = function(data) {
    var jself = $(this);

    this.prepTemplate();

    map(function(x, i) {
      jself.find("*").add(jself).each(function() {
        var e = $(this);
        map(function(x2, i2) {
          var m, tmp;
          if (i2 == "data-append" && x2 == i) {
            e.append($(x));
          } else if (m = i2.match(/^data-fill(-(.+))?$/)) {
            if (!m || x2 != i)
              return;
            if (! m[2])
              e.text(x);
            else if (m[2] == "val")
              e.val(x);
            else
              e.attr(m[2], x);
          } else if (m = i2.match(/^data-interp(-(.+))?$/)) {
            tmp = interp(x2, i, x);
            if (!m || tmp === false)
              return;
            if (! m[2])
              e.text(tmp);
            else if (m[2] == "val")
              e.val(tmp);
            else
              e.attr(m[2], tmp);
          }
        }, e.attrMap());
      });
    }, data);

    return this;
  };

  $UI.init.unshift(function() {
    $("form").submit(false);
    $("[template]").each(function() {
      tpls[$(this).attr("template")] = $(this).clone()
      $(this).hide();
    });
  });

  $UI.prepare.push(function(elem) {
    if ($(elem).is("form"))
      $(elem)
        .bind("submit", function(event) {
          $UI.dispatch(formAction, $(this));
          return false;
        }).qEvent();
  });

  $UI.process.push(function(elem, test) {
    $UI.dispatch(processDeps, elem, test);
  });

  $UI.finalize.push(function(q) {
    map(doSubmit, $.unique(filter(identity, map(function(x) {
      var form  = (x = $(x)).parents("form"),
          isSub = x.type() == "SUBMIT",
          subs  = (x.is("form") ? x : form).find("[type='submit']").size();
      return x.is("form") && !subs
        ? x[0]
        : (form.size() && (!subs || isSub)
            ? form[0]
            : false);
    }, q))));
  });

})(jQuery);

(function($) {

  var attrQ   = [],
      focusQ  = [];

  var depAttr = {
    "depends-attr(-(.*))" :
      function(match, val, elem) {
        $("body").bind("tfd-attr", function(event, attr, ini, fin) {
          if (attr != match[2] || $(event.target).attr("name") != val)
            return;
          elem.doDepends(fin);
        });
        attrQ.push([elem, match[2], val]);
      },

    "depends-focus" :
      function(match, val, elem) {
        $("body").bind("focusin focusout", function(event) {
          if ($(event.target).attr("name") != val)
            return;
          elem.doDepends(event.type == "focusin" ? "1" : "0");
        });
        focusQ.push([elem, val]);
      }
  };

  $UI.prepare.push(function(elem) {
    if (elem.nodeName() == "INPUT" &&
        $.isInArray(elem.type(), ["CHECKBOX","RADIO"]))
      elem.bind("tfd-click", function() { $(this).focus() });
    $UI.dispatch(depAttr, elem);
  });

  $UI.finalize.push(function(q) {
    map(function(x) {
      x[0].doDepends($("[name='"+x[2]+"']").attr(x[1]));
    }, attrQ);
    map(function(x) { x[0].doDepends("0") }, focusQ);
    attrQ.length = focusQ.length = 0;
  });

})(jQuery);
