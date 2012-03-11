
Fundaments.import();

/**
 * Core module
 */
(function($) {

  // True when initial processing of DOM is complete
  var initComplete = false;

  // Event queue
  var eventQ  = [];

  // Gensym names last assigned index
  var syms    = 0;

  // Data stored on elements
  var D_CHK   = "actslike_checked",
      D_VAL   = "actslike_value",
      D_HID   = "actslike_hidden",
      D_SAV   = "actslike_savedval";
      D_SAVC  = "actslike_savedchecked";

  // Special attributes
  var A_ACT   = "acts-like",
      A_DEP   = "depends-on",
      A_TYP   = "type",
      A_PHA   = "phase";

  // Input types that are "checked" or "unchecked"
  var C_TYP   = ["CHECKBOX", "RADIO"];

  // Elements that have values
  var E_VAL   = ["INPUT", "SELECT", "TEXTAREA", "BUTTON"];

  // Input types that normally change on click event
  var E_CLK   = ["BUTTON", "RADIO", "CHECKBOX"];

  $.gensym = function() {
    return "TFD_"+(++syms);
  };

  // True if `needle` is in `haystack` array
  $.isInArray = function(needle, haystack) {
    return $.inArray(needle, haystack) >= 0;
  };

  $.unparam = function(str) {
    return into({}, map(function(x) {
      return map(decodeURIComponent, x.split("=").concat([""]));
    }, !!str ? str.replace(/\+/gi," ").split("&") : []));
  };

  $.invoke = function(meth) {
    var args = rest(arguments);
    return function() {
      return $(this)[meth].apply($(this), args);
    }
  };

  $.fn.val = (function(orig) {
    return function() {
      var a = this.actsLike();
      return a
        ? ((arguments.length)
            ? this.data(D_VAL, arguments[0])
            : this.data(D_VAL))
        : orig.apply(this, vec(arguments));
    };
  })($.fn.val);

  // Get a map of the attributes and values
  $.fn.attrMap = function() {
    var ret = {};
    $.each(this.get(0).attributes, function(i,attr) {
      ret[attr.nodeName] = attr.nodeValue;
    });
    return ret;
  };

  // Get the html of the element, not just the contents.
  $.fn.outerHtml = function() {
    return this.eq(0).clone().wrap("<div/>").parent().html();
  };

  // What this element acts like (if anything)
  $.fn.actsLike = function() {
    var a;
    return (a = this.attr(A_ACT)) ? a.toUpperCase() : "";
  };

  // True if this element has the `attr` attribute
  $.fn.hasAttr = function(attr) {
    return this.is("["+attr+"]");
  };

  // The tag name of this element
  $.fn.nodeName = function() {
    return this[0].nodeName.toUpperCase();
  };

  // The tag name of this element or the tag it acts like
  $.fn.nodeName2 = function() {
    var n;
    return (n = this.actsLike()) ? n : this.nodeName();
  };

  // The type attribute of this element
  $.fn.type = function() {
    var n;
    return (n = this.attr(A_TYP)) ? n.toUpperCase() : "";
  };

  // Gets or sets the checked state of this element (real)
  $.fn.checked = function() {
    if (arguments.length) {
      this.attr("checked", !! arguments[0]);
      if (this.type() == "CHECKBOX")
        this.val(arguments[0] ? "1" : "0");
      return this;
    }
    if (this.is("[checked]"))
      this.addClass("checked")
    else
      this.removeClass("checked");
    return this.is("[checked]");
  };

  $.fn.checked2 = function() {
    return isChecked = this.actsLike() 
      ? this.checked()
      : this.is(":checked");
  };

  // Toggles the checked state of this element (real)
  $.fn.toggleChecked = function() {
    return this.checked(! this.checked());
  };

  $.fn.isVisible = function() {
    return ! this.hidden2();
  };

  $.fn.hidden2 = function() {
    if (arguments.length)
      return this.data(D_HID, !! arguments[0]);
    return this.data(D_HID);
  };

  $.fn.listen = function() {
    var n = this.nodeName2(),
        a = this.actsLike(),
        t = this.type();
    return ((a == "INPUT" && $.isInArray(t, E_CLK)) ||
            (n == "INPUT" && t == "BUTTON") || n === "BUTTON")
      ? "click"
      : ($.isInArray(n, E_VAL) ? "change" : "");
  };

  $.fn.getValFn = function() {
    var n = this.nodeName2(),
        t = this.type();
    return $.isInArray(t, C_TYP)
      ? "checked" : ($.isInArray(n, E_VAL) ? "val" : "");
  };

  $.fn.getVal = function() {
    var op = this.getValFn();
    return op ? $(this)[op]() : "";
  };

  $.fn.setVal = function(val) {
    var op = this.getValFn();
    return op ? this[op](val) : this;
  };

  $.fn.getSavedVal = function() {
    return this.data(D_SAV);
  };

  $.fn.setSavedVal = function(val) {
    return this.data(D_SAV, val);
  };

  $.fn.getSavedCheck = function() {
    return this.data(D_SAVC);
  };

  $.fn.setSavedCheck = function(val) {
    return this.data(D_SAVC, !! val);
  };

  $.fn.paramsVisible = function() {
    var ret = {},
        obj = first(arguments);
    this.find("[name]").filter(isVisible).each(function() {
      var jself = $(this),
          type  = jself.type(),
          name  = jself.attr("name"),
          saved = [jself.checked(), jself.val()];
      if (! obj) {
        if ((type == "RADIO" && jself.checked()) || type != "RADIO")
          ret[name] = jself.val();
      } else if (name in obj) {
        if (type == "RADIO")
          jself.checked(obj[name] == jself.val() && !jself.checked());
        else if (type == "CHECKBOX")
          jself.checked(!! Number(obj[name]));
        else
          jself.val(obj[name]);
        if (jself.checked() != saved[0] || jself.val() != saved[1])
          jself.qEvent();
      }
    });
    return obj ? this : ret;
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
            setTimeout(function() { jself.trigger("tfd-"+event.type) });

          if (event.type != e)
            return;

          event.stopPropagation();

          jself.doEvent(event);
        }).qEvent()
      : this;
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

  function getByName(name, e) {
    return $("[name='"+name+"']", e ? e : $("body")).filter(isVisible);
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
      ? e.filter(function() { return $(this).checked() }).val()
      : (e.type() == "CHECKBOX" 
          ? (e.checked() ? "1" : "0")
          : e.val());
  }

  function predicate(elem, val) {
    return reduce(and, true, map(applyto([$(elem), val]), predicate.fns));
  }

  function doDepends(elem, val) {
    var test = predicate((elem = $(elem)), val);
    map(partial(apply, _, [elem, test, val]), doDepends.fns);
  }

  function prepare(elem) {
    elem = $(elem).find("*").each($.invoke("initVal"))
                            .each($.invoke("initEvent"));
    map(partial(apply, _, [elem]), prepare.fns);
  }

  function accept(elem) {
    return apply(and, map(applyto([elem]), accept.fns));
  }

  function bubble(elem) {
    return apply(and, map(applyto([$(elem)]), bubble.fns));
  }

  function process(elem) {
    var name = (elem = $(elem)).attr("name"),
        deps = getByAttr(A_DEP, name),
        accp = true;
    if (initComplete && (accp = elem.startTransaction()))
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
    $(window).scrollTop(t);
    return (initComplete = true);
  }

  function init() {
    map(apply, init.fns);
  }

  $(function() {
    init();
  });

  window.$UI  = {
    q:            eventQ,
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
  };

  var matcher = {
    "depends-val(-(.*))" :
      function(match, val1, elem, val2) {
        return test[match[2]](val1, val2);
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
    if (loading) {
      show = "show";
      hide = "hide";
      args = [];
    }
    elem.hidden2(test);
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
        console.log("refval", vec(arguments));
        if (test)
          elem.val(refval).qEvent();
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

  var w = {};

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
      
  function doApply(_js, jQuery, $, _obj, _args, _ref) {
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
        doApply(cmp.js, $fake, $fake, obj, argv, ref);
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
              if (q[i] != r[i]) {
                v = elem.find("[name='"+i+"']");
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
              b = elem.attr("name")+"?"+$.param(elem.paramsVisible());
          if (a != b && !loading)
            setTimeout(function() { $.address.value(b) }, 0);
        });
      }
  };

  $UI.init.push(function() {
    $.address.wrap(true);
  });

  $UI.prepare.push(function(elem) {
    $UI.dispatch(address, elem);
  });

  $UI.finalize.push(function(q) {
    map(function(x) {
      var a = $.address.value(),
          b = $(x).attr("name")+"?"+$.param($(x).paramsVisible());
      if (a != b && !loading)
        $.address.value(b);
    }, $.unique(addrQ));
    addrQ   = [];
    setTimeout(function() { loading=false }, 1000);
  });

})(jQuery);

/**
 * Form handling & template module
 */
(function($) {
  
  function doSubmit(elem) {
    $(elem).trigger("submit");
  }

  var formAction = {
    "get-json" :
      function(match, val, elem) {
        $.getJSON(val, elem.paramsVisible(), function(data) {
          $UI.dispatch(formUpdate, elem, data);
        });
      },
    "get-wigwam" :
      function(match, val, elem) {
        //console.log("get-wigwam:",[match,val,elem[0]]);
      },
  };

  var formUpdate = {
    "fill-template(-(.+))" :
      function(match, val, elem, data) {
        var tpl   = $("body").find("[template='"+match[2]+"']").get(),
            minl  = min(tpl.length, data.length),
            tmp, i;

        if (tpl.length == 0 || data.length == 0)
          return;
        
        for (i=0; i<minl; i++)
          $(tpl).eq(i).fillTemplate(data[i]).prepare();

        if (tpl.length > data.length) {
          $(tpl).each(function(i) {
            if (i >= minl)
              $(this).remove();
          });
        }

        if (data.length > tpl.length) {
          for (i=minl; i<data.length; i++) {
            tmp = $(tpl).last().clone().fillTemplate(data[i]).prepare();
            tpl = $(tpl).last().after(tmp).end().add(tmp).get();
          }
        }

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

  $.fn.fillTemplate = function(data) {
    var jself = $(this);

    map(function(x, i) {
      jself.find("*").add(jself).each(function() {
        var e = $(this);
        map(function(x2, i2) {
          var m = i2.match(/^data-fill(-(.*))?$/);
          if (!m || x2 != i)
            return;
          if (! m[2])
            e.text(x);
          else
            e.attr(m[2], x);
        }, e.attrMap());
      });
    }, data);

    return this;
  };

  $UI.init.unshift(function() {
    $("form").submit(constant(false));
  });

  $UI.prepare.push(function(elem) {
    if (elem.is("form")) {
      elem.submit(function(event) {
        $UI.dispatch(formAction, elem);
        return false;
      });
    }
  });

  $UI.process.push(function(elem, test) {
    $UI.dispatch(processDeps, elem, test);
  });

  $UI.finalize.push(function(q) {
    map(doSubmit, $.unique(filter(identity, map(function(x) {
      var form  = (x = $(x)).parents("form"),
          isSub = x.type() == "SUBMIT",
          subs  = form.find("[type='submit']").size();
      return x.is("form") || (form.size() && (!subs || isSub))
        ? form[0]
        : null;
    }, q))));
  });

})(jQuery);
