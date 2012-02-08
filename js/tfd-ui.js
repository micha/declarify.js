
(function($) {

  /*************************************************************************** 
   * Local variables                                                         *
   ***************************************************************************/

  var einputs       = ["input", "select", "textarea"],
      inputs        = reduce(function(x, xs) {
                        return xs.concat([x, "[acts-like='"+x+"']"]);
                      }, [], einputs),
      dateFormat    = "yy-mm-dd",
      validateSetup = {};

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
          jself.checked(! jself.checked());
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

  function getVal(name) {
    var elem = name.jquery
      ? name : $(document).find("[name='"+name+"']").filter(isVisible);

    switch(elem.attr("type")) {
      case "radio":
        return elem
          .filter(elem.is("[acts-like]") ? "[checked]" : ":checked")
          .val();
      case "button":
      case "checkbox":
        return elem.checked() ? 1 : 0;
      default:
        return elem.val();
    }
  }

  function getDefaultAction(elem) {
    if (elem.is("form"))
      return "get-json";
    else
      return "toggle";
  }

  function getDependsActions(elem) {
    var fnames = elem.attr("depends-do")
      ? elem.attr("depends-do").split(",")
      : [ getDefaultAction(elem) ];
    return map(partial(dot, TFD_UI.dependsAction), fnames);
  }

  function doDependsActions(elem, test, val) {
    return map(
      applyto([elem, test, val]),
      filter(identity, getDependsActions(elem)));
  }

  window.getVal = getVal;

  /*************************************************************************** 
   * TFD-UI object                                                           *
   ***************************************************************************/

  var TFD_UI = {

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
        function(elem, match, val) {
          var dep = $("[name='"+val+"']");
          dep.change(function() {
            if ($(this).val() == 1)
              elem.click();
          });
          elem.click(function(event) {
            if (! dep.is(":visible")) {
              dep.show2();
              event.stopImmediatePropagation();
            }
          });
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
              dep   = $("[name='"+name+"']"),
              tst   = window[match[1].replace("-","_")];

          function doChange() {
            var v = getVal(dep);
            return doDependsActions(
              elem,
              (tst(unserialize(v), unserialize(val))),
              v
            );
          }

          dep.change(doChange);
          doChange();
          return elem;
        },

      "depends-on":
        function(elem, match, val) {
          var dep = $("[name='"+val+"']");

          for (var i in elem.attrMap())
            if (i.match(/^depends-val-/))
              return elem;

          function doChange() {
            return doDependsActions(elem, true, getVal(val));
          }

          dep.change(doChange);
          doChange();
          return elem;
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
            $.fillTemplate(val, elem.val());
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
      "toggle": function(elem, test, val) {
        return elem[test ? "show2" : "hide2"]();
      },

      "set-val": function(elem, test, val) {
        if (test) {
          elem.val(val);
          elem.trigger("change");
        }
        return elem;
      },

      "set-text": function(elem, test, val) {
        if (test)
          elem.text(val);
        return elem;
      },

      "set-attr": function(elem, test, val) {
        var attr = elem.attr("set-attr");
        if (test)
          elem.attr(attr, val);
        return elem;
      },

      "get-json": function(elem, test, val) {
        var url   = elem.attr("action"),
            data  = elem.paramsVisible();
        if (test)
          $.getJSON(url, data, function(data) {
            elem.val(data);
            elem.trigger("change");
          });
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

    processElem: function(elem) {
      elem.find("*").add(elem).each(function() {
        if (this == document)
          return;

        var jself = $(this), attrs;

        map(function(x, i) {
          map(function(x2, i2, m) {
            if (m = (new RegExp("^"+i2+"$")).exec(i))
              x2(jself, m, x);
          }, TFD_UI.attrHandler);
        }, jself.attrMap());

        if (jself.is(inputs.join(","))) {
          jself.change(function() {
            jself.parentsUntil("body", "form").trigger("form-update");
          });
        }
      });
    }

  };

  /*************************************************************************** 
   * Global functions                                                        *
   ***************************************************************************/

  window.TFD_UI = TFD_UI;

  /*************************************************************************** 
   * jQuery domready event handler                                           *
   ***************************************************************************/

  $(function() {
    TFD_UI.processElem($(document));

    $("form").submit(function(event) {
      event.preventDefault();
    }).bind("form-update", function() {
      doDependsActions($(this), constant(true), "");
    }).trigger("form-update");

    $("*").filter(":visible").trigger("show");
  });

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

  $.fn.mkOptions = function(opts) {
    var jself = this;
    $.each(opts, function(i,v) {
      jself.append($("<option/>").attr("value", v[0]).text(v[1]));
    });
    return this;  
  };

  $.fn.nodeName = function(n) {
    return (n = $(this).attr("acts-like")) ? n.toUpperCase() : this.nodeName;
  }

  $.fn.options = function() {
    if ($(this).is("[acts-like='select']"))
      return $("[options-for='"+$(this).attr("name")+"']").find("[acts-like='option']");
    else
      return $(this).find("option");
  };

  $.fn.val = (function(orig) {
    return function() {
      var args      = vec(arguments),
          actslike  = this.attr("acts-like");
      if (actslike || this.is("form"))
        if (args.length) {
          if (this.is("form"))
            this.attr("value", JSON.stringify(arguments[0]));
          else if (this.is("[value]"))
            this.attr("value", arguments[0]);
          else
            this.data("actslike_value", arguments[0]);
          return this;
        } else {
          return this.is("form")
            ? JSON.parse(this.attr("value"))
            : (this.is("[value]") 
                ? this.attrMap()["value"]
                : this.data("actslike_value"));
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

  $.fn.show2 = function() {
    var args = vec(arguments);
    this.hidden(false);
    return this.is("[modal]") ? this.dialog("open") : $.fn.show.apply(this, args);
  };

  $.fn.hide2 = function() {
    var args = vec(arguments);
    this.hidden(true);
    return this.is("[modal]") ? this.dialog("close") : $.fn.hide.apply(this, args);
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

  var templatesEnabled  = false;
  var templates         = {};
  var defaultTemplateFn = function(data) {
    var jself = $(this);
    map(function(x, i) {
      jself.find("*").each(function() {
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

    $("[template='"+name+"'][filled]").remove();

    map(function(x) {
      var t = $("[template='"+name+"']").not("[filled]").eq(0),
          e = t.clone(true).attr("filled","filled");
      f.call(e, x);
      t.before(e);
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

})(jQuery);
