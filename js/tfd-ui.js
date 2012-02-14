
(function($) {

  Fundaments.import();

  /*************************************************************************** 
   * Local variables                                                         *
   ***************************************************************************/

  var einputs       = ["input", "select", "textarea"],
      inputs        = reduce(function(x, xs) {
                        return xs.concat([x, "[acts-like='"+x+"']"]);
                      }, [], einputs),
      dateFormat    = "yy-mm-dd",
      validateSetup = {},
      registered    = [];

  /*************************************************************************** 
   * Local (private) functions                                               *
   ***************************************************************************/

  function unserialize(val) {
    if (!val) return "";
    try {
      return $.datepicker.parseDate(dateFormat, val);
    } catch (dateErr) {
      return $.isNaN(Number(val)) ? String(val) : Number(val);
    }
  }

  function serialize(val) {
    return $.type(val) === "date" 
      ? $.datepicker.formatDate(dateFormat, val)
      : String(val);
  }

  function d() {
    console.log("===>");
    map(function(x) {
      console.log(x);
    }, arguments);
    console.log("===>");
  }
        
  function htmlAttrFlag(flag) {
    return function() {
      if (arguments.length) {
        if (arguments[0])
          this.attr(flag, flag);
        else
          this.removeAttr(flag);
        return this;
      }
      return this.is("["+flag+"]");
    }
  }

  /*************************************************************************** 
   * TFD-UI constructorish functions                                         *
   ***************************************************************************/

  function mkJsonForm(elem) {
    return elem;
  }

  function actsLikeInput(elem) {
    switch(elem.attr("type")) {
      case "checkbox":
        return actsLikeInputCheckbox(elem);
      case "radio":
        return actsLikeInputRadio(elem);
      case "button":
        return actsLikeInputButton(elem);
      case "hidden":
        return actsLikeInputHidden(elem);
    }
  }

  function actsLikeInputCheckbox(elem) {
    elem.each(function() {
      var jself = $(this);
      jself.click(function() {
        if (! jself.is("[disabled]")) {
          jself.toggleChecked();
          jself.trigger("change");
        }
      }).css("cursor", "pointer");

      jself.checked(jself.is("[checked]"));
    });
    return elem;
  }

  function actsLikeInputRadio(elem) {
    elem.each(function() {
      var jself = $(this);
      jself.click(function() {
        var name = jself.attr("name");
        if (! jself.is("[disabled]")) {
          $("[name='"+name+"']").each(function() {
            $(this).checked(false);
          });
          jself.checked(true);
          jself.trigger("change");
        }
      }).css("cursor", "pointer");

      jself.checked(jself.is("[checked]"));
    });
    return elem;
  }

  function actsLikeInputButton(elem) {
    elem.each(function() {
      var jself = $(this),
          name  = jself.attr("name");

      jself.click(function() {
        if (! jself.is("[disabled]"))
          jself.trigger("change");
      }).css("cursor", "pointer");
    });
    return elem;
  }

  function actsLikeInputHidden(elem) {
    return elem;
  }

  function actsLikeSelect(elem) {
    function getSelected(options) {
      var selected = options.filter(function() {
        return $(this).selected();
      });

      return (selected.size())
        ? selected
        : options.first().selected(true);
    }

    function doSelect(eselect, edropdown, options, selecteds, selected) {
      eselect.val(selected.attr("value"));
      options.each(function() {
        $(this).selected(false);
      });
      selected.selected(true);
      edropdown.hide2();
      selecteds.each(function() {
        if ($(this).attr("value") == selected.attr("value"))
          $(this).selected(true).show2();
        else
          $(this).selected(false).hide2();
      });
    }

    elem.each(function() {
      var jself     = $(this),
          disabled  = jself.is("[disabled]"),
          dropdown  = $("[options-for='"+jself.attr("name")+"']"),
          options   = jself.options(),
          selecteds = jself.find("[acts-like='option']"),
          selected  = getSelected(options);

      doSelect(jself, dropdown, options, selecteds, selected);

      dropdown.click(function(event) {
        var target    = $(event.target),
            tactslike = target.attr("acts-like"),
            ttype     = target.attr("type"),
            disabled  = jself.is("[disabled]"),
            tdisabled = target.is("[disabled]");

        if (! disabled && $.inArray(event.target, options) != -1) {
          doSelect(jself, dropdown, options, selecteds, target);
          jself.trigger("change");
        }
      });

      jself.click(function(event) {
        if (! disabled)
          dropdown.toggle2();
      });
    
      options.css("cursor", "pointer");
      selecteds.css("cursor", "pointer");
      
      $(document).click(function() {
        if ($.inArray(event.target, selecteds) < 0)
          dropdown.hide2();
      });
    });
  }

  function mkDatePicker(elem) {
    elem.datepicker({
      inline:       true,
      dateFormat:   dateFormat
    });
  }

  function isVisible() {
    return !$(this).hidden();
  }

  function getVisibleFormElems(form) {
    return form.find(inputs.join(",")).filter(isVisible).filter("[name]");
  }

  function getByNameAttr(attr, elem) {
    return $("["+attr+"]").filter(function() {
      return matchesName($(this).attr(attr), elem);
    });
  }

  function getByName(name, e) {
    var segs = name.split("."),
        e    = e ? e : $("body");

    if (segs.length == 1) {
      return $("[name='"+name+"']", e);
    } else {
      return getByName(rest(segs).join("."), getByName(first(segs), e));
    }
  }

  function matchesName(name, elem) {
    return elem.is(getByName(name).get());
  }

  function getVal(name, e) {
    var elem = name.jquery
      ? name : getByName(name).filter(isVisible);

    switch(elem.attr("type")) {
      case "radio":
        return elem.filter(function() { return $(this).checked() }).val();
      case "checkbox":
        return elem.checked() ? 1 : 0;
      default:
        return elem.val();
    }
  }

  function getDefaultAction(elem) {
    return "toggle";
  }

  function getDefaultFormAction(elem) {
    return "get-json";
  }

  function getDependsActions(elem) {
    var fnames = elem.attr("depends-do")
      ? elem.attr("depends-do").split(",")
      : [ getDefaultAction(elem) ];

    return reduce(function(x, xs) {
      return xs.concat(filter(identity, map(function(x2, i2, m) {
        if (m = (new RegExp("^"+i2+"$")).exec(x))
          return partial(x2, elem, m);
      }, TFD_UI.dependsAction))); 
    }, [], fnames);
  }

  function getFormActions(elem) {
    var fnames = elem.attr("form-do")
      ? elem.attr("form-do").split(",")
      : [ getDefaultFormAction(elem) ];
    return map(partial(dot, TFD_UI.formAction), fnames);
  }

  function doDependsActions(elem, test, val) {
    return map(applyto([val, test]), getDependsActions(elem));
  }

  function doFormActions(elem, test, val) {
    return map(
      applyto([elem, test, val]),
      filter(identity, getFormActions(elem)));
  }

  function registerChange(elem, name, handler, doit) {
    var hlr = function(event, target) {
      if (matchesName(name, target))
        handler();
    };

    $("body").bind("actslike_change", hlr);

    elem.each(function(i,v) {
      registered = registered.concat([[this, hlr]]);
    });

    if (doit)
      handler();
  }

  function unregisterChange(elem) {
    map(function(x) {
      map(partial($("body").unbind, "actslike_change"),
          map(partial(dot, _, "1"), filter(dotis(eqq, 0, x), registered)));
    }, elem.get());
    return elem;
  }

  /*************************************************************************** 
   * TFD-UI object                                                           *
   ***************************************************************************/

  var TFD_UI = {

    valTest: {
      eq :
        Fundaments.eq,
      neq :
        Fundaments.neq,
      lt :
        Fundaments.lt,
      le :
        Fundaments.le,
      gt :
        Fundaments.gt,
      ge :
        Fundaments.ge,
      re :
        Fundaments.re,
      nre :
        Fundaments.nre
    },

    attrHandler: {
      "type":
        function(elem, match, val) {
          return TFD_UI.typeHandler[val]
            ? TFD_UI.typeHandler[val](elem)
            : elem;
        },

      "modal":
        function(elem, match, val) {
          elem.dialog({
            autoOpen: false,
            modal: true,
            title: elem.attr("title"),
          });

          return TFD_UI.modalHandler[val]
            ? TFD_UI.modalHandler[val](elem)
            : elem;
        },

      "depends-guard": 
        function(elem, match, name) {

          function doChange() {
            if (getVal(name) == 1)
              elem.click();
          }

          function doClick(event) {
            var dep = getByName(name);
            if (! dep.is(":visible")) {
              dep.show2();
              event.stopImmediatePropagation();
            }
          }

          elem.click(doClick);

          return elem.registerChange(name, doChange, false);
        },

      "acts-like": 
        function(elem, match, val) {
          switch(val) {
            case "input":
              return actsLikeInput(elem);
            case "select":
              return actsLikeSelect(elem);
          }
          return elem;
        },

      "depends-val-(.*)": 
        function(elem, match, val) {
          var name  = elem.attr("depends-on"),
              tst   = TFD_UI.valTest[match[1].replace("-","_")];

          function doChange() {
            var v = getVal(name);
            return doDependsActions(
              elem,
              (tst(unserialize(v), unserialize(val))),
              v
            );
          }

          return elem.registerChange(name, doChange, true);
        },

      "depends-on":
        function(elem, match, name) {
          for (var i in elem.attrMap())
            if (i.match(/^depends-val-/))
              return elem;

          function doChange() {
            return doDependsActions(elem, true, getVal(name));
          }

          return elem.registerChange(name, doChange, true);
        },

      "val-(.*)": 
        function(elem, match, val) {
          return elem;
        },

      "template":
        function(elem, match, val) {
          if (! templatesEnabled)
            return;
          elem.hide2();
          return elem;
        },

      "fill-template":
        function(elem, match, val) {
          if (! templatesEnabled)
            return;

          function doChange() {
            map(partial($.fillTemplate, _, elem.val()), val.split(","));
          }

          elem.change(doChange);
          doChange();

          return elem;
        },

      "interval":
        function(elem, match, val) {
          $.setInterval(function() { elem.trigger("change") }, val);
          return elem;
        },
    },

    dependsAction: {
      "toggle":
        function(elem, match, val, test) {
          return elem[test ? "show2" : "hide2"]();
        },

      "toggle-(.*)":
        function(elem, match, val, test) {
          return elem[test ? "show2" : "hide2"](match[1]);
        },

      "scroll-top":
        function(elem, match, val, test) {
          $(document).scrollTop(0);
          return elem;
        },

      "set-val":
        function(elem, match, val, test) {
          if (test) {
            elem.val(val);
            elem.trigger("change");
          }
          return elem;
        },

      "set-text":
        function(elem, match, val, test) {
          if (test)
            elem.text(val);
          return elem;
        },

      "set-attr-(.*)":
        function(elem, match, val, test) {
          if (test)
            elem.attr(match[1], val);
          return elem;
        }
    },

    formAction: {
      "get-json": function(elem, test, val) {
        var url   = elem.attr("action"),
            data  = elem.paramsVisible();

        if (test && url)
          $.getJSON(url, data, function(data) {
            elem.val(data);
            elem.trigger("change");
          });
        else
          elem.trigger("change");

        return elem;
      },

      "parse-page": function(elem, test, val) {
        var parser  = elem.attr("action"),
            data    = elem.paramsVisible();

        if (test && parser && TFD_UI.formAction["parse-page"][parser])
          TFD_UI.formAction["parse-page"][parser](elem, data);

        return elem;
      }
    },

    typeHandler: {
      "date": function(elem) {
        if (elem[0].nodeName == "INPUT")
          mkDatePicker(elem);
        return elem;
      }
    },

    modalHandler: {
      "plain": function(elem) {
        elem.dialog("option", { buttons: {}, close: function() {} });
      },

      "confirm": function(elem) {
        elem.dialog("option", {
          buttons: {
            "Yes": function() {
              elem.val("1");
              elem.trigger("change");
              elem.dialog("close");
            },
            "No": function() { 
              elem.val("0");
              elem.trigger("change");
              elem.dialog("close");
            }
          },
          close: function() {}
        });
      },

      "alert": function(elem) {
        elem.dialog("option", {
          buttons: { "Ok": function() { elem.dialog("close") } },
          close: function() {}
        });
      }
    },

    preprocess :
      function() {
        if (templatesEnabled)
          $(document).find("[template]").each(function() {
            defaultTemplateCleanFn($(this));
          });
      },

    postprocess :
      function() { $("*").filter(":visible").trigger("show") },

    process :
      function() { TFD_UI.processElem($(document)) },

    init :
      function() {
        modalsEnabled = false;
        TFD_UI.preprocess();
        TFD_UI.process();
        TFD_UI.postprocess();
        setTimeout(function() { modalsEnabled = true }, 100);
      },

    processElem :
      function(elem) {
        elem.find("*").add(elem).each(function() {
          if (this == document)
            return;

          var jself = $(this);

          map(function(x, i) {
            map(function(x2, i2, m) {
              if (m = (new RegExp("^"+i2+"$")).exec(i))
                x2(jself, m, x);
            }, TFD_UI.attrHandler);
          }, jself.attrMap());

          if (jself.is(inputs.join(","))) {
            jself.change(function() {
              var form = jself.parentsUntil("body", "form");
              if (form.size() && ! form.find("[type='submit']").size())
                jself.parentsUntil("body", "form").submit();
            });
          }

          if (jself.is("form"))
            jself.submit(function(event) {
              $(this).trigger("form-update");
              event.preventDefault();
            }).bind("form-update", function() {
              doFormActions($(this), constant(true), "");
            }).trigger("form-update");

            
          if (jself.is("input[type='button']"))
            jself.click(function() { $(this).trigger("change") });

          if (templatesEnabled && jself.is("[template]"))
            jself.hide2();

          jself.change(function(event) {
            $("body").trigger("actslike_change", [jself]);
            event.stopPropagation();
          });

        });
      }

  };

  TFD_UI.formAction["parse-page"]["outline"] = function(elem, data) {
    elem.val(map(function(x, i) {
      if (! $(x).attr("id"))
        $(x).attr("id", "actslike_anchor-"+i);
      return { heading: $(x).text(), link: "#"+$(x).attr("id") };
    }, $("h1,h2,h3,h4,h5,h6").get())).trigger("change");
  };

  /*************************************************************************** 
   * Global functions                                                        *
   ***************************************************************************/

  window.TFD_UI = TFD_UI;

  window.registered     = registered;
  window.getVal         = getVal;
  window.isVisible      = isVisible;
  window.getByName      = getByName;
  window.getByNameAttr  = getByNameAttr;

  /*************************************************************************** 
   * jQuery domready event handler                                           *
   ***************************************************************************/

  $(function() { TFD_UI.init() });

  /*************************************************************************** 
   * jQuery plugins                                                          *
   ***************************************************************************/

  $.fn.attrMap = function() {
    var ret = {};
    $.each(this.get(0).attributes, function(i,attr) {
      ret[attr.nodeName] = attr.nodeValue;
    });
    return ret;
  };

  $.fn.paramsVisible = function() {
    var ret = {};

    $.each(getVisibleFormElems(this), function() {
      var input = $(this);
      ret[input.attr("name")] = true;
    });

    for (var i in ret)
      ret[i] = getVal(i);

    return ret;
  };

  $.fn.reset = function() {
    this.find(inputs.join(",")).val(null);
    return this;
  };

  $.fn.nodeName = function(n) {
    return (n = $(this).attr("acts-like")) ? n.toUpperCase() : this[0].nodeName;
  }

  $.fn.options = function() {
    if ($(this).is("[acts-like='select']")) {
      return getByNameAttr("options-for", $(this))
        .find("[acts-like='option']");
    } else
      return $(this).find("option");
  };

  $.fn.val = (function(orig) {
    return function() {
      var args      = vec(arguments),
          actslike  = this.attr("acts-like");
      if (actslike || this.is("form"))
        if (args.length) {
          if (this.is("[value]"))
            this.attr("value", arguments[0]);
          else
            this.data("actslike_value", arguments[0]);
          return this;
        } else {
          return this.is("[value]")
            ? this.attrMap()["value"]
            : this.data("actslike_value");
        }
      else
        return orig.apply(this, args);
    };
  })($.fn.val);

  $.each(
    ["show", "toggle", "toggleClass", "addClass", "removeClass"],
    function() {
      $.fn[this] = (function(orig) {
        return function() {
          var hidden = this.find(":hidden").add(this.filter(":hidden")),
              args   = vec(arguments),
              result = orig.apply(this, args);
          hidden.filter(":visible").each(function(){
              $(this).triggerHandler("show");
          });
          return result;
        };
      })($.fn[this]);
    }
  );

  $.fn.hidden = function() {
    if (arguments.length)
      this.data("actslike_hidden", arguments[0]);
    return this.data("actslike_hidden");
  }

  $.fn.show2 = function(effect) {
    var args = vec(arguments),
        op;

    switch (effect) {
      case "slide":
        op = "slideDown";
        break;
      case "fade":
        op = "fadeIn";
        break;
      default:
        op = "show";
    }

    if (this.is("[modal]") && ! modalsEnabled)
      return this;

    this.hidden(false);
    return this.is("[modal]") ? this.dialog("open") : $.fn[op].apply(this, args);
  };

  $.fn.hide2 = function(effect) {
    var args = vec(arguments),
        op;

    switch (effect) {
      case "slide":
        op = "slideUp";
        break;
      case "fade":
        op = "fadeOut";
        break;
      default:
        op = "hide";
    }

    if (this.is("[modal]") && ! modalsEnabled)
      return this;

    this.hidden(true);
    return this.is("[modal]") ? this.dialog("close") : $.fn[op].apply(this, args);
  };

  $.fn.toggle2 = function() {
    var args = vec(arguments), viz = this.is(":visible");
    return $.fn[viz ? "hide2" : "show2"].apply(this, args);
  };

  $.fn.checked = function() {
    if (arguments.length) {
      this.data("actslike_checked", arguments[0]);
      if (arguments[0])
        this.attr("checked", "checked");
      else
        this.removeAttr("checked");
      return this;
    }
    return this.is(":checked") || this.data("actslike_checked");
  };

  $.fn.toggleChecked = function() {
    this.checked(! this.checked());
    return this;
  };

  $.fn.selected = htmlAttrFlag("selected");

  $.fn.disabled = htmlAttrFlag("disabled");

  $.fn.initialVal = function() {
    if (arguments.length) {
      this.data("initial-val", arguments[0]);
      return this;
    }
    return this.data("initial-val");
  };

  var templatesEnabled  = true;
  var modalsEnabled     = false;
  var templates         = {};
  var defaultTemplateFn = function(data) {
    var jself = $(this);
    map(function(x, i) {
      jself.find("*").add(jself).each(function() {
        var e = $(this);
        map(function(x2, i2) {
          var m = i2.match(/^data-fill(-(.*))?$/);
          if (!m || x2 != i)
            return;
          if (! m[2])
            e.text(serialize(x));
          else
            e.attr(m[2], x);
        }, e.attrMap());
      });
    }, data);
  };

  var defaultTemplateCleanFn = function(elem) {
    elem.find("*").add(elem).each(function() {
      if ($(this).is("[data-fill]"))
        $(this).text("");
    });
  };

  $.fn.registerChange = function(name, handler, doit) {
    return registerChange(this, name, handler, doit);
  }

  $.fn.unregisterChange = function() {
    return unregisterChange(this);
  };

  $.template = function(name, f) {
    if ($.isBool(name))
      templatesEnabled = name;
    else
      templates[name] = f;
  };

  $.fillTemplate = function(name, data) {
    if (! templatesEnabled)
      return;

    var f = templates[name] || defaultTemplateFn,
        t = $(document).scrollTop();

    $("[template='"+name+"'][filled]").unregisterChange().remove();

    map(function(x) {
      var t = $("[template='"+name+"']").not("[filled]").eq(0),
          e = t.clone().attr("filled","filled");
      f.call(e, x);
      t.before(e);
      TFD_UI.processElem(e);
      e.show2();
    }, data);

    $(document).scrollTop(t);
  };

  $.setInterval = function(f, t, start) {
    if (start)
      f();
    return setInterval(f, t);
  };

  $.clearInterval = function(id) {
    return clearInterval(id);
  }

  $.isBool = function(x) {
    return x===true || x===false;
  }

  $.registered = function() {
    return registered;
  };

})(jQuery);

